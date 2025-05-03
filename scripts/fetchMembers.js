require('dotenv').config({ path: require('path').join(__dirname, '../config/.env') });
const fetch = require('node-fetch');
const fs = require('fs'); // Ensure fs is imported
const path = require('path');
const { mkdirSync, writeFileSync } = require('fs');
const { createWriteStream } = require('fs');
const https = require('https');
const config = require('../config/config');

// Ensure /data and /data/img directories exist
const dataDir = config.dataDir;
const imgDir = config.imgDir;
mkdirSync(dataDir, { recursive: true });
mkdirSync(imgDir, { recursive: true });

// Download an image and save it locally
async function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(filePath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(filePath, () => reject(err));
    });
  });
}

// https://www.patreon.com/portal/registration/register-clients
const ACCESS_TOKEN = config.patreonAccessToken;
const CAMPAIGN_ID = config.patreonCampaignId;

console.log(`Fetching members for campaign ID: ${CAMPAIGN_ID}...`);

// Fetch one page of members, return combined data + next cursor
async function fetchMembersPage(cursor = null) {
  const params = new URLSearchParams({
    include:           'currently_entitled_tiers,user',
    'fields[member]':  'full_name,patron_status,pledge_relationship_start',
    'fields[tier]':    'title',
    'fields[user]':    'image_url,url'
  });
  if (cursor) params.set('page[cursor]', cursor);

  const url = `https://www.patreon.com/api/oauth2/v2/campaigns/${CAMPAIGN_ID}/members?${params}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
  });
  if (!res.ok) throw new Error(`Patreon API error: ${res.status} ${res.statusText}`);
  return res.json();
}

// Recursively page through all members
async function getAllMembers(cursor = null, acc = [], skipImages = false) {
  const json = await fetchMembersPage(cursor);

  // Build tier-ID → title map
  const tierMap = (json.included || [])
    .filter(obj => obj.type === 'tier')
    .reduce((m, tier) => {
      m[tier.id] = tier.attributes.title;
      return m;
    }, {});

  // Map each member to a flat object
  const pageMembersPromises = (json.data || []).map(async (member) => {
    const tierIds = member.relationships.currently_entitled_tiers.data;
    const tierTitle = tierIds.length
      ? tierMap[tierIds[0].id] ?? 'Unknown'
      : 'Free';

    const user = json.included?.find(
      obj => obj.type === 'user' && obj.id === member.relationships.user.data.id
    );

    const imageUrl = user?.attributes.image_url || null;
    const userId = user?.id || 'unknown';
    const localImageFileName = imageUrl ? `${userId}.jpg` : null;
    const localImagePath = localImageFileName ? path.join(imgDir, localImageFileName) : null;

    // Conditionally download the thumbnail image if it exists
    if (!skipImages && imageUrl && localImagePath) {
      try {
        await downloadImage(imageUrl, localImagePath);
        console.log(`Downloaded image for user: ${userId}`);
      } catch (err) {
        console.error(`Failed to download image for user: ${userId}`, err);
      }
    }

    return {
      userID: userId,
      name: member.attributes.full_name,
      tier: tierTitle,
      imageUrl,
      thumbnailFileName: skipImages ? null : localImageFileName,
      url: user?.attributes.url || null,
      joinedDate: member.attributes.pledge_relationship_start
        ? new Date(member.attributes.pledge_relationship_start)
        : null
    };
  });

  const pageMembers = await Promise.all(pageMembersPromises);
  const all = acc.concat(pageMembers);
  const nextCursor = json.meta?.pagination?.cursors?.next;
  if (nextCursor) {
    return getAllMembers(nextCursor, all, skipImages);
  }
  return all;
}

// Example usage
(async () => {
  try {
    const skipImages = process.argv.includes('--skip-images'); // Check for optional argument
    const patrons = await getAllMembers(null, [], skipImages);
    console.log(`Fetched ${patrons.length} patrons:`);

    // Separate free and non-free members
    const freeMembers = patrons.filter(member => member.tier === "Free");
    const nonFreeMembers = patrons.filter(member => member.tier !== "Free");

    // Sort and log non-free members
    const sortedNonFreeMembers = nonFreeMembers.sort((a, b) => a.tier.localeCompare(b.tier));
    console.log("Non-Free Members:");
    console.table(
      sortedNonFreeMembers.map(({ name, tier, url, joinedDate }) => ({
        name,
        tier,
        url,
        joinedDate
      }))
    );

    // Log free members
    console.log("Free Members:");
    console.table(
      freeMembers.map(({ name, url, joinedDate }) => ({
        name,
        url,
        joinedDate
      }))
    );

    // Save results to a JSON file
    const outputFilePath = path.join(dataDir, 'members.json');
    const outputData = {
      lastFetchDate: new Date().toISOString(), // Add the last fetch date
      members: patrons
    };
    writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2), 'utf-8');
    console.log(`Saved members data to ${outputFilePath}`);
  } catch (err) {
    console.error(err);
  }
})();
