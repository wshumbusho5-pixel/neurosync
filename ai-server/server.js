/**
 * NeuroSync AI Server
 *
 * Provides AI-powered intelligence for the NeuroSync browser extension
 * using Claude (Anthropic) and GPT-4 (OpenAI)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const ClaudeClient = require('./claude-client');
const OpenAIClient = require('./openai-client');
const IntelligentCache = require('./cache');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize AI clients
const claude = new ClaudeClient(
  process.env.ANTHROPIC_API_KEY,
  process.env.CLAUDE_MODEL
);

const openai = new OpenAIClient(
  process.env.OPENAI_API_KEY,
  process.env.OPENAI_MODEL
);

// Initialize cache
const cache = new IntelligentCache({
  ttl: parseInt(process.env.CACHE_TTL) || 3600,
  maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000
});

// Rate limiters
const freeLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_FREE) || 20,
  duration: 3600, // per hour
});

const proLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_PRO) || 200,
  duration: 3600, // per hour
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('chrome-extension://') || origin.startsWith('safari-extension://')) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * Rate limiting middleware
 */
async function rateLimitMiddleware(req, res, next) {
  if (process.env.ENABLE_RATE_LIMITING !== 'true') {
    return next();
  }

  const userId = req.body.userId || req.headers['x-user-id'] || 'anonymous';
  const isPro = req.body.isPro || req.headers['x-is-pro'] === 'true';

  const limiter = isPro ? proLimiter : freeLimiter;

  try {
    await limiter.consume(userId);
    next();
  } catch (rateLimitError) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: isPro
        ? 'Pro limit: 200 requests per hour'
        : 'Free limit: 20 requests per hour. Upgrade to Pro for more.',
      retryAfter: Math.round(rateLimitError.msBeforeNext / 1000)
    });
  }
}

/**
 * POST /explain
 * Explain a technical term with context
 */
