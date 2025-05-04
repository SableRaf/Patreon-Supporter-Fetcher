document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.columns-container');

    fetch('../../data/members.json')
        .then(response => response.json())
        .then(data => {
            const tiers = {};
            const tierPrices = {};
            
            // First, extract tier info from the dedicated tiers array if available
            if (data.tiers) {
                data.tiers.forEach(tier => {
                    if (tier.title.toLowerCase() !== 'free') {
                        tiers[tier.title] = [];
                        tierPrices[tier.title] = tier.amountCents || 0;
                    }
                });
            }

            // Then process members
            data.members.forEach(member => {
                if (member.tier.toLowerCase() === 'free') return; // Skip the free tier
                
                if (!tiers[member.tier]) {
                    tiers[member.tier] = [];
                    // If we don't have price info from tiers array, try to get it from the member
                    if (member.tierDetails && member.tierDetails.amountCents) {
                        tierPrices[member.tier] = member.tierDetails.amountCents;
                    } else {
                        tierPrices[member.tier] = 0;
                    }
                }
                
                tiers[member.tier].push(member);
            });

            // Sort tiers by price (highest to lowest)
            const sortedTiers = Object.keys(tiers).sort((a, b) => {
                return tierPrices[b] - tierPrices[a]; // Sort by price, descending
            });

            sortedTiers.forEach(tierName => {
                const column = document.createElement('div');
                column.classList.add('column');

                // Get tier details either from the member or from the tiers array
                const tierDetails = data.tiers?.find(t => t.title === tierName) || 
                                   (tiers[tierName][0]?.tierDetails || {});
                
                // Create header with price information and tier image
                const header = document.createElement('div');
                header.classList.add('column-header');

                // Add tier image if available
                if (tierDetails.thumbnailFileName || tierDetails.imageUrl) {
                    const tierImage = document.createElement('div');
                    tierImage.classList.add('tier-image');
                    
                    const img = document.createElement('img');
                    if (tierDetails.thumbnailFileName) {
                        img.src = `../../data/img/${tierDetails.thumbnailFileName}`;
                    } else if (tierDetails.imageUrl) {
                        img.src = tierDetails.imageUrl;
                    }
                    img.alt = `${tierName} tier`;
                    img.onerror = function() {
                        // If the image fails to load, hide the container
                        tierImage.style.display = 'none';
                    };
                    
                    tierImage.appendChild(img);
                    header.appendChild(tierImage);
                }

                const title = document.createElement('h2');
                title.textContent = tierName;
                header.appendChild(title);
                
                column.appendChild(header);
                
                // Add members list
                const membersList = document.createElement('div');
                membersList.classList.add('members-list');
                
                // Sort members alphabetically
                const sortedMembers = tiers[tierName].sort((a, b) => 
                    a.name.localeCompare(b.name)
                );

                sortedMembers.forEach(member => {
                    const memberCard = document.createElement('div');
                    memberCard.classList.add('member-card');
                    
                    // Create thumbnail container
                    const thumbnail = document.createElement('div');
                    thumbnail.classList.add('member-thumbnail');
                    
                    // Create and set the image
                    const img = document.createElement('img');
                    img.src = member.imageUrl || `../../data/img/${member.userID}.jpg`;
                    img.alt = member.name;
                    img.onerror = function() {
                        // Fallback if image doesn't load
                        this.src = 'https://via.placeholder.com/42/cccccc/666666?text=?';
                    };
                    thumbnail.appendChild(img);
                    
                    // Create name element with link if available
                    const nameContainer = document.createElement('div');
                    nameContainer.classList.add('member-name-container');
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.classList.add('member-name');
                    
                    if (member.url) {
                        const nameLink = document.createElement('a');
                        nameLink.href = member.url;
                        nameLink.target = "_blank";
                        nameLink.rel = "noopener noreferrer";
                        nameLink.textContent = member.name;
                        nameSpan.appendChild(nameLink);
                    } else {
                        nameSpan.textContent = member.name;
                    }
                    
                    nameContainer.appendChild(nameSpan);
                    
                    // Add join date if available
                    if (member.joinedDate) {
                        const joinDate = document.createElement('span');
                        joinDate.classList.add('join-date');
                        const date = new Date(member.joinedDate);
                        joinDate.textContent = `Joined ${date.toLocaleDateString()}`;
                        nameContainer.appendChild(joinDate);
                    }
                    
                    // Add everything to the card
                    memberCard.appendChild(thumbnail);
                    memberCard.appendChild(nameContainer);
                    
                    membersList.appendChild(memberCard);
                });
                
                column.appendChild(membersList);
                container.appendChild(column);
            });
        })
        .catch(error => console.error('Error fetching members:', error));
});