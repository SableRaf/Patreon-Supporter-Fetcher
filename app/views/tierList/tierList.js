document.addEventListener('DOMContentLoaded', async () => {
  const tierContainer = document.getElementById('tier-container');
  const lastUpdatedElement = document.getElementById('last-updated-date');
  
  // Function to format dates in a user-friendly way
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Compare function to sort tiers in a logical order
  function compareTiers(a, b) {
    // Special handling for common tier names
    const tierOrder = {
      'Free': -1, // Place "Free" at the end
    };
    
    // If both tiers are in the order map
    if (tierOrder[a] !== undefined && tierOrder[b] !== undefined) {
      return tierOrder[a] - tierOrder[b];
    }
    // If only a is in the order map
    if (tierOrder[a] !== undefined) {
      return tierOrder[a] === -1 ? 1 : -1;
    }
    // If only b is in the order map
    if (tierOrder[b] !== undefined) {
      return tierOrder[b] === -1 ? -1 : 1;
    }
    
    // Try to extract numbers from tier names (e.g., "Tier 1", "Tier 2")
    const aMatch = a.match(/(\d+)/);
    const bMatch = b.match(/(\d+)/);
    
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }
    
    // If all else fails, alphabetical order
    return a.localeCompare(b);
  }
  
  // Function to create a member card
  function createMemberCard(member) {
    const memberCard = document.createElement('div');
    memberCard.className = 'member-card';
    
    const avatar = document.createElement('img');
    avatar.className = 'member-avatar';
    
    // Set the image source based on whether we're using dummy data or real data
    const dataPath = member.thumbnailFileName ? 
      (member.thumbnailFileName.includes('/') ? '' : `../../data/img/`) : 
      '../../dummy-data/img/';
    
    avatar.src = `${dataPath}${member.thumbnailFileName}`;
    avatar.alt = `${member.name}'s avatar`;
    avatar.onerror = () => {
      // If image fails to load, use a placeholder
      avatar.src = 'https://via.placeholder.com/80?text=No+Image';
    };
    
    const name = document.createElement('h3');
    name.className = 'member-name';
    name.textContent = member.name;
    
    const joinDate = document.createElement('div');
    joinDate.className = 'member-join-date';
    joinDate.textContent = member.joinedDate ? 
      `Joined: ${formatDate(member.joinedDate)}` : 
      'Join date unavailable';
    
    memberCard.appendChild(avatar);
    memberCard.appendChild(name);
    memberCard.appendChild(joinDate);
    
    // Add Patreon profile link if available
    if (member.url) {
      const link = document.createElement('a');
      link.className = 'member-link';
      link.href = member.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'View Profile';
      memberCard.appendChild(link);
    }
    
    return memberCard;
  }
  
  // Function to render tier section
  function renderTierSection(tierName, members) {
    const tierSection = document.createElement('section');
    tierSection.className = 'tier-section';
    
    const tierHeader = document.createElement('div');
    tierHeader.className = 'tier-header';
    
    const tierTitle = document.createElement('h2');
    tierTitle.className = 'tier-title';
    tierTitle.textContent = tierName;
    
    const memberCount = document.createElement('span');
    memberCount.className = 'member-count';
    memberCount.textContent = `${members.length} supporter${members.length !== 1 ? 's' : ''}`;
    
    tierHeader.appendChild(tierTitle);
    tierHeader.appendChild(memberCount);
    
    const membersGrid = document.createElement('div');
    membersGrid.className = 'members-grid';
    
    // Sort members by join date (newest first)
    members
      .sort((a, b) => {
        if (!a.joinedDate) return 1;
        if (!b.joinedDate) return -1;
        return new Date(b.joinedDate) - new Date(a.joinedDate);
      })
      .forEach(member => {
        membersGrid.appendChild(createMemberCard(member));
      });
    
    tierSection.appendChild(tierHeader);
    tierSection.appendChild(membersGrid);
    
    return tierSection;
  }
  
  try {
    // Try to load members data
    let dataPath = '/data';
    let response = await fetch(`${dataPath}/members.json`, { method: 'HEAD' });
    
    // If /data/members.json doesn't exist, use dummy data
    if (!response.ok) {
      dataPath = '/dummy-data';
      response = await fetch(`${dataPath}/members.json`);
      if (!response.ok) {
        throw new Error('Failed to load members data');
      }
    } else {
      response = await fetch(`${dataPath}/members.json`);
    }
    
    const data = await response.json();
    
    // Update last fetch date
    if (data.lastFetchDate) {
      lastUpdatedElement.textContent = formatDate(data.lastFetchDate);
    } else {
      lastUpdatedElement.textContent = 'Unknown';
    }
    
    // Clear loading indicator
    tierContainer.innerHTML = '';
    
    // Group members by tier
    const tierGroups = data.members.reduce((groups, member) => {
      const tierName = member.tier || 'Unknown';
      if (!groups[tierName]) {
        groups[tierName] = [];
      }
      groups[tierName].push(member);
      return groups;
    }, {});
    
    // Get tier names and sort them
    const tierNames = Object.keys(tierGroups).sort(compareTiers);
    
    // Create and append tier sections
    tierNames.forEach(tierName => {
      // Skip rendering "Free" tier if it's empty or contains only free members
      if (tierName === 'Free' && tierGroups[tierName].length === 0) {
        return;
      }
      
      const tierSection = renderTierSection(tierName, tierGroups[tierName]);
      tierContainer.appendChild(tierSection);
    });
    
  } catch (error) {
    console.error('Error:', error);
    tierContainer.innerHTML = `
      <div class="error">
        <p>Failed to load supporters data. Please try again later.</p>
        <p>Error details: ${error.message}</p>
      </div>
    `;
  }
});