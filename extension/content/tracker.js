/**
 * NeuroSync Phase 0 - Reading Behavior Tracker
 *
 * Tracks observable user behavior:
 * - Scrolling speed and position
 * - Pause patterns
 * - Mouse hovers
 * - Text selections
 * - Re-reading patterns
 */

class ReadingBehaviorTracker {
  constructor() {
    this.events = [];
    this.lastActivity = Date.now();
    this.lastScrollY = window.scrollY;
    this.lastScrollTime = Date.now();
    this.pauseTimer = null;
    this.currentHoverElement = null;
    this.hoverStartTime = null;

    this.setupListeners();
    console.log('[NeuroSync] Reading behavior tracker initialized');
  }

  setupListeners() {
    // Scroll tracking (debounced)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => this.onScroll(), 100);
    }, { passive: true });

    // Mouse movement tracking (throttled)
    let lastMouseMove = 0;
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastMouseMove > 200) {
        this.onMouseMove(e);
        lastMouseMove = now;
      }
    }, { passive: true });

    // Mouse hover tracking
    document.addEventListener('mouseover', (e) => this.onMouseOver(e), { passive: true });
    document.addEventListener('mouseout', (e) => this.onMouseOut(e), { passive: true });

    // Text selection
    document.addEventListener('selectionchange', () => this.onTextSelection());

    // Visibility changes (tab switches)
    document.addEventListener('visibilitychange', () => this.onVisibilityChange());
  }

  onScroll() {
    const now = Date.now();
    const currentScrollY = window.scrollY;
    const timeDelta = (now - this.lastScrollTime) / 1000; // seconds
    const scrollDelta = Math.abs(currentScrollY - this.lastScrollY);
    const scrollSpeed = timeDelta > 0 ? scrollDelta / timeDelta : 0;

    const position = currentScrollY / (document.body.scrollHeight - window.innerHeight);

    this.addEvent({
      type: 'scroll',
      timestamp: now,
      speed: Math.round(scrollSpeed), // pixels per second
      position: Math.min(1, Math.max(0, position)), // 0 to 1
      direction: currentScrollY > this.lastScrollY ? 'down' : 'up'
    });

    this.lastScrollY = currentScrollY;
    this.lastScrollTime = now;
    this.lastActivity = now;

    // Check for pause after scrolling stops
    this.resetPauseTimer();
  }

  onMouseMove(event) {
    this.lastActivity = Date.now();
    this.resetPauseTimer();
  }

  onMouseOver(event) {
    const element = event.target;

    // Only track meaningful elements (text content)
    if (element.textContent && element.textContent.trim().length > 0) {
      this.currentHoverElement = element;
      this.hoverStartTime = Date.now();
    }
  }

  onMouseOut(event) {
    if (this.currentHoverElement && this.hoverStartTime) {
      const hoverDuration = Date.now() - this.hoverStartTime;

      // Only track hovers longer than 500ms
      if (hoverDuration > 500) {
        const text = this.currentHoverElement.textContent.trim();

        this.addEvent({
          type: 'hover',
          timestamp: Date.now(),
          duration: hoverDuration,
          element: {
            tag: this.currentHoverElement.tagName,
            text: text.substring(0, 100), // First 100 chars
            isTechnicalTerm: this.isTechnicalTerm(text)
          }
        });
      }

      this.currentHoverElement = null;
      this.hoverStartTime = null;
    }
  }

  onTextSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 0) {
      this.addEvent({
        type: 'text_selection',
        timestamp: Date.now(),
        text: selectedText.substring(0, 200),
        length: selectedText.length
      });
    }
  }

  onVisibilityChange() {
    if (document.hidden) {
      this.addEvent({
        type: 'tab_hidden',
        timestamp: Date.now()
      });
    } else {
      this.addEvent({
        type: 'tab_visible',
        timestamp: Date.now()
      });
    }
  }

  resetPauseTimer() {
    clearTimeout(this.pauseTimer);

    this.pauseTimer = setTimeout(() => {
      const pauseDuration = Date.now() - this.lastActivity;

      // Significant pause detected (3+ seconds)
      if (pauseDuration >= 3000) {
        const element = this.getElementAtViewport();

        this.addEvent({
          type: 'pause',
          timestamp: Date.now(),
          duration: pauseDuration,
          element: element ? {
            tag: element.tagName,
            text: element.textContent.substring(0, 200),
            isTechnicalTerm: this.isTechnicalTerm(element.textContent)
          } : null
        });

        // Trigger prediction check
        this.checkForPrediction();
      }
    }, 3000);
  }

  getElementAtViewport() {
    // Get element in the middle of the viewport
    const viewportHeight = window.innerHeight;
    const centerY = viewportHeight / 2;
    const centerX = window.innerWidth / 2;

    return document.elementFromPoint(centerX, centerY);
  }

  isTechnicalTerm(text) {
    if (!text) return false;

    // Simple heuristics for technical terms
    const technicalPatterns = [
      /^[a-z][a-zA-Z0-9]*\(/, // function calls: useState(
      /^[A-Z][a-zA-Z0-9]*$/, // PascalCase: Component
      /^[a-z][a-z0-9]*[A-Z]/, // camelCase: camelCase
      /\w+\.\w+/, // dot notation: object.method
      /[<>{}[\]]/, // code syntax
      /^[A-Z_]+$/ // CONSTANTS
    ];

    return technicalPatterns.some(pattern => pattern.test(text.trim()));
  }

  addEvent(event) {
    this.events.push(event);

    // Keep only last 100 events (memory management)
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }

    // Log for debugging (remove in production)
    if (event.type === 'pause' || event.type === 'hover') {
      console.log('[NeuroSync] Event:', event.type, event);
    }
  }

  checkForPrediction() {
    // Get recent events (last 10 seconds)
    const recentEvents = this.getRecentEvents(10000);

    // Send to predictor
    if (window.neurosyncPredictor) {
      window.neurosyncPredictor.analyze(recentEvents);
    }
  }

  getRecentEvents(timeWindowMs) {
    const cutoffTime = Date.now() - timeWindowMs;
    return this.events.filter(event => event.timestamp > cutoffTime);
  }

  getAllEvents() {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }
}

// Initialize tracker when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.neurosyncTracker = new ReadingBehaviorTracker();
  });
} else {
  window.neurosyncTracker = new ReadingBehaviorTracker();
}
