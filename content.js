// SafeGuard Content Script - Blocks Facebook distractions

// Default settings
let settings = {
  blockReels: true,
  blockStories: false,
  hideHomeFeed: false,
  blockFBAds: false,
  hideNotificationBadges: false
};

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(settings, (result) => {
    settings = result;
    applySettings();
  });
}

// Apply all settings
function applySettings() {
  if (settings.blockReels) blockReels();
  if (settings.blockStories) blockStories();
  if (settings.hideHomeFeed) hideHomeFeed();
  if (settings.blockFBAds) blockAds();
  if (settings.hideNotificationBadges) hideNotificationBadges();
}

// Block Facebook Reels
function blockReels() {
  const selectors = [
    'a[href*="/reel"]',
    'a[href*="/reels"]',
    '[aria-label*="Reels"]',
    '[aria-label*="reel"]',
    'div[role="article"]:has(a[href*="/reel"])',
    'div[class*="reel" i]',
    'span:has-text("Reels")',
  ];
  
  hideElements(selectors);
}

// Block Facebook Stories
function blockStories() {
  const selectors = [
    'div[role="region"][aria-label*="Stories"]',
    'div[aria-label*="Stories"]',
    'a[href*="/stories/"]',
    '[aria-label*="story" i]',
    'div[class*="story" i]',
  ];
  
  hideElements(selectors);
}

// Hide Home Feed
function hideHomeFeed() {
  const selectors = [
    'div[role="feed"]',
    'div[role="main"] div[role="article"]',
    '[aria-label*="Feed"]',
  ];
  
  hideElements(selectors);
  
  // Add message to indicate feed is hidden
  const feed = document.querySelector('div[role="feed"]');
  if (feed && !document.querySelector('.safeguard-message')) {
    const message = document.createElement('div');
    message.className = 'safeguard-message';
    message.style.cssText = `
      padding: 40px;
      text-align: center;
      color: #65676b;
      font-size: 16px;
      font-weight: 500;
    `;
    message.textContent = '🛡️ News Feed hidden by SafeGuard';
    feed.parentElement.insertBefore(message, feed);
  }
}

// Block Facebook Ads
function blockAds() {
  const selectors = [
    'div[role="article"]:has(a[href*="/ads/"])',
    'a[aria-label*="Sponsored"]',
    '[data-ad-preview="message"]',
    'span:has-text("Sponsored")',
    'div:has(> span:contains("Sponsored"))',
  ];
  
  hideElements(selectors);
  
  // Observer for dynamically loaded ads
  const observer = new MutationObserver(() => {
    hideElements(selectors);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Hide Notification Badges
function hideNotificationBadges() {
  const style = document.createElement('style');
  style.textContent = `
    [data-visualcompletion="ignore-dynamic"],
    div[class*="badge" i]:not([role="button"]),
    span[class*="notification" i][class*="count" i] {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

// Helper function to hide elements
function hideElements(selectors) {
  selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el && !el.classList.contains('safeguard-hidden')) {
          el.style.display = 'none';
          el.classList.add('safeguard-hidden');
        }
      });
    } catch (e) {
      // Ignore selector errors
    }
  });
}

// Show hidden elements
function showElements(selectors) {
  selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el && el.classList.contains('safeguard-hidden')) {
          el.style.display = '';
          el.classList.remove('safeguard-hidden');
        }
      });
    } catch (e) {
      // Ignore selector errors
    }
  });
}

// Listen for setting changes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateSettings') {
    settings[request.setting] = request.value;
    
    // Apply or remove the specific setting
    switch (request.setting) {
      case 'blockReels':
        if (request.value) {
          blockReels();
        } else {
          showElements(['a[href*="/reel"]', '[aria-label*="Reels"]']);
        }
        break;
      case 'blockStories':
        if (request.value) {
          blockStories();
        } else {
          showElements(['div[aria-label*="Stories"]']);
        }
        break;
      case 'hideHomeFeed':
        if (request.value) {
          hideHomeFeed();
        } else {
          showElements(['div[role="feed"]']);
          const message = document.querySelector('.safeguard-message');
          if (message) message.remove();
        }
        break;
      case 'blockFBAds':
        if (request.value) {
          blockAds();
        }
        break;
      case 'hideNotificationBadges':
        if (request.value) {
          hideNotificationBadges();
        }
        break;
    }
  }
});

// Observer for dynamically loaded content
const observer = new MutationObserver(() => {
  applySettings();
});

// Initialize
loadSettings();

// Start observing after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
} else {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
