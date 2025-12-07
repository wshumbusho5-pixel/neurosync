/**
 * NeuroSync Usage Tracker
 * Tracks daily usage for freemium limits
 */

class UsageTracker {
  constructor() {
    this.DAILY_LIMIT_FREE = 20;
    this.init();
  }

  async init() {
    // Reset daily usage at midnight
    this.scheduleDailyReset();
  }

  /**
   * Check if user can make a prediction
   */
  async canPredict() {
    const subscription = await this.getSubscriptionStatus();

    // Pro users have unlimited predictions
    if (subscription.isPro) {
      return { allowed: true, reason: 'pro' };
    }

    // Free users have daily limit
    const usage = await this.getTodayUsage();

    if (usage.predictionsToday < this.DAILY_LIMIT_FREE) {
      return {
        allowed: true,
        reason: 'free',
        remaining: this.DAILY_LIMIT_FREE - usage.predictionsToday
      };
    }

    return {
      allowed: false,
      reason: 'limit_reached',
      limit: this.DAILY_LIMIT_FREE,
      resetsAt: usage.resetsAt
    };
  }

  /**
   * Record a prediction
   */
  async recordPrediction() {
    const today = this.getTodayKey();
    const result = await chrome.storage.local.get(['usage', 'allTimeStats']);

    const usage = result.usage || {};
    const allTimeStats = result.allTimeStats || {
      totalPredictions: 0,
      totalHelpful: 0,
      firstUsed: Date.now()
    };

    // Update today's usage
    if (!usage[today]) {
      usage[today] = {
        predictions: 0,
        helpful: 0,
        dismissed: 0,
        patterns: {
          confusion: 0,
          search_intent: 0,
          context_loss: 0
        }
      };
    }

    usage[today].predictions++;
    allTimeStats.totalPredictions++;

    await chrome.storage.local.set({
      usage,
      allTimeStats
    });

    console.log('[NeuroSync] Prediction recorded. Today:', usage[today].predictions);
  }

  /**
   * Record user feedback
   */
  async recordFeedback(helpful, pattern) {
    const today = this.getTodayKey();
    const result = await chrome.storage.local.get(['usage', 'allTimeStats']);

    const usage = result.usage || {};
    const allTimeStats = result.allTimeStats || {};

    if (!usage[today]) return;

    if (helpful) {
      usage[today].helpful++;
      allTimeStats.totalHelpful++;
    } else {
      usage[today].dismissed++;
    }

    if (pattern) {
      usage[today].patterns[pattern] = (usage[today].patterns[pattern] || 0) + 1;
    }

    await chrome.storage.local.set({ usage, allTimeStats });
  }

  /**
   * Get today's usage
   */
  async getTodayUsage() {
    const today = this.getTodayKey();
    const result = await chrome.storage.local.get('usage');
    const usage = result.usage || {};

    const todayData = usage[today] || {
      predictions: 0,
      helpful: 0,
      dismissed: 0
    };

    // Calculate when limit resets (midnight)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return {
      predictionsToday: todayData.predictions,
      helpfulToday: todayData.helpful,
      dismissedToday: todayData.dismissed,
      resetsAt: tomorrow.getTime()
    };
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus() {
    const result = await chrome.storage.local.get('subscription');
    const subscription = result.subscription || {
      isPro: false,
      tier: 'free',
      startDate: null,
      endDate: null,
      stripeCustomerId: null
    };

    // Check if subscription is still valid
    if (subscription.isPro && subscription.endDate) {
      if (Date.now() > subscription.endDate) {
        // Subscription expired
        subscription.isPro = false;
        subscription.tier = 'free';
        await chrome.storage.local.set({ subscription });
      }
    }

    return subscription;
  }

  /**
   * Upgrade to Pro
   */
  async upgradeToPro(stripeCustomerId, endDate) {
    const subscription = {
      isPro: true,
      tier: 'pro',
      startDate: Date.now(),
      endDate: endDate,
      stripeCustomerId: stripeCustomerId
    };

    await chrome.storage.local.set({ subscription });
    console.log('[NeuroSync] Upgraded to Pro!');

    return subscription;
  }

  /**
   * Get analytics data for Pro users
   */
  async getAnalytics() {
    const subscription = await this.getSubscriptionStatus();

    if (!subscription.isPro) {
      return { error: 'Pro subscription required' };
    }

    const result = await chrome.storage.local.get(['usage', 'allTimeStats']);
    const usage = result.usage || {};
    const allTimeStats = result.allTimeStats || {};

    // Calculate stats
    const last7Days = this.getLast7DaysKeys();
    const weeklyStats = last7Days.map(day => ({
      date: day,
      predictions: usage[day]?.predictions || 0,
      helpful: usage[day]?.helpful || 0,
      dismissed: usage[day]?.dismissed || 0
    }));

    // Pattern breakdown
    const patternStats = {
      confusion: 0,
      search_intent: 0,
      context_loss: 0
    };

    Object.values(usage).forEach(day => {
      if (day.patterns) {
        patternStats.confusion += day.patterns.confusion || 0;
        patternStats.search_intent += day.patterns.search_intent || 0;
        patternStats.context_loss += day.patterns.context_loss || 0;
      }
    });

    return {
      allTime: allTimeStats,
      weekly: weeklyStats,
      patterns: patternStats,
      accuracy: allTimeStats.totalPredictions > 0
        ? Math.round((allTimeStats.totalHelpful / allTimeStats.totalPredictions) * 100)
        : 0
    };
  }

  /**
   * Schedule daily reset
   */
  scheduleDailyReset() {
    // Calculate time until midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      console.log('[NeuroSync] Daily usage reset');
      // Schedule next reset
      this.scheduleDailyReset();
    }, msUntilMidnight);
  }

  /**
   * Helper: Get today's key (YYYY-MM-DD)
   */
  getTodayKey() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Helper: Get last 7 days keys
   */
  getLast7DaysKeys() {
    const keys = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      keys.push(date.toISOString().split('T')[0]);
    }
    return keys;
  }

  /**
   * Clean up old usage data (keep last 30 days)
   */
  async cleanupOldData() {
    const result = await chrome.storage.local.get('usage');
    const usage = result.usage || {};

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffKey = thirtyDaysAgo.toISOString().split('T')[0];

    const cleaned = {};
    Object.entries(usage).forEach(([key, value]) => {
      if (key >= cutoffKey) {
        cleaned[key] = value;
      }
    });

    await chrome.storage.local.set({ usage: cleaned });
    console.log('[NeuroSync] Cleaned up old usage data');
  }
}

// Export for use in service worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UsageTracker;
}
