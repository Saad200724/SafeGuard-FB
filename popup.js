// Default settings with Block Reels enabled
const defaultSettings = {
  blockReels: true,
  blockStories: false,
  hideHomeFeed: false,
  blockFBAds: false,
  hideNotificationBadges: false
};

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    updateUI(settings);
  });
}

// Update UI based on settings
function updateUI(settings) {
  const toggles = document.querySelectorAll('.toggle');
  
  toggles.forEach(toggle => {
    const setting = toggle.dataset.setting;
    const isActive = settings[setting];
    const settingContent = toggle.closest('.setting-content');
    
    if (isActive) {
      toggle.classList.add('active');
      settingContent.classList.add('active');
    } else {
      toggle.classList.remove('active');
      settingContent.classList.remove('active');
    }
  });
}

// Save setting to storage
function saveSetting(setting, value) {
  chrome.storage.sync.set({ [setting]: value }, () => {
    // Notify content script to update
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          setting: setting,
          value: value
        });
      }
    });
  });
}

// Toggle setting
function toggleSetting(toggle) {
  const setting = toggle.dataset.setting;
  const isCurrentlyActive = toggle.classList.contains('active');
  const newValue = !isCurrentlyActive;
  const settingContent = toggle.closest('.setting-content');
  
  // Update UI immediately for better UX
  if (newValue) {
    toggle.classList.add('active');
    settingContent.classList.add('active');
  } else {
    toggle.classList.remove('active');
    settingContent.classList.remove('active');
  }
  
  // Save to storage
  saveSetting(setting, newValue);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Load current settings
  loadSettings();
  
  // Add click handlers to all toggles
  const toggles = document.querySelectorAll('.toggle');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleSetting(toggle);
    });
  });
  
  // Listen for storage changes (when settings are changed in another popup)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      chrome.storage.sync.get(defaultSettings, (settings) => {
        updateUI(settings);
      });
    }
  });
});
