require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs'); // Ensure fs is imported

// https://www.patreon.com/portal/registration/register-clients
const ACCESS_TOKEN = process.env.PATREON_ACCESS_TOKEN;
const CAMPAIGN_ID   = process.env.PATREON_CAMPAIGN_ID;

console.log(`Fetching members for campaign ID:${process.env.PATREON_CAMPAIGN_ID}...`);

// Fetch one page of members, return combined data + next cursor
async function fetchMembersPage(cursor = null) {
  const params = new URLSearchParams({
    include:           'currently_entitled_tiers',
    'fields[member]':  'full_name,email',
    'fields[tier]':    'title'
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
async function getAllMembers(cursor = null, acc = []) {
  const json = await fetchMembersPage(cursor);

  // Build tier-ID → title map
  const tierMap = (json.included || [])
    .filter(obj => obj.type === 'tier')
    .reduce((m, tier) => {
      m[tier.id] = tier.attributes.title;
      return m;
    }, {});

  // Map each member to a flat object
  const pageMembers = (json.data || []).map(member => {
    const tierIds = member.relationships.currently_entitled_tiers.data;
    const tierTitle = tierIds.length
      ? tierMap[tierIds[0].id] ?? 'Unknown'
      : 'Free';
    return {
      name:  member.attributes.full_name,
      email: member.attributes.email,
      tier:  tierTitle
    };
  });

  const all = acc.concat(pageMembers);
  const nextCursor = json.meta?.pagination?.cursors?.next;
  if (nextCursor) {
    return getAllMembers(nextCursor, all);
  }
  return all;
}

// Example usage
(async () => {
  try {
    const patrons = await getAllMembers();
    console.log(`Fetched ${patrons.length} patrons:`);
    console.table(patrons);

    // Save results to a JSON file
    fs.writeFileSync('members.json', JSON.stringify(patrons, null, 2), 'utf-8');
  } catch (err) {
    console.error(err);
  }
})();
