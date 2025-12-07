/**
 * NeuroSync Popup Script
 * Handles user preferences and statistics display
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Setup tab navigation
  setupTabs();

  // Load current settings and stats
  await loadSettings();
  await loadStats();

  // Setup event listeners
  document.getElementById('toggle-btn').addEventListener('click', toggleGlobalEnabled);
  document.getElementById('clear-btn').addEventListener('click', clearData);

  // Pattern toggles
  document.getElementById('pattern-confusion').addEventListener('change', savePatternSettings);
  document.getElementById('pattern-search').addEventListener('change', savePatternSettings);
  document.getElementById('pattern-context').addEventListener('change', savePatternSettings);

  // Sensitivity sliders
  document.getElementById('confidence-threshold').addEventListener('input', updateThresholdDisplay);
  document.getElementById('confidence-threshold').addEventListener('change', saveSensitivitySettings);
  document.getElementById('prediction-cooldown').addEventListener('input', updateCooldownDisplay);
  document.getElementById('prediction-cooldown').addEventListener('change', saveSensitivitySettings);
});

/**
 * Setup tab navigation
 */
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show corresponding content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetTab) {
          content.classList.add('active');
        }
      });
    });
  });
}

/**
 * Load settings from storage
 */
async function loadSettings() {
  const result = await chrome.storage.local.get('settings');
  const settings = result.settings || getDefaultSettings();

  // Pattern toggles
  document.getElementById('pattern-confusion').checked = settings.patterns.confusion;
  document.getElementById('pattern-search').checked = settings.patterns.searchIntent;
  document.getElementById('pattern-context').checked = settings.patterns.contextLoss;

  // Sensitivity sliders
  document.getElementById('confidence-threshold').value = settings.confidenceThreshold * 100;
  document.getElementById('prediction-cooldown').value = settings.predictionCooldown / 1000;

  updateThresholdDisplay();
  updateCooldownDisplay();
}

/**
 * Default settings
 */
function getDefaultSettings() {
  return {
    enabled: true,
    patterns: {
      confusion: true,
      searchIntent: true,
      contextLoss: true
    },
    confidenceThreshold: 0.70,
    predictionCooldown: 30000 // 30 seconds in milliseconds
  };
}

/**
 * Load statistics
 */
async function loadStats() {
  const result = await chrome.storage.local.get(['predictions', 'feedback', 'settings']);

  const predictions = result.predictions || [];
  const feedback = result.feedback || [];
  const settings = result.settings || getDefaultSettings();

  // Calculate stats
  const totalPredictions = predictions.length;
  const helpfulCount = feedback.filter(f => f.helpful).length;
  const accuracy = totalPredictions > 0
    ? Math.round((helpfulCount / totalPredictions) * 100)
    : 0;

  // Update UI
  document.getElementById('total-predictions').textContent = totalPredictions;
  document.getElementById('helpful-count').textContent = helpfulCount;
  document.getElementById('accuracy').textContent = `${accuracy}%`;
  document.getElementById('status').textContent = settings.enabled ? 'Enabled' : 'Disabled';
  document.getElementById('status').style.color = settings.enabled ? '#34c759' : '#86868b';

  // Update toggle button
  const btn = document.getElementById('toggle-btn');
  btn.textContent = settings.enabled ? 'Disable' : 'Enable';
  btn.className = settings.enabled ? 'btn-primary' : 'btn-secondary';
}

/**
 * Toggle global enabled/disabled
 */
async function toggleGlobalEnabled() {
  const result = await chrome.storage.local.get('settings');
  const settings = result.settings || getDefaultSettings();

  settings.enabled = !settings.enabled;

  await chrome.storage.local.set({ settings });
  await loadStats();

  // Notify content scripts of settings change
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'settings_updated',
      settings
    }).catch(() => {
      // Tab might not have content script loaded
    });
  }
}

/**
 * Save pattern settings
 */
async function savePatternSettings() {
  const result = await chrome.storage.local.get('settings');
  const settings = result.settings || getDefaultSettings();

  settings.patterns = {
    confusion: document.getElementById('pattern-confusion').checked,
    searchIntent: document.getElementById('pattern-search').checked,
    contextLoss: document.getElementById('pattern-context').checked
  };

  await chrome.storage.local.set({ settings });

  // Notify content scripts
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'settings_updated',
      settings
    }).catch(() => {});
  }
}

/**
 * Save sensitivity settings
 */
async function saveSensitivitySettings() {
  const result = await chrome.storage.local.get('settings');
  const settings = result.settings || getDefaultSettings();

  settings.confidenceThreshold = parseFloat(document.getElementById('confidence-threshold').value) / 100;
  settings.predictionCooldown = parseInt(document.getElementById('prediction-cooldown').value) * 1000;

  await chrome.storage.local.set({ settings });

  // Notify content scripts
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'settings_updated',
      settings
    }).catch(() => {});
  }
}

/**
 * Update threshold display
 */
function updateThresholdDisplay() {
  const value = document.getElementById('confidence-threshold').value;
  document.getElementById('threshold-value').textContent = `${value}%`;
}

/**
 * Update cooldown display
 */
function updateCooldownDisplay() {
  const value = document.getElementById('prediction-cooldown').value;
  document.getElementById('cooldown-value').textContent = `${value}s`;
}

/**
 * Clear all data
 */
async function clearData() {
  if (confirm('Clear all prediction data and feedback? This cannot be undone.')) {
    await chrome.storage.local.set({
      predictions: [],
      feedback: []
    });

    await loadStats();
    showNotification('Data cleared successfully!');
  }
}

/**
 * Show notification
 */
function showNotification(message) {
  // Create temporary notification
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #34c759;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    z-index: 10000;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 2000);
}
