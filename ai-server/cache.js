/**
 * NeuroSync Intelligent Cache
 * Caches AI responses to reduce API costs (target: 90% cache hit rate)
 */

const NodeCache = require('node-cache');
const crypto = require('crypto');

class IntelligentCache {
  constructor(options = {}) {
    this.cache = new NodeCache({
      stdTTL: options.ttl || 3600,           // Default: 1 hour
      checkperiod: options.checkPeriod || 600, // Clean up every 10 minutes
      maxKeys: options.maxSize || 1000,       // Max 1000 cached items
      useClones: false                         // Don't clone objects (faster)
    });

    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      costSaved: 0
    };

    console.log('[Cache] Initialized with TTL:', options.ttl || 3600, 'seconds');
  }

  /**
   * Generate cache key from request
   */
  generateKey(type, params) {
    const normalized = this.normalizeParams(params);
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ type, ...normalized }))
      .digest('hex')
      .substring(0, 16);

    return `${type}:${hash}`;
  }

  /**
   * Normalize parameters for consistent caching
   */
  normalizeParams(params) {
    const normalized = { ...params };

    // Normalize text (lowercase, trim, remove extra spaces)
    if (normalized.term) {
      normalized.term = normalized.term.toLowerCase().trim();
    }

    if (normalized.question) {
      normalized.question = normalized.question.toLowerCase().trim();
    }

    // Truncate long content to save memory
    if (normalized.content && normalized.content.length > 2000) {
      normalized.content = normalized.content.substring(0, 2000);
    }

    if (normalized.pageContent && normalized.pageContent.length > 2000) {
      normalized.pageContent = normalized.pageContent.substring(0, 2000);
    }

    return normalized;
  }

  /**
   * Get cached response
   */
  get(type, params) {
    const key = this.generateKey(type, params);
    const cached = this.cache.get(key);

    this.stats.totalRequests++;

    if (cached) {
      this.stats.hits++;
      console.log('[Cache] HIT:', key, `(${this.getHitRate()}% hit rate)`);
      return {
        ...cached,
        fromCache: true,
        cacheKey: key
      };
    }

    this.stats.misses++;
    console.log('[Cache] MISS:', key, `(${this.getHitRate()}% hit rate)`);
    return null;
  }

  /**
   * Store response in cache
   */
  set(type, params, response, options = {}) {
    const key = this.generateKey(type, params);
    const ttl = options.ttl || undefined; // Use default if not specified

    // Add metadata
    const cacheEntry = {
      ...response,
      cached_at: Date.now(),
      cache_key: key
    };

    const success = this.cache.set(key, cacheEntry, ttl);

    if (success) {
      console.log('[Cache] STORED:', key, ttl ? `(TTL: ${ttl}s)` : '');

      // Track cost savings
      if (response.usage && response.usage.cost) {
        this.stats.costSaved += response.usage.cost;
      }
    }

    return success;
  }

  /**
   * Check if a similar response exists (fuzzy matching)
   */
  findSimilar(type, params, threshold = 0.8) {
    // Get all keys for this type
    const allKeys = this.cache.keys().filter(k => k.startsWith(type + ':'));

    // For now, exact match only
    // TODO: Implement fuzzy matching using embeddings
    return null;
  }

  /**
   * Invalidate cache entries
   */
  invalidate(type, params = null) {
    if (params) {
      // Invalidate specific entry
      const key = this.generateKey(type, params);
      const deleted = this.cache.del(key);
      console.log('[Cache] INVALIDATED:', key, deleted ? '✓' : '✗');
      return deleted;
    } else {
      // Invalidate all entries of this type
      const keys = this.cache.keys().filter(k => k.startsWith(type + ':'));
      const deleted = this.cache.del(keys);
      console.log('[Cache] INVALIDATED:', type, `(${deleted} entries)`);
      return deleted;
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.flushAll();
    console.log('[Cache] CLEARED all entries');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      hitRate: this.getHitRate(),
      size: this.cache.keys().length,
      costSavedFormatted: `$${this.stats.costSaved.toFixed(4)}`
    };
  }

  /**
   * Calculate cache hit rate
   */
  getHitRate() {
    if (this.stats.totalRequests === 0) return 0;
    return Math.round((this.stats.hits / this.stats.totalRequests) * 100);
  }

  /**
   * Get cache size and memory usage
   */
  getInfo() {
    const keys = this.cache.keys();
    return {
      keys: keys.length,
      stats: this.cache.getStats(),
      hitRate: this.getHitRate(),
      totalRequests: this.stats.totalRequests,
      costSaved: this.stats.costSaved
    };
  }

  /**
   * Preload common explanations (optional optimization)
   */
  async preload(commonTerms = []) {
    console.log('[Cache] Preloading common terms...');

    // This would be called at startup with common terms
    // to pre-populate cache and improve initial hit rate

    // Example: ['useState', 'useEffect', 'async', 'await', etc.]
    // These would be generated once and cached indefinitely

    return commonTerms.length;
  }

  /**
   * Smart cache warming based on user patterns
   */
  warmCache(userPatterns) {
    // Analyze what users commonly ask about
    // Pre-generate and cache those responses

    // TODO: Implement ML-based cache warming
    console.log('[Cache] Cache warming not yet implemented');
  }

  /**
   * Adaptive TTL based on content type
   */
  getAdaptiveTTL(type, params) {
    // Different content has different update frequencies
    const ttlMap = {
      'explain_term': 86400,        // 24 hours (definitions rarely change)
      'analyze_page': 3600,          // 1 hour (page content may update)
      'summarize': 1800,             // 30 minutes (context-specific)
      'answer_question': 7200,       // 2 hours (questions may need updates)
    };

    return ttlMap[type] || 3600; // Default: 1 hour
  }

  /**
   * Cache compression for large responses
   */
  compress(data) {
    // TODO: Implement compression for large cached responses
    // to save memory
    return data;
  }

  /**
   * Export cache for analysis
   */
  export() {
    const keys = this.cache.keys();
    const data = {};

    keys.forEach(key => {
      data[key] = this.cache.get(key);
    });

    return {
      stats: this.getStats(),
      entries: data
    };
  }
}

module.exports = IntelligentCache;
