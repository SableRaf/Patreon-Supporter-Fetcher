async function fetchSupporters(accessToken) {
  try {
    const response = await fetch(
      `https://www.patreon.com/api/oauth2/v2/campaigns?include=pledges.creator&fields%5Buser%5D=full_name&access_token=${accessToken}`
    );
    const data = await response.json();

    const supporters = data.included
      .filter((item) => item.type === "user")
      .map((user) => ({
        id: user.id,
        name: user.attributes.full_name,
      }));

    const supportersList = document.createElement("ul");
    supporters.forEach((supporter) => {
      const listItem = document.createElement("li");
      listItem.textContent = supporter.name;
      supportersList.appendChild(listItem);
    });

    const supportersDiv = document.getElementById("supporters");
    supportersDiv.appendChild(supportersList);
  } catch (error) {
    console.error("Failed to fetch supporters:", error);
  }
}

/*
Storing sensitive access tokens in localStorage is not secure and is
generally not recommended for production environments. This method
should be used for demonstration purposes only. For a production application,
it is better to use a secure backend to store and manage access tokens.
*/
function getAccessToken() {
  let accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    accessToken = prompt("Please enter your Patreon access token:");
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    } else {
      alert("Access token is required to fetch Patreon supporters.");
      return null;
    }
  }
  return accessToken;
}

const accessToken = getAccessToken();
if (accessToken) {
  fetchSupporters(accessToken);
}
