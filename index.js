const express = require("express");

let fetch;

import("node-fetch").then((module) => {
  fetch = module.default;
});

const app = express();

app.use(express.static("public")); // Serve your HTML/JS files

app.get("/fetch-supporters", async (req, res) => {
  const accessToken = "B64wlAW7BTql9LUL1U0T_FgyRSC2vXz80RdcsHbFsoQ"; // Replace with your actual access token
  const campaignId = "6979978"; // Replace with your actual Campaign ID

  const url = new URL(
    `https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/members`
  );

  // Add query parameters for members
  const params = {
    "fields[member]": "full_name,patron_status",
    "fields[user]": "full_name,email", // Make sure you have the necessary permissions to access email
    include: "user", // Include user details of the members
  };

  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);