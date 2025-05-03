## Patreon Banner
This project includes two parts:

1. A Node.js script that fetches your Patreon members and their details.
2. A website that displays the members' names in a banner format.

This project is inspired by the deprecated https://github.com/AssistantApps/Patreon-Banner

Unlike `patreon-banner`, this project doesn't use OAuth2.0 but downloads the members' data directly from the Patreon API using a personal access token. You will need to create a new application in your Patreon account and get an access token.

## Setup Instructions

### 0. Prerequisites
- Node.js and npm
- A Patreon account
- (Optional) A web server or Netlify account for deployment

### 1. Get Your Access Token and Campaign ID

1. Log in to [Patreon Portal](https://www.patreon.com/portal/registration/register-clients) and create a new client. You can name it anything you like.
2. Note the access token from the new client you just created.
3. Retrieve your campaign ID by running the following command in your terminal:
   ```
   curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
     "https://www.patreon.com/api/oauth2/v2/campaigns"
   ```
   Look for the "id" field in the response (e.g., "id": "1234567").

### 3. Save Your Access Token and Campaign ID

1. Create a `.env` file in the `config` directory with the following content:
   ```
   PATREON_ACCESS_TOKEN=your_access_token_here
   PATREON_CAMPAIGN_ID=your_campaign_id_here
   ```
> [!NOTE]
> Replace `your_access_token_here` and `your_campaign_id_here` with the values you obtained in the previous steps.

### 2. Install Dependencies
    ```
    npm install
    ```   

### 4. Fetch Members Data

```
npm run fetch
```

This script will:
- retrieve a list of members and save it as `members.json` in `app/data`
- download the members' profile images and save them in the `app/data/img` folder.

## Local Testing

1. Run `npm run serve` to start a local server. 
2. Open `http://localhost:3000` in your browser to see the banner.

#### Deploy to Netlify

TBD

## Troubleshooting

### Checking That Your Access Token and Campaign ID are Valid

To make sure your access token and campaign ID are valid, run the following command in your terminal

> [!NOTE]
>  replace `<ACCESS_TOKEN>` and `<CAMPAIGN_ID>` with your actual access token and campaign ID.

```
curl -G \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  --data-urlencode "include=currently_entitled_tiers" \
  --data-urlencode "fields[member]=full_name,email" \
  --data-urlencode "fields[tier]=title" \
  "https://www.patreon.com/api/oauth2/v2/campaigns/<CAMPAIGN_ID>/members"
```

This command should return a list of members and their details. If you see an error message, double-check your access token and campaign ID.