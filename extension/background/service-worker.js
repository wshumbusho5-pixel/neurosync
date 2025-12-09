/**
 * NeuroSync Phase 0 - Background Service Worker
 *
 * Handles extension lifecycle and storage management
 */

// Import usage tracker, Stripe client, and AI client
importScripts('usage-tracker.js');
importScripts('stripe-client.js');
importScripts('ai-client.js');

const usageTracker = new UsageTracker();
const stripeClient = new StripeClient();
const aiClient = new AIClient();

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

  // Stripe payment handlers
  if (message.type === 'create_checkout') {
    stripeClient.createCheckoutSession().then(sendResponse);
    return true;
  }

  if (message.type === 'activate_pro') {
    stripeClient.activateProSubscription(message.sessionId).then(sendResponse);
    return true;
  }

  if (message.type === 'cancel_subscription') {
    handleCancelSubscription(message.subscriptionId).then(sendResponse);
    return true;
  }

  if (message.type === 'reactivate_subscription') {
    handleReactivateSubscription(message.subscriptionId).then(sendResponse);
    return true;
  }

  if (message.type === 'check_server_health') {
    stripeClient.checkServerHealth().then(sendResponse);
    return true;
  }

  // AI handlers
  if (message.type === 'ai_explain') {
    handleAIExplain(message.term, message.context).then(sendResponse);
    return true;
  }

  if (message.type === 'ai_analyze_page') {
    aiClient.analyzePage(message.content, message.metadata).then(sendResponse);
    return true;
  }

  if (message.type === 'ai_summarize') {
    aiClient.summarize(message.content, message.options).then(sendResponse);
    return true;
  }

  if (message.type === 'ai_answer') {
    aiClient.answerQuestion(message.question, message.context, message.useSemanticSearch).then(sendResponse);
    return true;
  }

  if (message.type === 'ai_extract_concepts') {
    aiClient.extractConcepts(message.text).then(sendResponse);
    return true;
  }

  if (message.type === 'ai_check_health') {
    aiClient.checkHealth().then(sendResponse);
    return true;
  }

  if (message.type === 'ai_cache_stats') {
    aiClient.getCacheStats().then(sendResponse);
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

async function handleCancelSubscription(subscriptionId) {
  try {
    const result = await stripeClient.cancelSubscription(subscriptionId);

    if (result.success) {
      // Update local subscription data
      const subscription = await usageTracker.getSubscriptionStatus();
      subscription.cancelAtPeriodEnd = result.cancelAtPeriodEnd;

      await chrome.storage.local.set({ subscription });

      console.log('[NeuroSync] Subscription will cancel at:', new Date(result.currentPeriodEnd * 1000));
    }

    return result;
  } catch (error) {
    console.error('[NeuroSync] Error cancelling subscription:', error);
    return { success: false, error: error.message };
  }
}

async function handleReactivateSubscription(subscriptionId) {
  try {
    const result = await stripeClient.reactivateSubscription(subscriptionId);

    if (result.success) {
      // Update local subscription data
      const subscription = await usageTracker.getSubscriptionStatus();
      subscription.cancelAtPeriodEnd = false;

      await chrome.storage.local.set({ subscription });

      console.log('[NeuroSync] Subscription reactivated');
    }

    return result;
  } catch (error) {
    console.error('[NeuroSync] Error reactivating subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle AI explanation with intelligent fallback
 *
 * Strategy:
 * 1. Check hardcoded knowledge base (instant, free)
 * 2. Try AI server (if available and user has credits)
 * 3. Fallback to hardcoded if AI fails
 */
async function handleAIExplain(term, context = {}) {
  console.log('[NeuroSync] Explaining term:', term);

  // Strategy 1: Check hardcoded knowledge base first
  // This is instant and free - use it as a cache
  const hardcoded = await getHardcodedDefinition(term);

  if (hardcoded) {
    console.log('[NeuroSync] Using hardcoded definition');
    return {
      success: true,
      source: 'hardcoded',
      explanation: formatHardcodedAsMarkdown(hardcoded),
      term: term,
      fromCache: true
    };
  }

  // Strategy 2: Try AI server
  const aiAvailable = await aiClient.checkHealth();

  if (aiAvailable) {
    console.log('[NeuroSync] AI server available, requesting AI explanation');

    const aiResult = await aiClient.explainTerm(term, context);

    if (aiResult.success) {
      return {
        success: true,
        source: aiResult.source, // 'ai' or 'cache'
        explanation: aiResult.explanation,
        term: term,
        usage: aiResult.usage,
        fromCache: aiResult.fromCache
      };
    }

    console.warn('[NeuroSync] AI request failed:', aiResult.error);
  } else {
    console.log('[NeuroSync] AI server not available');
  }

  // Strategy 3: Fallback - no definition available
  return {
    success: false,
    source: 'none',
    error: 'No definition available. AI server is offline and term not in knowledge base.',
    suggestion: 'Try starting the AI server or search for this term manually.'
  };
}

/**
 * Get hardcoded definition from knowledge base
 */
async function getHardcodedDefinition(term) {
  // This would normally import the knowledge base
  // For now, return null to trigger AI
  // In production, this checks the 52 term knowledge base

  return null; // Placeholder - implement knowledge base lookup
}

/**
 * Format hardcoded definition as markdown
 */
function formatHardcodedAsMarkdown(definition) {
  return `**Definition:** ${definition.definition}

**Example:**
\`\`\`${definition.category?.toLowerCase() || 'javascript'}
${definition.example}
\`\`\`

**Analogy:** ${definition.analogy}

**Related:** ${definition.relatedTerms?.join(', ') || 'N/A'}`;
}
