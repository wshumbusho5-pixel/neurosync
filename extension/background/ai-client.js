/**
 * NeuroSync AI Client
 * Connects the extension to the AI server for intelligent explanations
 */

class AIClient {
  constructor() {
    // Server URL - update for production
    this.serverUrl = 'http://localhost:3001';
    // For production: 'https://your-ai-server.com'

    this.timeout = 10000; // 10 second timeout
    this.retryAttempts = 2;
  }

  /**
   * Check if AI server is available
   */
  async checkHealth() {
    try {
      const response = await this.fetchWithTimeout(`${this.serverUrl}/health`, {
        method: 'GET'
      }, 3000); // Quick health check

      if (!response.ok) return false;

      const data = await response.json();
      return data.status === 'ok';

    } catch (error) {
      console.log('[AI Client] Server not available:', error.message);
      return false;
    }
  }

  /**
   * Explain a technical term with AI
   */
  async explainTerm(term, context = {}) {
    try {
      const userId = await this.getUserId();
      const isPro = await this.checkIsPro();

      console.log('[AI Client] Requesting explanation for:', term);

      const response = await this.fetchWithTimeout(`${this.serverUrl}/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          term: term,
          context: context,
          userId: userId,
          isPro: isPro
        })
      }, this.timeout);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log('[AI Client] Explanation received:', {
        fromCache: data.fromCache,
        cost: data.usage?.cost,
        tokens: data.usage?.totalTokens || (data.usage?.inputTokens + data.usage?.outputTokens)
      });

      return {
        success: true,
        source: data.fromCache ? 'cache' : 'ai',
        explanation: data.explanation,
        usage: data.usage,
        fromCache: data.fromCache
      };

    } catch (error) {
      console.error('[AI Client] Error explaining term:', error);
      return {
        success: false,
        error: error.message,
        source: 'error'
      };
    }
  }

  /**
   * Analyze page content
   */
  async analyzePage(content, metadata = {}) {
    try {
      const userId = await this.getUserId();
      const isPro = await this.checkIsPro();

      console.log('[AI Client] Analyzing page:', metadata.pageTitle);

      const response = await this.fetchWithTimeout(`${this.serverUrl}/analyze-page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          metadata: metadata,
          userId: userId,
          isPro: isPro
        })
      }, this.timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log('[AI Client] Page analyzed:', data.analysis);

      return {
        success: true,
        analysis: data.analysis,
        usage: data.usage,
        fromCache: data.fromCache
      };

    } catch (error) {
      console.error('[AI Client] Error analyzing page:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate a summary
   */
  async summarize(content, options = {}) {
    try {
      const userId = await this.getUserId();
      const isPro = await this.checkIsPro();

      console.log('[AI Client] Generating summary...');

      const response = await this.fetchWithTimeout(`${this.serverUrl}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          options: options,
          userId: userId,
          isPro: isPro
        })
      }, this.timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log('[AI Client] Summary generated');

      return {
        success: true,
        summary: data.summary,
        usage: data.usage,
        fromCache: data.fromCache
      };

    } catch (error) {
      console.error('[AI Client] Error generating summary:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Answer a question
   */
  async answerQuestion(question, context = {}, useSemanticSearch = false) {
    try {
      const userId = await this.getUserId();
      const isPro = await this.checkIsPro();

      console.log('[AI Client] Answering question:', question);

      const response = await this.fetchWithTimeout(`${this.serverUrl}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          context: context,
          useSemanticSearch: useSemanticSearch,
          userId: userId,
          isPro: isPro
        })
      }, this.timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log('[AI Client] Answer received');

      return {
        success: true,
        answer: data.answer,
        usage: data.usage,
        fromCache: data.fromCache
      };

    } catch (error) {
      console.error('[AI Client] Error answering question:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract concepts from text
   */
  async extractConcepts(text) {
    try {
      const userId = await this.getUserId();
      const isPro = await this.checkIsPro();

      console.log('[AI Client] Extracting concepts...');

      const response = await this.fetchWithTimeout(`${this.serverUrl}/extract-concepts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          userId: userId,
          isPro: isPro
        })
      }, this.timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log('[AI Client] Concepts extracted:', data.concepts?.length);

      return {
        success: true,
        concepts: data.concepts,
        usage: data.usage,
        fromCache: data.fromCache
      };

    } catch (error) {
      console.error('[AI Client] Error extracting concepts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      const response = await this.fetchWithTimeout(`${this.serverUrl}/cache/stats`, {
        method: 'GET'
      }, 3000);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('[AI Client] Error getting cache stats:', error);
      return null;
    }
  }

  /**
   * Fetch with timeout
   */
  async fetchWithTimeout(url, options, timeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Get user ID
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
   * Check if user is Pro
   */
  async checkIsPro() {
    const result = await chrome.storage.local.get('subscription');
    return result.subscription?.isPro || false;
  }

  /**
   * Retry failed requests
   */
  async retryRequest(fn, attempts = this.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === attempts - 1) throw error;

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
}

// Export for use in service worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIClient;
}
