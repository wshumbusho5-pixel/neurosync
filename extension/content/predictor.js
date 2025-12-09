/**
 * NeuroSync Phase 0 - Prediction Engine
 *
 * Analyzes behavioral events and predicts information needs
 * Using rule-based patterns (no ML in Phase 0)
 */

class PredictionEngine {
  constructor() {
    this.lastPredictionTime = 0;
    this.minPredictionInterval = 30000; // 30 seconds between predictions
    this.confidenceThreshold = 0.7; // Only show predictions above 70% confidence

    console.log('[NeuroSync] Prediction engine initialized');
  }

  async analyze(events) {
    // Rate limiting - don't predict too frequently
    const now = Date.now();
    if (now - this.lastPredictionTime < this.minPredictionInterval) {
      return null;
    }

    // Check usage limits (freemium)
    const canPredict = await this.checkCanPredict();
    if (!canPredict.allowed) {
      this.showPaywall(canPredict);
      return null;
    }

    // Try each pattern detector
    const prediction =
      this.detectConfusionPattern(events) ||
      this.detectSearchIntentPattern(events) ||
      this.detectContextLossPattern(events);

    if (prediction && prediction.confidence >= this.confidenceThreshold) {
      this.lastPredictionTime = now;

      // Record this prediction for usage tracking
      await this.recordPrediction();

      this.showPrediction(prediction);
      return prediction;
    }

    return null;
  }

