## Patreon Banner
This project includes two parts:

1. A Node.js script that fetches your Patreon members and their details.
2. A website that displays the members' names in a banner format.

This project is based on the deprecated https://github.com/AssistantApps/Patreon-Banner

Unlike `patreon-banner`, this project doesn't use OAuth2.0 but downloads the members' data directly from the Patreon API using a personal access token. You will need to create a new application in your Patreon account and get an access token.


## Setup Instructions

### 0. Prerequisites
- Node.js 
- npm (Node Package Manager)
- A Patreon account
- A web server or Netlify account to host the banner website (optional, for local testing you can use `http-server`)

### 1. Get Your Access Token and Campaign ID

1. Log in to [Patreon Portal](https://www.patreon.com/portal/registration/register-clients) and create a new client. You can name it anything you like.
2. Retrieve your access token from the new client you just created.
3. Obtain your campaign ID by running the following command in your terminal:
   ```
   curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
     "https://www.patreon.com/api/oauth2/v2/campaigns"
   ```
   The response will include your campaign ID, for example:
   ```json
   {"data":[{"attributes":{},"id":1234567,"type":"campaign"}],"meta":{"pagination":{"cursors":{"next":null},"total":1}}}
   ```
  In this example, the campaign ID is `1234567`.
4. Check if your access token and campaign ID are valid, using the following command:

```
curl -G \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  --data-urlencode "include=currently_entitled_tiers" \
  --data-urlencode "fields[member]=full_name,email" \
  --data-urlencode "fields[tier]=title" \
  "https://www.patreon.com/api/oauth2/v2/campaigns/<CAMPAIGN_ID>/members"
```

This command should return a list of members and their details. If you see an error message, double-check your access token and campaign ID.

### 2. Set Up the Project

4. Navigate to the `scripts` directory in your terminal:
    ```
    cd scripts
    ```
6. Create a `.env` file in the `scripts` directory with the following content:
   ```
   PATREON_ACCESS_TOKEN=your_access_token_here
   PATREON_CAMPAIGN_ID=your_campaign_id_here
   ```
7. Install the required Node dependencies:

    ```
    npm install
    ```   

### 3. Fetch Members Data

Navigate to the `scripts` directory in your terminal and run `node fetchMembers.js`:

This will fetch your campaigns and members from the Patreon API and save them in JSON format as `members.json` in the `website/data` folder (it will create one if it doesn't exist). The script also downloads the members' profile images and saves them in the `website/data/img` folder.

### 4. Set Up the Banner in OBS

#### Local Testing


1. Navigate to the `website` directory in your terminal:
   ```
   cd website
   ```
2. Serve the website locally using a simple HTTP server:
   ```
   npx http-server
   ```
3. Open your browser and navigate to `http://localhost:8080` to view the website.
4. In OBS, add a new Browser source and set the URL to `http://localhost:8080`.

#### Deploy to Netlify
1. Create a new repository on GitHub and push your project to it.
2. Go to [Netlify](https://www.netlify.com/) and sign up or log in.
3. Click on "New site from Git" and select your Git provider (e.g., GitHub).
4. Select the repository you just created.
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site" to start the deployment process.
7. Once the deployment is complete, you will receive a unique URL for your site.
8. Copy the URL and paste it into your OBS Browser source settings.