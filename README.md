
## Patreon Fetcher
This is a simple script to fetch your Patreon data using the Patreon API. It retrieves your campaigns and members, and saves the data in JSON format.

## Test the Patreon API
The following examples show how to test the Patreon API using `curl`. 

### List all your campaigns
```
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  "https://www.patreon.com/api/oauth2/v2/campaigns"
```

### List all your members
```
curl -G \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  --data-urlencode "include=currently_entitled_tiers" \
  --data-urlencode "fields[member]=full_name,email" \
  --data-urlencode "fields[tier]=title" \
  "https://www.patreon.com/api/oauth2/v2/campaigns/<CAMPAIGN_ID>/members"
```