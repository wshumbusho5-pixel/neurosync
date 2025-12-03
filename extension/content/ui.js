/**
 * NeuroSync Phase 0 - UI Components
 *
 * Displays predictions to the user via tooltips and notifications
 */

class NeuroSyncUI {
  constructor() {
    this.currentTooltip = null;
    this.initialized = false;
    this.init();
  }

  init() {
    // Inject NeuroSync styles
    this.injectStyles();
    this.initialized = true;
    console.log('[NeuroSync] UI initialized');
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
    `;

    document.head.appendChild(styleSheet);
  }

  displayPrediction(prediction) {
    // Remove existing tooltip
    this.removeTooltip();

    // Create new tooltip based on prediction type
    if (prediction.type === 'confusion') {
      this.showConfusionTooltip(prediction);
    } else if (prediction.type === 'search_intent') {
      this.showSearchIntentTooltip(prediction);
    } else if (prediction.type === 'context_loss') {
      this.showContextLossTooltip(prediction);
    }
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
          html += `<p style="font-size: 12px; color: #86868b;"><strong>Related:</strong> ${def.relatedTerms.join(', ')}</p>`;
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
}

// Initialize UI when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.neurosyncUI = new NeuroSyncUI();
  });
} else {
  window.neurosyncUI = new NeuroSyncUI();
}
