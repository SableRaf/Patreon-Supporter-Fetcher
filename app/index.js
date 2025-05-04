const defaults = {
  scrollSpeed: 50, // Default scroll speed in pixels per second
  bannerHeight: 80, // Default banner height in pixels
  paddingFactor: 0.15, // Padding as a factor of banner height
  fontSizeFactor: 0.32, // Default font size factor
  backgroundColor: 'rgba(179, 179, 179, 0.246)', // Default banner background color
  textColor: 'rgb(33, 33, 33)' // Default text color
}

// Function to get URL parameters
function getUrlParam(param, defaultValue) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has(param) ? urlParams.get(param) : defaultValue;
}

// Override default values with URI parameters
const scrollSpeed = parseFloat(getUrlParam('scrollSpeed', defaults.scrollSpeed));
const bannerHeight = parseInt(getUrlParam('bannerHeight', defaults.bannerHeight), 10);
const paddingFactor = parseFloat(getUrlParam('paddingFactor', defaults.paddingFactor));
const fontSizeFactor = parseFloat(getUrlParam('fontSizeFactor', defaults.fontSizeFactor));
const backgroundColor = getUrlParam('backgroundColor', defaults.backgroundColor);
const textColor = getUrlParam('textColor', defaults.textColor);

const padding = bannerHeight * paddingFactor; // Calculate padding dynamically

// Update font size calculation to use fontSizeFactor
const fontSize = bannerHeight * fontSizeFactor;
document.documentElement.style.setProperty('--font-size', `${fontSize}px`);

// Set CSS variables for dynamic values
document.documentElement.style.setProperty('--banner-height', `${bannerHeight}px`);
document.documentElement.style.setProperty('--member-padding', `${padding}px`);
document.documentElement.style.setProperty('--banner-bg', backgroundColor);
document.documentElement.style.setProperty('--text-color', textColor);
document.documentElement.style.setProperty('--font-size-factor', fontSizeFactor);

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

    let totalWidth = members.reduce((sum, member) => sum + member.width + padding, 0);
    let largestMemberWidth = Math.max(...members.map(member => member.width));

    {
      const originalMembers = [...members];
      while (totalWidth < window.innerWidth) {
        for (const member of originalMembers) {
          const duplicateMember = new Member(member.name, member.element.querySelector("img").src, totalWidth);
          totalWidth += duplicateMember.width + padding;
          members.push(duplicateMember);
          console.log(`Duplicated member: ${member.name}`);
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