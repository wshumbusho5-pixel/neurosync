/**
 * NeuroSync Phase 0 - UI Components
 *
 * Displays predictions to the user via tooltips and notifications
 */

class NeuroSyncUI {
  constructor() {
    this.currentTooltip = null;
    this.initialized = false;
    this.currentRelatedTermIndex = 0;
    this.relatedTerms = [];
    this.showingHelp = false;
    this.init();
  }

  init() {
    // Inject NeuroSync styles
    this.injectStyles();
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
    this.initialized = true;
    console.log('[NeuroSync] UI initialized with keyboard shortcuts');
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      // ESC: Close tooltip
      if (e.key === 'Escape' && this.currentTooltip) {
        e.preventDefault();
        this.removeTooltip();
        console.log('[NeuroSync] Tooltip closed via Escape key');
      }

      // ?: Show keyboard shortcuts help
      if ((e.key === '?' || (e.shiftKey && e.key === '/')) && !this.showingHelp) {
        e.preventDefault();
        this.showKeyboardHelp();
      }

      // Arrow keys: Navigate related terms (only when tooltip is visible)
      if (this.currentTooltip && this.relatedTerms.length > 0) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          this.navigateRelatedTerms(1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          this.navigateRelatedTerms(-1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.selectCurrentRelatedTerm();
        }
      }

      // H: Mark as helpful (when tooltip visible)
      if (e.key === 'h' && this.currentTooltip && this.currentPrediction) {
        e.preventDefault();
        this.handleTooltipAction('helpful', this.currentPrediction);
      }

      // D: Dismiss (when tooltip visible)
      if (e.key === 'd' && this.currentTooltip && this.currentPrediction) {
        e.preventDefault();
        this.handleTooltipAction('dismiss', this.currentPrediction);
      }
    });
  }

  injectStyles() {
    if (document.getElementById('neurosync-styles')) return;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'neurosync-styles';
    styleSheet.textContent = `
      .neurosync-tooltip {
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        max-width: 400px;
        background: #ffffff;
        border: 2px solid #ea580c;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: neurosync-slide-in 0.3s ease-out;
      }

      @keyframes neurosync-slide-in {
        from {
          opacity: 0;
          transform: translateY(-50%) translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }
      }

      .neurosync-tooltip-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f0f0f0;
      }

      .neurosync-tooltip-icon {
        font-size: 20px;
        margin-right: 8px;
      }

      .neurosync-tooltip-title {
        font-size: 14px;
        font-weight: 600;
        color: #1d1d1f;
        flex: 1;
      }

      .neurosync-tooltip-close {
        background: none;
        border: none;
        font-size: 20px;
        color: #86868b;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }

      .neurosync-tooltip-close:hover {
        color: #1d1d1f;
      }

      .neurosync-tooltip-content {
        color: #1d1d1f;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 16px;
      }

      .neurosync-tooltip-term {
        font-weight: 600;
        color: #ea580c;
        font-family: 'Monaco', 'Menlo', monospace;
      }

      .neurosync-tooltip-actions {
        display: flex;
        gap: 8px;
      }

      .neurosync-btn {
        flex: 1;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
      }

      .neurosync-btn-primary {
        background: #ea580c;
        color: white;
      }

      .neurosync-btn-primary:hover {
        background: #dc2626;
      }

      .neurosync-btn-secondary {
        background: #f5f5f7;
        color: #1d1d1f;
      }

      .neurosync-btn-secondary:hover {
        background: #e8e8ed;
      }

      .neurosync-branding {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #f0f0f0;
        font-size: 11px;
        color: #86868b;
        text-align: center;
      }

      .neurosync-related-term {
        display: inline-block;
        padding: 2px 6px;
        margin: 2px;
        border-radius: 4px;
        transition: all 0.2s;
        cursor: pointer;
      }

      .neurosync-related-term:hover {
        background: #fef3c7;
      }

      /* Keyboard Shortcuts Help Overlay */
      .neurosync-help-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: neurosync-fade-in 0.2s ease-out;
      }

      @keyframes neurosync-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .neurosync-help-modal {
        background: white;
        border-radius: 16px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: neurosync-modal-in 0.3s ease-out;
      }

      @keyframes neurosync-modal-in {
        from {
          transform: scale(0.9);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .neurosync-help-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 2px solid #f0f0f0;
      }

      .neurosync-help-header h2 {
        margin: 0;
        font-size: 20px;
        color: #1d1d1f;
      }

      .neurosync-help-close {
        background: none;
        border: none;
        font-size: 28px;
        color: #86868b;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s;
      }

      .neurosync-help-close:hover {
        background: #f5f5f7;
        color: #1d1d1f;
      }

      .neurosync-help-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .neurosync-help-section h3 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #ea580c;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .neurosync-shortcut {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 0;
      }

      .neurosync-shortcut kbd {
        background: #f5f5f7;
        border: 1px solid #d2d2d7;
        border-radius: 6px;
        padding: 4px 12px;
        font-size: 13px;
        font-weight: 600;
        color: #1d1d1f;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
        min-width: 40px;
        text-align: center;
        box-shadow: 0 2px 0 #d2d2d7;
      }

      .neurosync-shortcut span {
        flex: 1;
        font-size: 14px;
        color: #1d1d1f;
      }

      .neurosync-help-footer {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;
        text-align: center;
        font-size: 13px;
        color: #86868b;
      }

      .neurosync-help-footer kbd {
        background: #f5f5f7;
        border: 1px solid #d2d2d7;
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 12px;
        color: #1d1d1f;
      }
    `;

    document.head.appendChild(styleSheet);
  }

  displayPrediction(prediction) {
    // Remove existing tooltip
    this.removeTooltip();

    // Store current prediction
    this.currentPrediction = prediction;

    // Create new tooltip based on prediction type
    if (prediction.type === 'confusion') {
      this.showConfusionTooltip(prediction);
    } else if (prediction.type === 'search_intent') {
      this.showSearchIntentTooltip(prediction);
    } else if (prediction.type === 'context_loss') {
      this.showContextLossTooltip(prediction);
    }
  }

  showPrediction(prediction) {
    this.displayPrediction(prediction);
  }

  showConfusionTooltip(prediction) {
    const tooltip = document.createElement('div');
    tooltip.className = 'neurosync-tooltip';
    tooltip.id = 'neurosync-current-tooltip';

    tooltip.innerHTML = `
      <div class="neurosync-tooltip-header">
        <span class="neurosync-tooltip-icon">💡</span>
        <span class="neurosync-tooltip-title">${prediction.term || 'Quick Help'}</span>
        <button class="neurosync-tooltip-close" data-action="dismiss">×</button>
      </div>

      <div class="neurosync-tooltip-content">
        ${this.getDefinitionContent(prediction.term)}
      </div>

      <div class="neurosync-tooltip-actions">
        <button class="neurosync-btn neurosync-btn-primary" data-action="helpful">
          👍 Helpful
        </button>
        <button class="neurosync-btn neurosync-btn-secondary" data-action="dismiss">
          Dismiss
        </button>
      </div>

      <div class="neurosync-branding">
        Powered by NeuroSync (Phase 0)
      </div>
    `;

    this.attachTooltipListeners(tooltip, prediction);
    document.body.appendChild(tooltip);
    this.currentTooltip = tooltip;

    // Auto-dismiss after 30 seconds
    setTimeout(() => {
      if (this.currentTooltip === tooltip) {
        this.removeTooltip();
      }
    }, 30000);
  }

  showSearchIntentTooltip(prediction) {
    const tooltip = document.createElement('div');
    tooltip.className = 'neurosync-tooltip';
    tooltip.id = 'neurosync-current-tooltip';

    tooltip.innerHTML = `
      <div class="neurosync-tooltip-header">
        <span class="neurosync-tooltip-icon">🔍</span>
        <span class="neurosync-tooltip-title">Looking for examples?</span>
        <button class="neurosync-tooltip-close" data-action="dismiss">×</button>
      </div>

      <div class="neurosync-tooltip-content">
        <p>It looks like you might want to see an example of <span class="neurosync-tooltip-term">${prediction.term}</span>.</p>
        ${this.getExampleContent(prediction.term)}
      </div>

      <div class="neurosync-tooltip-actions">
        <button class="neurosync-btn neurosync-btn-primary" data-action="helpful">
          👍 Helpful
        </button>
        <button class="neurosync-btn neurosync-btn-secondary" data-action="dismiss">
          Not now
        </button>
      </div>

      <div class="neurosync-branding">
        Powered by NeuroSync (Phase 0)
      </div>
    `;

    this.attachTooltipListeners(tooltip, prediction);
    document.body.appendChild(tooltip);
    this.currentTooltip = tooltip;

    setTimeout(() => {
      if (this.currentTooltip === tooltip) {
        this.removeTooltip();
      }
    }, 30000);
  }

  showContextLossTooltip(prediction) {
    const tooltip = document.createElement('div');
    tooltip.className = 'neurosync-tooltip';
    tooltip.id = 'neurosync-current-tooltip';

    tooltip.innerHTML = `
      <div class="neurosync-tooltip-header">
        <span class="neurosync-tooltip-icon">📍</span>
        <span class="neurosync-tooltip-title">Welcome back!</span>
        <button class="neurosync-tooltip-close" data-action="dismiss">×</button>
      </div>

      <div class="neurosync-tooltip-content">
        <p>You were away for ${Math.round(prediction.timeAway / 60000)} minutes. Would you like a quick recap of what you were reading?</p>
      </div>

      <div class="neurosync-tooltip-actions">
        <button class="neurosync-btn neurosync-btn-primary" data-action="helpful">
          Yes, show recap
        </button>
        <button class="neurosync-btn neurosync-btn-secondary" data-action="dismiss">
          No, I remember
        </button>
      </div>

      <div class="neurosync-branding">
        Powered by NeuroSync (Phase 0)
      </div>
    `;

    this.attachTooltipListeners(tooltip, prediction);
    document.body.appendChild(tooltip);
    this.currentTooltip = tooltip;

    setTimeout(() => {
      if (this.currentTooltip === tooltip) {
        this.removeTooltip();
      }
    }, 30000);
  }

  attachTooltipListeners(tooltip, prediction) {
    tooltip.querySelectorAll('[data-action]').forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        this.handleTooltipAction(action, prediction);
      });
    });

    // Add click handlers to related terms
    tooltip.querySelectorAll('.neurosync-related-term').forEach((termEl, index) => {
      termEl.addEventListener('click', () => {
        const term = termEl.textContent;
        console.log('[NeuroSync] Related term clicked:', term);

        // Show definition for clicked term
        this.showPrediction({
          type: 'confusion',
          pattern: 'confusion',
          term: term,
          confidence: 0.85
        });
      });

      // Highlight on hover
      termEl.addEventListener('mouseenter', () => {
        this.currentRelatedTermIndex = index;
        this.highlightRelatedTerm(index);
      });
    });
  }

  handleTooltipAction(action, prediction) {
    console.log('[NeuroSync] User action:', action, 'on prediction:', prediction.type);

    // Store user feedback
    this.storeFeedback(prediction, action);

    // Remove tooltip
    this.removeTooltip();

    // Additional actions based on type
    if (action === 'helpful' && prediction.type === 'context_loss') {
      // Show recap (in Phase 0, just a placeholder)
      alert('Recap feature coming soon in Phase 1!');
    }
  }

  storeFeedback(prediction, action) {
    chrome.storage.local.get(['feedback'], (result) => {
      const feedback = result.feedback || [];
      feedback.push({
        prediction: prediction,
        action: action,
        timestamp: Date.now()
      });

      // Keep only last 100 feedback entries
      const recentFeedback = feedback.slice(-100);

      chrome.storage.local.set({ feedback: recentFeedback });
    });
  }

  removeTooltip() {
    if (this.currentTooltip) {
      this.currentTooltip.remove();
      this.currentTooltip = null;
    }
  }

  getDefinitionContent(term) {
    // Use knowledge base if available
    if (window.knowledgeBase) {
      const def = window.knowledgeBase.formatDefinition(term);

      if (def) {
        let html = `
          <p><strong>Definition:</strong> ${def.definition}</p>
        `;

        if (def.analogy) {
          html += `<p><strong>Think of it like:</strong> ${def.analogy}</p>`;
        }

        if (def.example) {
          html += `<p><strong>Example:</strong></p><pre style="background: #f5f5f7; padding: 8px; border-radius: 4px; font-size: 12px; overflow-x: auto;">${this.escapeHtml(def.example)}</pre>`;
        }

        if (def.relatedTerms && def.relatedTerms.length > 0) {
          // Store related terms for keyboard navigation
          this.relatedTerms = def.relatedTerms;
          this.currentRelatedTermIndex = 0;

          // Create clickable related terms
          const relatedTermsHTML = def.relatedTerms
            .map(term => `<span class="neurosync-related-term">${term}</span>`)
            .join(' ');

          html += `<p style="font-size: 12px; color: #86868b; margin-top: 12px;"><strong>Related:</strong><br>${relatedTermsHTML}</p>`;

          // Add keyboard hint
          html += `<p style="font-size: 11px; color: #86868b; margin-top: 8px; font-style: italic;">💡 Use arrow keys to navigate, Enter to view, or press ? for all shortcuts</p>`;
        } else {
          this.relatedTerms = [];
        }

        return html;
      }
    }

    // Fallback if term not in knowledge base
    return `<p>NeuroSync detected you might need help with <span class="neurosync-tooltip-term">${term}</span>.</p><p>This term isn't in our knowledge base yet. We're adding more definitions daily!</p>`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getExampleContent(term) {
    // Placeholder examples for Phase 0
    return `<p><em>Example code snippets will be added in Phase 1</em></p>`;
  }

  /**
   * Navigate through related terms with arrow keys
   */
  navigateRelatedTerms(direction) {
    if (this.relatedTerms.length === 0) return;

    // Update index
    this.currentRelatedTermIndex += direction;

    // Wrap around
    if (this.currentRelatedTermIndex < 0) {
      this.currentRelatedTermIndex = this.relatedTerms.length - 1;
    } else if (this.currentRelatedTermIndex >= this.relatedTerms.length) {
      this.currentRelatedTermIndex = 0;
    }

    // Highlight current term
    this.highlightRelatedTerm(this.currentRelatedTermIndex);

    console.log('[NeuroSync] Navigated to related term:', this.relatedTerms[this.currentRelatedTermIndex]);
  }

  /**
   * Highlight a related term
   */
  highlightRelatedTerm(index) {
    const tooltip = this.currentTooltip;
    if (!tooltip) return;

    // Remove previous highlights
    tooltip.querySelectorAll('.neurosync-related-term').forEach(el => {
      el.style.background = 'transparent';
      el.style.fontWeight = 'normal';
    });

    // Highlight current term
    const terms = tooltip.querySelectorAll('.neurosync-related-term');
    if (terms[index]) {
      terms[index].style.background = '#fef3c7';
      terms[index].style.fontWeight = '600';
      terms[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Select the currently highlighted related term
   */
  selectCurrentRelatedTerm() {
    if (this.relatedTerms.length === 0) return;

    const selectedTerm = this.relatedTerms[this.currentRelatedTermIndex];
    console.log('[NeuroSync] Selected related term:', selectedTerm);

    // Show definition for the selected term
    this.showPrediction({
      type: 'confusion',
      pattern: 'confusion',
      term: selectedTerm,
      confidence: 0.85
    });
  }

  /**
   * Show keyboard shortcuts help overlay
   */
  showKeyboardHelp() {
    if (this.showingHelp) return;

    this.showingHelp = true;

    const helpOverlay = document.createElement('div');
    helpOverlay.className = 'neurosync-help-overlay';
    helpOverlay.id = 'neurosync-help';

    helpOverlay.innerHTML = `
      <div class="neurosync-help-modal">
        <div class="neurosync-help-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button class="neurosync-help-close">×</button>
        </div>

        <div class="neurosync-help-content">
          <div class="neurosync-help-section">
            <h3>General</h3>
            <div class="neurosync-shortcut">
              <kbd>?</kbd>
              <span>Show this help</span>
            </div>
            <div class="neurosync-shortcut">
              <kbd>Esc</kbd>
              <span>Close tooltip or help</span>
            </div>
          </div>

          <div class="neurosync-help-section">
            <h3>When Tooltip is Visible</h3>
            <div class="neurosync-shortcut">
              <kbd>H</kbd>
              <span>Mark as helpful</span>
            </div>
            <div class="neurosync-shortcut">
              <kbd>D</kbd>
              <span>Dismiss tooltip</span>
            </div>
          </div>

          <div class="neurosync-help-section">
            <h3>Navigate Related Terms</h3>
            <div class="neurosync-shortcut">
              <kbd>→</kbd> <kbd>↓</kbd>
              <span>Next related term</span>
            </div>
            <div class="neurosync-shortcut">
              <kbd>←</kbd> <kbd>↑</kbd>
              <span>Previous related term</span>
            </div>
            <div class="neurosync-shortcut">
              <kbd>Enter</kbd>
              <span>View selected term</span>
            </div>
          </div>
        </div>

        <div class="neurosync-help-footer">
          Press <kbd>Esc</kbd> to close
        </div>
      </div>
    `;

    // Add click listener to close button and overlay
    const closeBtn = helpOverlay.querySelector('.neurosync-help-close');
    closeBtn.addEventListener('click', () => this.closeKeyboardHelp());

    helpOverlay.addEventListener('click', (e) => {
      if (e.target === helpOverlay) {
        this.closeKeyboardHelp();
      }
    });

    document.body.appendChild(helpOverlay);

    // Allow ESC to close help
    const escHandler = (e) => {
      if (e.key === 'Escape' && this.showingHelp) {
        e.preventDefault();
        this.closeKeyboardHelp();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  /**
   * Close keyboard help overlay
   */
  closeKeyboardHelp() {
    const helpOverlay = document.getElementById('neurosync-help');
    if (helpOverlay) {
      helpOverlay.remove();
    }
    this.showingHelp = false;
  }
}

// Initialize UI when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.neurosyncUI = new NeuroSyncUI();
  });
} else {
  window.neurosyncUI = new NeuroSyncUI();
}