app.post('/explain', rateLimitMiddleware, async (req, res) => {
  try {
    const { term, context = {}, userId } = req.body;

    if (!term) {
      return res.status(400).json({ error: 'term is required' });
    }

    // Check cache first
    if (process.env.ENABLE_CACHING === 'true') {
      const cached = cache.get('explain_term', { term, context });
      if (cached) {
        return res.json(cached);
      }
    }

    // Get AI explanation
    console.log('[AI] Explaining term:', term);
    const result = await claude.explainTerm(term, context);

    if (result.success) {
      // Cache the result
      if (process.env.ENABLE_CACHING === 'true') {
        const ttl = cache.getAdaptiveTTL('explain_term', { term });
        cache.set('explain_term', { term, context }, result, { ttl });
      }

      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }

  } catch (error) {
    console.error('[AI] Error in /explain:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /analyze-page
 * Analyze page content and extract key information
 */
app.post('/analyze-page', rateLimitMiddleware, async (req, res) => {
  try {
    const { content, metadata = {}, userId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    // Check cache
    if (process.env.ENABLE_CACHING === 'true') {
      const cached = cache.get('analyze_page', { content: content.substring(0, 500), metadata });
      if (cached) {
        return res.json(cached);
      }
    }

    // Use OpenAI for page analysis (better structured output)
    console.log('[AI] Analyzing page:', metadata.pageTitle || 'untitled');
    const result = await openai.analyzePage(content, metadata);

    if (result.success) {
      // Cache the result
      if (process.env.ENABLE_CACHING === 'true') {
        const ttl = cache.getAdaptiveTTL('analyze_page', { content });
        cache.set('analyze_page', { content: content.substring(0, 500), metadata }, result, { ttl });
      }

      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }

  } catch (error) {
    console.error('[AI] Error in /analyze-page:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /summarize
 * Generate a summary of content
 */
app.post('/summarize', rateLimitMiddleware, async (req, res) => {
  try {
    const { content, options = {}, userId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    // Check cache
    if (process.env.ENABLE_CACHING === 'true') {
      const cached = cache.get('summarize', { content: content.substring(0, 500), options });
      if (cached) {
        return res.json(cached);
      }
    }

    // Use Claude for summarization
    console.log('[AI] Summarizing content...');
    const result = await claude.summarize(content, options);

    if (result.success) {
      // Cache with shorter TTL (summaries are more context-specific)
      if (process.env.ENABLE_CACHING === 'true') {
        cache.set('summarize', { content: content.substring(0, 500), options }, result, { ttl: 1800 });
      }

      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }

  } catch (error) {
    console.error('[AI] Error in /summarize:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /answer
 * Answer a question about content
 */
app.post('/answer', rateLimitMiddleware, async (req, res) => {
  try {
    const { question, context = {}, userId, useSemanticSearch = false } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    // Check cache
    if (process.env.ENABLE_CACHING === 'true') {
      const cached = cache.get('answer_question', { question, context });
      if (cached) {
        return res.json(cached);
      }
    }

    console.log('[AI] Answering question:', question);

    let result;

    // Use semantic search if enabled and page content provided
    if (useSemanticSearch && context.pageContent) {
      // Extract sections from page content
      const sections = extractSections(context.pageContent);

      // Semantic search to find relevant sections
      const searchResult = await openai.semanticSearch(question, sections);

      if (searchResult.success) {
        // Answer using top results
        context.searchResults = searchResult.results.slice(0, 3);
        result = await openai.answerQuestion(question, context);
      } else {
        // Fallback to Claude without search
        result = await claude.answerQuestion(question, context);
      }
    } else {
      // Standard answer using Claude
      result = await claude.answerQuestion(question, context);
    }

    if (result.success) {
      // Cache the answer
      if (process.env.ENABLE_CACHING === 'true') {
        cache.set('answer_question', { question, context }, result, { ttl: 7200 });
      }

      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }

  } catch (error) {
    console.error('[AI] Error in /answer:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /extract-concepts
 * Extract key technical concepts from text
 */
app.post('/extract-concepts', rateLimitMiddleware, async (req, res) => {
  try {
    const { text, userId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    // Check cache
    if (process.env.ENABLE_CACHING === 'true') {
      const cached = cache.get('extract_concepts', { text: text.substring(0, 500) });
      if (cached) {
        return res.json(cached);
      }
    }

    console.log('[AI] Extracting concepts...');
    const result = await openai.extractConcepts(text);

    if (result.success) {
      // Cache with long TTL
      if (process.env.ENABLE_CACHING === 'true') {
        cache.set('extract_concepts', { text: text.substring(0, 500) }, result, { ttl: 86400 });
      }

      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }

  } catch (error) {
    console.error('[AI] Error in /extract-concepts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /cache/stats
 * Get cache statistics
 */
app.get('/cache/stats', (req, res) => {
  res.json(cache.getStats());
});

/**
 * POST /cache/clear
 * Clear cache (admin only)
 */
app.post('/cache/clear', (req, res) => {
  const { adminKey } = req.body;

  // Simple admin authentication
  if (adminKey !== process.env.ADMIN_KEY && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  cache.clear();
  res.json({ success: true, message: 'Cache cleared' });
});

/**
 * GET /health
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ai: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    },
    cache: {
      enabled: process.env.ENABLE_CACHING === 'true',
      stats: cache.getStats()
    },
    rateLimit: {
      enabled: process.env.ENABLE_RATE_LIMITING === 'true',
      free: process.env.RATE_LIMIT_FREE,
      pro: process.env.RATE_LIMIT_PRO
    }
  });
});

/**
 * Helper: Extract sections from page content
 */
function extractSections(content) {
  // Split content by headings or paragraphs
  const sections = [];
  const lines = content.split('\n');

  let currentSection = '';
  for (const line of lines) {
    if (line.trim().length === 0) continue;

    // Check if it's a heading (heuristic)
    if (line.length < 100 && !line.includes('.')) {
      if (currentSection) {
        sections.push({ text: currentSection.trim() });
      }
      currentSection = line + '\n';
    } else {
      currentSection += line + '\n';

      // Split into chunks of ~500 chars
      if (currentSection.length > 500) {
        sections.push({ text: currentSection.trim() });
        currentSection = '';
      }
    }
  }

  if (currentSection) {
    sections.push({ text: currentSection.trim() });
  }

  return sections;
}

/**
 * Start Server
 */
app.listen(PORT, () => {
  console.log(`[NeuroSync AI] Server running on port ${PORT}`);
  console.log(`[NeuroSync AI] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[NeuroSync AI] Claude configured: ${!!process.env.ANTHROPIC_API_KEY}`);
  console.log(`[NeuroSync AI] OpenAI configured: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`[NeuroSync AI] Caching: ${process.env.ENABLE_CACHING === 'true' ? 'enabled' : 'disabled'}`);
  console.log(`[NeuroSync AI] Rate limiting: ${process.env.ENABLE_RATE_LIMITING === 'true' ? 'enabled' : 'disabled'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[NeuroSync AI] Server shutting down...');
  console.log('[NeuroSync AI] Final cache stats:', cache.getStats());
  process.exit(0);
});
