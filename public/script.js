async function fetchSupporters() {
  try {
    const response = await fetch("/fetch-supporters");
    const { members, users } = await response.json();

    if (members.errors) {
      console.error("Error fetching supporters:", members.errors);
      return;
    }

    if (users.errors) {
      console.error("Error fetching users:", users.errors);
      return;
    }

    // Map member IDs to user full names
    const userIdToName = users.reduce((acc, user) => {
      acc[user.id] = user.attributes.full_name;
      return acc;
    }, {});

    const supporters = members.map((member) => ({
      id: member.id,
      name: userIdToName[member.relationships.user.data.id] || "Unnamed Patron",
    }));

    displaySupporters(supporters);
  } catch (error) {
    console.error("Failed to fetch supporters:", error);
  }
}

function displaySupporters(supporters) {
  const supportersList = document.getElementById("supporters-list");
  supportersList.innerHTML = ""; // Clear existing list

  supporters.forEach((supporter) => {
    const listItem = document.createElement("li");
    listItem.textContent = supporter.name;
    supportersList.appendChild(listItem);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchSupporters();
});
