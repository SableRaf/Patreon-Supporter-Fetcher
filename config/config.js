const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const config = {
  port: process.env.PORT || 3000,
  patreonAccessToken: process.env.PATREON_ACCESS_TOKEN || '',
  patreonCampaignId: process.env.PATREON_CAMPAIGN_ID || '',
};

module.exports = config;