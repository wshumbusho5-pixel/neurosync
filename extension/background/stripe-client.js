/**
 * NeuroSync Stripe Client
 * Handles communication with Stripe payment server
 */

class StripeClient {
  constructor() {
    // Server URL - update this with your deployed server URL
    this.serverUrl = 'http://localhost:3000';
    // For production, use: 'https://your-server.com'
  }

  /**
   * Generate a unique user ID for this extension installation
   */
  async getUserId() {
    const result = await chrome.storage.local.get('userId');

    if (result.userId) {
      return result.userId;
    }

    // Generate new user ID
    const userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
    await chrome.storage.local.set({ userId });
    return userId;
  }

  /**
   * Create a checkout session and redirect to Stripe
   */
  async createCheckoutSession() {
    try {
      const userId = await this.getUserId();

      const response = await fetch(`${this.serverUrl}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('[Stripe] Checkout session created:', data.sessionId);

      // Open Stripe checkout in new tab
      await chrome.tabs.create({ url: data.url });

      return { success: true, sessionId: data.sessionId };

    } catch (error) {
      console.error('[Stripe] Error creating checkout session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get session details after successful payment
   */
  async getSessionDetails(sessionId) {
    try {
      const response = await fetch(`${this.serverUrl}/session/${sessionId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('[Stripe] Error getting session details:', error);
      throw error;
    }
  }

  /**
   * Get subscription details
   */
  async getSubscriptionDetails(subscriptionId) {
    try {
      const response = await fetch(`${this.serverUrl}/subscription/${subscriptionId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('[Stripe] Error getting subscription details:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch(`${this.serverUrl}/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('[Stripe] Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(subscriptionId) {
    try {
      const response = await fetch(`${this.serverUrl}/reactivate-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('[Stripe] Error reactivating subscription:', error);
      throw error;
    }
  }

  /**
   * Activate Pro subscription after successful payment
   */
  async activateProSubscription(sessionId) {
    try {
      // Get session details from Stripe
      const session = await this.getSessionDetails(sessionId);

      if (session.status !== 'paid') {
        throw new Error('Payment not completed');
      }

      // Get subscription details
      const subscription = await this.getSubscriptionDetails(session.subscriptionId);

      // Calculate end date (current period end)
      const endDate = subscription.currentPeriodEnd * 1000; // Convert to milliseconds

      // Store subscription info
      const subscriptionData = {
        isPro: true,
        tier: 'pro',
        startDate: Date.now(),
        endDate: endDate,
        stripeCustomerId: session.customerId,
        stripeSubscriptionId: session.subscriptionId,
        status: subscription.status,
      };

      await chrome.storage.local.set({ subscription: subscriptionData });

      console.log('[Stripe] Pro subscription activated!');
      console.log('  Subscription ID:', session.subscriptionId);
      console.log('  Expires:', new Date(endDate));

      return { success: true, subscription: subscriptionData };

    } catch (error) {
      console.error('[Stripe] Error activating Pro subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check server health
   */
  async checkServerHealth() {
    try {
      const response = await fetch(`${this.serverUrl}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[Stripe] Server health check failed:', error);
      return { status: 'error', error: error.message };
    }
  }
}

// Export for use in service worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StripeClient;
}