  async checkCanPredict() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: 'check_can_predict' },
        (response) => {
          resolve(response);
        }
      );
    });
  }

  async recordPrediction() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: 'record_prediction' },
        (response) => {
          resolve(response);
        }
      );
    });
  }

  showPaywall(limitInfo) {
    console.log('[NeuroSync] Usage limit reached:', limitInfo);

    // Send to UI layer to show paywall
    if (window.neurosyncUI) {
      window.neurosyncUI.displayPaywall(limitInfo);
    }
  }

  /**
   * Pattern 1: Confusion on Technical Term
   *
   * Signals:
   * - Pause > 3 seconds
   * - Hover on technical term
   * - Slow scrolling before pause
   */
  detectConfusionPattern(events) {
    // Find recent pause events
    const pauses = events.filter(e => e.type === 'pause' && e.duration >= 3000);
    if (pauses.length === 0) return null;

    const lastPause = pauses[pauses.length - 1];

    // Check if pause was on technical content
    if (!lastPause.element || !lastPause.element.text) return null;

    const text = lastPause.element.text.trim();

    // Check for technical term
    if (lastPause.element.isTechnicalTerm) {
      // Extract the specific term (first word or identifier)
      const term = this.extractTechnicalTerm(text);

      return {
        type: 'confusion',
        subtype: 'technical_term',
        term: term,
        context: text,
        confidence: 0.82,
        action: 'show_definition',
        timestamp: Date.now()
      };
    }

    // Check for complex paragraph (long text, multiple technical terms)
    if (text.length > 100 && this.containsMultipleTechnicalTerms(text)) {
      return {
        type: 'confusion',
        subtype: 'complex_concept',
        context: text.substring(0, 200),
        confidence: 0.75,
        action: 'show_simplification',
        timestamp: Date.now()
      };
    }

    return null;
  }

  /**
   * Pattern 2: Search Intent
   *
   * Signals:
   * - Multiple pauses
   * - Hovering over terms
   * - Re-reading (scrolling up then down)
   */
  detectSearchIntentPattern(events) {
    const recentPauses = events.filter(e => e.type === 'pause');
    const recentHovers = events.filter(e => e.type === 'hover' && e.duration > 1000);

    // Multiple pauses + long hovers = about to search
    if (recentPauses.length >= 2 && recentHovers.length >= 1) {
      const lastHover = recentHovers[recentHovers.length - 1];

      if (lastHover.element && lastHover.element.text) {
        const term = this.extractTechnicalTerm(lastHover.element.text);

        return {
          type: 'search_intent',
          predictedQuery: `${term} example`,
          term: term,
          confidence: 0.78,
          action: 'show_preemptive_answer',
          timestamp: Date.now()
        };
      }
    }

    return null;
  }

  /**
   * Pattern 3: Context Loss
   *
   * Signals:
   * - Tab was hidden then visible again
   * - Time gap > 10 minutes
   * - Erratic scrolling (up and down quickly)
   */
  detectContextLossPattern(events) {
    const tabVisibleEvents = events.filter(e => e.type === 'tab_visible');

    if (tabVisibleEvents.length > 0) {
      const lastVisible = tabVisibleEvents[tabVisibleEvents.length - 1];
      const tabHiddenEvents = events.filter(e => e.type === 'tab_hidden' && e.timestamp < lastVisible.timestamp);

      if (tabHiddenEvents.length > 0) {
        const lastHidden = tabHiddenEvents[tabHiddenEvents.length - 1];
        const timeAway = lastVisible.timestamp - lastHidden.timestamp;

        // User was away for 10+ minutes
        if (timeAway > 600000) {
          // Check for erratic scrolling after return
          const scrollsAfterReturn = events.filter(e =>
            e.type === 'scroll' &&
            e.timestamp > lastVisible.timestamp
          );

          const hasErraticScrolling = this.detectErraticScrolling(scrollsAfterReturn);

          if (hasErraticScrolling) {
            return {
              type: 'context_loss',
              timeAway: timeAway,
              confidence: 0.68,
              action: 'show_context_summary',
              timestamp: Date.now()
            };
          }
        }
      }
    }

    return null;
  }

  detectErraticScrolling(scrollEvents) {
    if (scrollEvents.length < 3) return false;

    let directionChanges = 0;
    for (let i = 1; i < scrollEvents.length; i++) {
      if (scrollEvents[i].direction !== scrollEvents[i - 1].direction) {
        directionChanges++;
      }
    }

    // More than 2 direction changes in short time = erratic
    return directionChanges > 2;
  }

  extractTechnicalTerm(text) {
    // Extract first technical-looking term
    const words = text.split(/\s+/);

    for (const word of words) {
      // camelCase or PascalCase
      if (/^[a-z][a-z0-9]*[A-Z]/.test(word) || /^[A-Z][a-zA-Z0-9]*$/.test(word)) {
        return word.replace(/[^a-zA-Z0-9]/g, '');
      }

      // function calls
      if (/^[a-z][a-zA-Z0-9]*\(/.test(word)) {
        return word.split('(')[0];
      }
    }

    // Fallback: return first word
    return words[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 30);
  }

  containsMultipleTechnicalTerms(text) {
    const technicalTermPattern = /[a-z][a-z0-9]*[A-Z]|[A-Z][a-zA-Z0-9]*|\w+\.\w+|\w+\(/g;
    const matches = text.match(technicalTermPattern);
    return matches && matches.length >= 3;
  }

  async showPrediction(prediction) {
    console.log('[NeuroSync] Prediction:', prediction);

    // Enrich prediction with AI explanation if needed
    if (prediction.term && prediction.action === 'show_definition') {
      await this.enrichWithAI(prediction);
    }

    // Send to UI layer
    if (window.neurosyncUI) {
      window.neurosyncUI.displayPrediction(prediction);
    }

    // Store prediction for analytics
    this.storePrediction(prediction);
  }

  /**
   * Enrich prediction with AI-powered explanation
   */
  async enrichWithAI(prediction) {
    try {
      console.log('[NeuroSync] Fetching AI explanation for:', prediction.term);

      // Build context from content extractor
      const context = window.neurosyncContentExtractor
        ? window.neurosyncContentExtractor.buildAIContext(
            prediction.term,
            prediction.element
          )
        : {};

      // Request AI explanation from background script
      const response = await chrome.runtime.sendMessage({
        type: 'ai_explain',
        term: prediction.term,
        context: context
      });

      if (response.success) {
        // Add AI explanation to prediction
        prediction.aiExplanation = response.explanation;
        prediction.source = response.source; // 'ai', 'cache', 'hardcoded'
        prediction.fromCache = response.fromCache;

        console.log('[NeuroSync] AI explanation received from:', response.source);

        // Track cost if AI was used
        if (response.usage) {
          console.log('[NeuroSync] API cost:', `$${response.usage.cost?.toFixed(4) || '0.0000'}`);
        }
      } else {
        console.warn('[NeuroSync] AI explanation failed:', response.error);

        // Add fallback message
        prediction.aiExplanation = `**${prediction.term}**\n\n${response.error || 'Unable to fetch explanation.'}`;
        prediction.source = 'error';
      }

    } catch (error) {
      console.error('[NeuroSync] Error enriching with AI:', error);

      // Fallback to basic message
      prediction.aiExplanation = `**${prediction.term}**\n\nNo explanation available.`;
      prediction.source = 'error';
    }
  }

  storePrediction(prediction) {
    // Store in chrome.storage for later analysis
    chrome.storage.local.get(['predictions'], (result) => {
      const predictions = result.predictions || [];
      predictions.push(prediction);

      // Keep only last 100 predictions
      const recentPredictions = predictions.slice(-100);

      chrome.storage.local.set({ predictions: recentPredictions });
    });
  }
}

// Initialize predictor when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.neurosyncPredictor = new PredictionEngine();
  });
} else {
  window.neurosyncPredictor = new PredictionEngine();
}
