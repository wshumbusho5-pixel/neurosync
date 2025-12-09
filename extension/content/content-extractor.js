/**
 * NeuroSync Content Extractor
 * Extracts and analyzes page content to provide context for AI
 */

class ContentExtractor {
  constructor() {
    this.maxContentLength = 3000; // Limit to reduce API costs
    this.cache = {
      content: null,
      timestamp: 0,
      ttl: 30000 // Cache for 30 seconds
    };
  }

  /**
   * Extract visible page content
   */
  extractPageContent() {
    // Check cache first
    if (this.cache.content && Date.now() - this.cache.timestamp < this.cache.ttl) {
      return this.cache.content;
    }

    const content = {
      title: this.getPageTitle(),
      url: window.location.href,
      headings: this.getHeadings(),
      mainContent: this.getMainContent(),
      codeBlocks: this.getCodeBlocks(),
      readingPosition: this.getReadingPosition(),
      metadata: this.getMetadata()
    };

    // Cache it
    this.cache.content = content;
    this.cache.timestamp = Date.now();

    return content;
  }

  /**
   * Get page title
   */
  getPageTitle() {
    return document.title || document.querySelector('h1')?.textContent || 'Untitled';
  }

  /**
   * Get all headings
   */
  getHeadings() {
    const headings = [];
    const elements = document.querySelectorAll('h1, h2, h3, h4');

    elements.forEach((el, index) => {
      if (this.isVisible(el) && index < 20) { // Limit to 20 headings
        headings.push({
          level: parseInt(el.tagName[1]),
          text: el.textContent.trim().substring(0, 200)
        });
      }
    });

    return headings;
  }

  /**
   * Get main content text
   */
  getMainContent() {
    // Try to find main content container
    const candidates = [
      document.querySelector('main'),
      document.querySelector('article'),
      document.querySelector('[role="main"]'),
      document.querySelector('.content'),
      document.querySelector('.main-content'),
      document.body
    ];

    const mainContainer = candidates.find(el => el !== null);
    if (!mainContainer) return '';

    // Extract text, excluding scripts, styles, nav, etc.
    const clone = mainContainer.cloneNode(true);

    // Remove unwanted elements
    const unwanted = clone.querySelectorAll('script, style, nav, header, footer, aside, .sidebar, .navigation');
    unwanted.forEach(el => el.remove());

    // Get text content
    let text = clone.textContent || '';

    // Clean up whitespace
    text = text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, this.maxContentLength);

