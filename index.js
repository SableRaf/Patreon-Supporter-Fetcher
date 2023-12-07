const express = require("express");

let fetch;

import("node-fetch").then((module) => {
  fetch = module.default;
});

const app = express();

app.use(express.static("public")); // Serve your HTML/JS files

async function fetchAllPatrons(accessToken, campaignId) {
  let allMembers = []; // To store all member objects
  let allUsers = []; // To store all user objects
  let url = new URL(
    `https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/members`
  );

  const params = {
    "fields[member]": "patron_status", // Add other member fields as needed
    "fields[user]": "full_name", // Assuming full_name is a field in the user object
    include: "user", // Include related user object
  };

  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );

  while (url) {
    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();

    allMembers = allMembers.concat(data.data);

    // Include the user objects if they exist
    if (data.included) {
      allUsers = allUsers.concat(
        data.included.filter((item) => item.type === "user")
      );
    }

    url = data.meta.pagination.links?.next
      ? new URL(data.meta.pagination.links.next)
      : null;
  }

  // Return both members and users
  return { members: allMembers, users: allUsers };
}

app.get("/fetch-supporters", async (req, res) => {
  const accessToken = "B64wlAW7BTql9LUL1U0T_FgyRSC2vXz80RdcsHbFsoQ"; // Replace with your actual access token
  const campaignId = "6979978"; // Replace with your actual Campaign ID

  try {
    const { members, users } = await fetchAllPatrons(accessToken, campaignId);
    res.json({ members, users });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);