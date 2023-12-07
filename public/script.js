async function fetchSupporters() {
  try {
    const response = await fetch("/fetch-supporters");
    const data = await response.json();

    if (data.errors) {
      console.error("Error fetching supporters:", data.errors);
      return;
    }

    const supporters = data.included
      .filter((item) => item.type === "user")
      .map((user) => ({
        id: user.id,
        name: user.attributes.full_name,
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