    return text;
  }

  /**
   * Get code blocks
   */
  getCodeBlocks() {
    const blocks = [];
    const codeElements = document.querySelectorAll('pre code, pre, code');

    codeElements.forEach((el, index) => {
      if (this.isVisible(el) && index < 10) { // Limit to 10 code blocks
        const code = el.textContent.trim();

        // Only include if it looks like code (not just a single word)
        if (code.length > 20 && code.length < 500) {
          blocks.push({
            language: this.detectLanguage(el),
            code: code
          });
        }
      }
    });

    return blocks;
  }

  /**
   * Detect programming language from code block
   */
  detectLanguage(element) {
    // Check class names
    const classes = element.className || '';

    if (classes.includes('javascript') || classes.includes('js')) return 'javascript';
    if (classes.includes('python') || classes.includes('py')) return 'python';
    if (classes.includes('typescript') || classes.includes('ts')) return 'typescript';
    if (classes.includes('java')) return 'java';
    if (classes.includes('cpp') || classes.includes('c++')) return 'cpp';
    if (classes.includes('rust')) return 'rust';
    if (classes.includes('go')) return 'go';
    if (classes.includes('html')) return 'html';
    if (classes.includes('css')) return 'css';
    if (classes.includes('sql')) return 'sql';
    if (classes.includes('bash') || classes.includes('shell')) return 'bash';

    // Check data attributes
    const lang = element.getAttribute('data-lang') || element.getAttribute('data-language');
    if (lang) return lang;

    return 'unknown';
  }

  /**
   * Get current reading position
   */
  getReadingPosition() {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

    // Find which heading is currently visible
    const headings = document.querySelectorAll('h1, h2, h3');
    let currentHeading = null;

    for (const heading of headings) {
      const rect = heading.getBoundingClientRect();

      if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
        currentHeading = heading.textContent.trim();
        break;
      }
    }

    return {
      scrollPercent: Math.round(scrollPercent),
      currentSection: currentHeading
    };
  }

  /**
   * Get page metadata
   */
  getMetadata() {
    // Try to detect document type
    const url = window.location.href;
    const title = document.title.toLowerCase();

    let documentType = 'article';

    if (url.includes('docs.') || url.includes('/docs/') || title.includes('documentation')) {
      documentType = 'documentation';
    } else if (url.includes('tutorial') || title.includes('tutorial')) {
      documentType = 'tutorial';
    } else if (url.includes('reference') || title.includes('reference') || title.includes('api')) {
      documentType = 'reference';
    } else if (url.includes('guide') || title.includes('guide')) {
      documentType = 'guide';
    } else if (url.includes('blog') || title.includes('blog')) {
      documentType = 'blog';
    }

    // Detect main technology/topic
    const technologies = this.detectTechnologies();

    return {
      documentType: documentType,
      technologies: technologies,
      domain: window.location.hostname,
      language: document.documentElement.lang || 'en'
    };
  }

  /**
   * Detect technologies mentioned on the page
   */
  detectTechnologies() {
    const text = (document.title + ' ' + this.getMainContent()).toLowerCase();
    const technologies = [];

    const techKeywords = {
      'react': /\breact\b/,
      'vue': /\bvue\b/,
      'angular': /\bangular\b/,
      'javascript': /\bjavascript\b|\bjs\b/,
      'typescript': /\btypescript\b|\bts\b/,
      'python': /\bpython\b/,
      'java': /\bjava\b/,
      'node.js': /\bnode\.?js\b/,
      'express': /\bexpress\b/,
      'mongodb': /\bmongodb\b/,
      'postgresql': /\bpostgresql\b|\bpostgres\b/,
      'mysql': /\bmysql\b/,
      'docker': /\bdocker\b/,
      'kubernetes': /\bkubernetes\b/,
      'aws': /\baws\b/,
      'git': /\bgit\b/
    };

    for (const [tech, regex] of Object.entries(techKeywords)) {
      if (regex.test(text)) {
        technologies.push(tech);
      }
    }

    return technologies.slice(0, 5); // Limit to 5
  }

  /**
   * Get context around a specific term
   */
  getTermContext(term, element) {
    if (!element) return null;

    // Get the text node containing the term
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let currentNode;
    let termNode = null;

    while (currentNode = walker.nextNode()) {
      if (currentNode.textContent.toLowerCase().includes(term.toLowerCase())) {
        termNode = currentNode;
        break;
      }
    }

    if (!termNode) return null;

    // Get surrounding text (5 lines before and after)
    const parent = termNode.parentElement;
    const fullText = parent.textContent;
    const termIndex = fullText.toLowerCase().indexOf(term.toLowerCase());

    if (termIndex === -1) return null;

    // Extract context (500 chars before and after)
    const start = Math.max(0, termIndex - 500);
    const end = Math.min(fullText.length, termIndex + term.length + 500);

    const context = fullText.substring(start, end).trim();

    return {
      surroundingText: context,
      fullParagraph: parent.textContent.trim()
    };
  }

  /**
   * Check if element is visible
   */
  isVisible(element) {
    if (!element) return false;

    const style = window.getComputedStyle(element);

    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0' &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0;
  }

  /**
   * Build AI context object
   */
  buildAIContext(term = null, element = null) {
    const pageContent = this.extractPageContent();

    const context = {
      pageTitle: pageContent.title,
      url: pageContent.url,
      documentType: pageContent.metadata.documentType,
      technologies: pageContent.metadata.technologies,
      currentSection: pageContent.readingPosition.currentSection,
      scrollPercent: pageContent.readingPosition.scrollPercent,
      pageContent: pageContent.mainContent,
      headings: pageContent.headings.map(h => h.text).slice(0, 10).join(' > ')
    };

    // Add term-specific context if provided
    if (term && element) {
      const termContext = this.getTermContext(term, element);

      if (termContext) {
        context.surroundingText = termContext.surroundingText;
        context.fullParagraph = termContext.fullParagraph;
      }
    }

    // Estimate user's knowledge level based on content
    context.userLevel = this.estimateKnowledgeLevel(pageContent);

    return context;
  }

  /**
   * Estimate user's knowledge level from content type
   */
  estimateKnowledgeLevel(pageContent) {
    const title = pageContent.title.toLowerCase();
    const content = pageContent.mainContent.toLowerCase();

    if (title.includes('introduction') || title.includes('getting started') || content.includes('beginner')) {
      return 'beginner';
    }

    if (title.includes('advanced') || content.includes('advanced')) {
      return 'advanced';
    }

    return 'intermediate';
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.content = null;
    this.cache.timestamp = 0;
  }
}

// Initialize globally
window.neurosyncContentExtractor = new ContentExtractor();

console.log('[NeuroSync] Content extractor initialized');
