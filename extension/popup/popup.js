// NeuroSync Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // Load stats
  await loadStats();

  // Setup event listeners
  document.getElementById('enable-btn').addEventListener('click', toggleEnabled);
  document.getElementById('clear-btn').addEventListener('click', clearData);
});

async function loadStats() {
  const stats = await chrome.runtime.sendMessage({ type: 'get_stats' });

  document.getElementById('total-predictions').textContent = stats.totalPredictions;
  document.getElementById('helpful-count').textContent = stats.helpful;
  document.getElementById('accuracy').textContent = `${stats.accuracy}%`;

  // Update enable button state
  const settings = await chrome.storage.local.get('settings');
  const enabled = settings.settings?.enabled !== false;

  const btn = document.getElementById('enable-btn');
  btn.textContent = enabled ? 'Enabled' : 'Disabled';
  btn.className = enabled ? 'btn-primary' : 'btn-secondary';
}

async function toggleEnabled() {
  const settings = await chrome.storage.local.get('settings');
  const currentState = settings.settings?.enabled !== false;
  const newState = !currentState;

  await chrome.storage.local.set({
    settings: {
      ...settings.settings,
      enabled: newState
    }
  });

  const btn = document.getElementById('enable-btn');
  btn.textContent = newState ? 'Enabled' : 'Disabled';
  btn.className = newState ? 'btn-primary' : 'btn-secondary';
}

async function clearData() {
  if (confirm('Clear all prediction data and feedback? This cannot be undone.')) {
    await chrome.storage.local.set({
      predictions: [],
      feedback: []
    });

    await loadStats();
    alert('Data cleared successfully!');
  }
}
