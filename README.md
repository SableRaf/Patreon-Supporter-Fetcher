## Patreon Fetcher
This is a simple script to fetch your Patreon data using the Patreon API. It retrieves your campaigns and members, and saves the data in JSON format.

## Getting Started
1. Log in to your Patreon account and create a new application at [Patreon Developer](https://www.patreon.com/portal/registration/register-clients).
2. Retrieve your access token from the new client you just created.
3. Obtain your campaign ID by running the following command in your terminal:
   ```
   curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
     "https://www.patreon.com/api/oauth2/v2/campaigns"
   ```
   The response will include your campaign ID, for example:
   ```json
   {"data":[{"attributes":{},"id":<YOUR_CAMPAIGN_ID>,"type":"campaign"}],"meta":{"pagination":{"cursors":{"next":null},"total":1}}}
   ```
4. Create a `.env` file in the project root with the following content:
   ```
   PATREON_ACCESS_TOKEN=your_access_token_here
   PATREON_CAMPAIGN_ID=your_campaign_id_here
   ```
5. Install the required Node dependencies:

    ```
    npm install
    ```   

## Running the Script

To run the script, use the following command:

```
node index.js
```

This will fetch your campaigns and members from the Patreon API and save them in JSON format as `members.json`.

## Test the Patreon API

To check if your access token and campaign ID are valid, you can use the following command:

```
curl -G \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  --data-urlencode "include=currently_entitled_tiers" \
  --data-urlencode "fields[member]=full_name,email" \
  --data-urlencode "fields[tier]=title" \
  "https://www.patreon.com/api/oauth2/v2/campaigns/<CAMPAIGN_ID>/members"
```
This command will return a list of members and their details. 