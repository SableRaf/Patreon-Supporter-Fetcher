const scrollSpeed = 50;
const bannerHeight = 42;
const paddingFactor = 0.15; // Padding as a factor of banner height
const padding = bannerHeight * paddingFactor; // Calculate padding dynamically

document.documentElement.style.setProperty('--banner-height', `${bannerHeight}px`);
document.documentElement.style.setProperty('--member-padding', `${padding}px`); // Set CSS variable for padding

const imgDir = `img`;

let members = [];
let lastTime = performance.now();
const container = document.getElementById("members");

class Member {
  constructor(name, imgSrc, x) {
    this.name = name;
    this.x = x;

    this.createElement(imgSrc);
    this.width = this.calculateWidth();
  }

  createElement(imgSrc) {
    this.element = document.createElement("div");
    this.element.className = "member";

    const imgElem = document.createElement("img");
    imgElem.src = imgSrc;

    const textElem = document.createElement("span");
    textElem.textContent = this.name;

    this.element.append(imgElem, textElem);
    container.appendChild(this.element);

    this.element.style.left = `${this.x}px`;
  }

  calculateWidth() {
    return this.element.getBoundingClientRect().width;
  }

  update(dt, totalWidth) {
    this.x -= scrollSpeed * dt;
    if (this.x < -this.width) {
      this.x += totalWidth;
    }
    this.element.style.left = `${this.x}px`;
  }
}

async function getDataDir() {
  try {
    const response = await fetch('/data/members.json', { method: 'HEAD' });
    return response.ok ? '/data' : '/dummy-data';
  } catch {
    return '/dummy-data';
  }
}

let dataDir;
(async () => {
  dataDir = await getDataDir();
  setup(); // Call setup after determining the correct data directory
})();

async function setup() {
  container.style.width = `${window.innerWidth}px`;
  container.style.height = `${bannerHeight}px`;

  try {
    const response = await fetch(`${dataDir}/members.json`);
    const data = await response.json();

    const filteredData = data.members.filter(member => member.tier !== "Free");
    let xPosition = 0;

    members = filteredData
      .filter(member => member.thumbnailFileName)
      .map(member => {
        const imgSrc = `${dataDir}/${imgDir}/${member.thumbnailFileName}`;
        const newMember = new Member(member.name, imgSrc, xPosition);
        xPosition += newMember.width + padding; // Add padding between members
        return newMember;
      });

    const totalWidth = members.reduce((sum, member) => sum + member.width + padding, 0);
    const largestMemberWidth = Math.max(...members.map(member => member.width));

    // Duplicate members only if the total width is less than the container width
    if (totalWidth < window.innerWidth) {
      const originalMembers = [...members];
      while (xPosition < window.innerWidth) {
        for (const member of originalMembers) {
          const duplicateMember = new Member(member.name, member.element.querySelector("img").src, xPosition);
          xPosition += duplicateMember.width + padding;
          members.push(duplicateMember);

          if (xPosition - largestMemberWidth >= window.innerWidth) break; // Stop duplicating once the banner is filled
        }
      }
    }

    if (members.length === 0) {
      console.warn("No members were loaded. Check the image paths or members.json file.");
    }

    requestAnimationFrame(animate);
  } catch (error) {
    console.error("Error loading members or images:", error);
  }
}

function animate(time) {
  const dt = (time - lastTime) / 1000;
  lastTime = time;

  const totalWidth = members.reduce((sum, member) => sum + member.width + padding, 0); // Include padding in totalWidth
  members.forEach(member => member.update(dt, totalWidth));

  requestAnimationFrame(animate);
}

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    container.style.width = `${window.innerWidth}px`;
  }, 200);
});

window.onload = null; // Remove the direct call to setup