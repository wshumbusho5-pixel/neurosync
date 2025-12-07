/**
 * NeuroSync Phase 0 - Background Service Worker
 *
 * Handles extension lifecycle and storage management
 */

// Import usage tracker
importScripts('usage-tracker.js');

const usageTracker = new UsageTracker();

console.log('[NeuroSync] Service worker initialized');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[NeuroSync] Extension installed');

    // Initialize storage
    chrome.storage.local.set({
      predictions: [],
      feedback: [],
      settings: {
        enabled: true,
        confidenceThreshold: 0.7,
        minPredictionInterval: 30000
      }
    });

    // Open welcome page
    chrome.tabs.create({
      url: 'popup/popup.html'
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[NeuroSync] Message received:', message);

  if (message.type === 'get_stats') {
    getStats().then(sendResponse);
    return true; // Keep channel open for async response
  }

  if (message.type === 'check_can_predict') {
    usageTracker.canPredict().then(sendResponse);
    return true;
  }

  if (message.type === 'record_prediction') {
    usageTracker.recordPrediction().then(sendResponse);
    return true;
  }

  if (message.type === 'record_feedback') {
    usageTracker.recordFeedback(message.helpful, message.pattern).then(sendResponse);
    return true;
  }

  if (message.type === 'get_subscription') {
    usageTracker.getSubscriptionStatus().then(sendResponse);
    return true;
  }

  if (message.type === 'upgrade_to_pro') {
    usageTracker.upgradeToPro(message.stripeCustomerId, message.endDate).then(sendResponse);
    return true;
  }

  if (message.type === 'get_analytics') {
    usageTracker.getAnalytics().then(sendResponse);
    return true;
  }

  if (message.type === 'get_today_usage') {
    usageTracker.getTodayUsage().then(sendResponse);
    return true;
  }
});

async function getStats() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['predictions', 'feedback'], (result) => {
      const predictions = result.predictions || [];
      const feedback = result.feedback || [];

      const helpful = feedback.filter(f => f.action === 'helpful').length;
      const dismissed = feedback.filter(f => f.action === 'dismiss').length;

      resolve({
        totalPredictions: predictions.length,
        totalFeedback: feedback.length,
        helpful: helpful,
        dismissed: dismissed,
        accuracy: feedback.length > 0 ? Math.round((helpful / feedback.length) * 100) : 0
      });
    });
  });
}
