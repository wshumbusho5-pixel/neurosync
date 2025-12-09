# NeuroSync AI Server Setup Guide

Complete guide to set up the AI-powered intelligence server for NeuroSync.

---

## Overview

The AI server transforms NeuroSync from 52 hardcoded definitions to unlimited AI-powered explanations using:

- **Claude 3.5 Sonnet** (Anthropic) - Primary AI for explanations
- **GPT-4 Turbo** (OpenAI) - Content analysis and semantic search
- **Intelligent Caching** - 90% cost reduction
- **Rate Limiting** - Free and Pro tier management

---

## Prerequisites

- Node.js 18.0 or higher
- Anthropic API account (Claude)
- OpenAI API account (GPT-4)
- Credit card for API billing (both providers)

---

## Part 1: Get API Keys

### Step 1: Anthropic (Claude) API Key

1. Go to https://console.anthropic.com/
2. Sign up for an account
3. Click **"API Keys"** in sidebar
4. Click **"Create Key"**
5. Name it "NeuroSync"
6. Copy the key (starts with `sk-ant-`)
7. **Save it securely** - you can't see it again

**Pricing:**
- Claude 3.5 Sonnet: $3/M input tokens, $15/M output tokens
- First $5 free credit
- ~$0.006 per explanation without caching

### Step 2: OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up for an account
3. Click **"API keys"** in sidebar
4. Click **"Create new secret key"**
5. Name it "NeuroSync"
6. Copy the key (starts with `sk-`)
7. **Save it securely**

**Pricing:**
- GPT-4 Turbo: $10/M input tokens, $30/M output tokens
- Embeddings: $0.02/M tokens
- No free tier (requires payment method)

---

## Part 2: Install & Configure

### Step 1: Install Dependencies

```bash
cd /Users/willyshumbusho/NeuroSync/ai-server
npm install
```

This installs:
- `@anthropic-ai/sdk` - Claude API
- `openai` - OpenAI API
- `express` - Web server
- `node-cache` - Caching layer
- `rate-limiter-flexible` - Rate limiting

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# API Keys
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here

# Server
PORT=3001
NODE_ENV=development

# Caching (CRITICAL for cost savings)
ENABLE_CACHING=true
CACHE_TTL=3600
CACHE_MAX_SIZE=1000

# Rate Limiting
ENABLE_RATE_LIMITING=true
RATE_LIMIT_FREE=20
RATE_LIMIT_PRO=200

# AI Models
CLAUDE_MODEL=claude-3-5-sonnet-20241022
OPENAI_MODEL=gpt-4-turbo-preview
```

### Step 3: Start Server

```bash
npm start
```

You should see:

```
[NeuroSync AI] Server running on port 3001
[NeuroSync AI] Environment: development
[NeuroSync AI] Claude configured: true
[NeuroSync AI] OpenAI configured: true
[NeuroSync AI] Caching: enabled
[NeuroSync AI] Rate limiting: enabled
```

### Step 4: Test Server

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-12-07T...",
  "ai": {
    "claude": true,
    "openai": true
  },
  "cache": {
    "enabled": true,
    "stats": {
      "hits": 0,
      "misses": 0,
      "totalRequests": 0,
      "hitRate": 0
    }
  }
}
```

---

## Part 3: Test AI Features

### Test 1: Explain a Term

```bash
curl -X POST http://localhost:3001/explain \
  -H "Content-Type: application/json" \
  -d '{
    "term": "useEffect",
    "context": {
      "pageTitle": "React Hooks Tutorial",
      "surroundingText": "useEffect(() => { fetchData(); }, []);",
      "userLevel": "intermediate"
    },
    "userId": "test123"
  }'
```

Expected response:

```json
{
  "success": true,
  "explanation": "**Definition:** useEffect is a React Hook that lets you perform side effects...",
  "usage": {
    "inputTokens": 145,
    "outputTokens": 287,
    "cost": 0.00474
  },
  "fromCache": false
}
```

**Run it again** - should return `"fromCache": true` and cost $0!

### Test 2: Analyze Page

```bash
curl -X POST http://localhost:3001/analyze-page \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# React Hooks\n\nReact Hooks are functions that let you use state and other React features...",
    "metadata": {
      "pageTitle": "React Hooks Documentation",
      "url": "https://react.dev/hooks"
    },
    "userId": "test123"
  }'
```

### Test 3: Summarize Content

```bash
curl -X POST http://localhost:3001/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Long article about React Hooks...",
    "options": {
      "lastPosition": "Section 3",
      "timeAway": "15 minutes"
    },
    "userId": "test123"
  }'
```

### Test 4: Answer Question

```bash
curl -X POST http://localhost:3001/answer \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the difference between useState and useRef?",
    "context": {
      "pageTitle": "React Hooks",
      "pageContent": "React documentation content..."
    },
    "userId": "test123"
  }'
```

### Test 5: Check Cache Stats

```bash
curl http://localhost:3001/cache/stats
```

After running tests, you should see:

```json
{
  "hits": 3,
  "misses": 5,
  "totalRequests": 8,
  "hitRate": 37,
  "costSaved": 0.0142,
  "costSavedFormatted": "$0.0142",
  "size": 5
}
```

---

## Part 4: Connect Extension to AI Server

Now let's connect the NeuroSync extension to use AI instead of hardcoded definitions.

### Step 1: Update Extension Manifest

Edit `/Users/willyshumbusho/NeuroSync/extension/manifest.json`:

```json
{
  "host_permissions": [
    "<all_urls>",
    "http://localhost:3001/*"
  ]
}
```

For production:
```json
{
  "host_permissions": [
    "<all_urls>",
    "https://your-ai-server.com/*"
  ]
}
```

### Step 2: Create AI Client for Extension

Create `/Users/willyshumbusho/NeuroSync/extension/background/ai-client.js`:

```javascript
class AIClient {
  constructor() {
    this.serverUrl = 'http://localhost:3001';
  }

  async explainTerm(term, context = {}) {
    const userId = await this.getUserId();
    const isPro = await this.checkIsPro();

    const response = await fetch(`${this.serverUrl}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term, context, userId, isPro })
    });

    return await response.json();
  }

  async getUserId() {
    const result = await chrome.storage.local.get('userId');
    return result.userId || 'anonymous';
  }

  async checkIsPro() {
    const result = await chrome.storage.local.get('subscription');
    return result.subscription?.isPro || false;
  }
}
```

### Step 3: Update Service Worker

Edit `/Users/willyshumbusho/NeuroSync/extension/background/service-worker.js`:

Add at the top:
```javascript
importScripts('ai-client.js');
const aiClient = new AIClient();
```

Add message handler:
```javascript
if (message.type === 'ai_explain') {
  aiClient.explainTerm(message.term, message.context).then(sendResponse);
  return true;
}
```

### Step 4: Update Predictor to Use AI

Edit `/Users/willyshumbusho/NeuroSync/extension/content/predictor.js`:

Replace hardcoded knowledge base lookup with AI call:

```javascript
async getExplanation(term, context) {
  // Try hardcoded knowledge base first (instant, free)
  const hardcoded = KnowledgeBase.search(term);

  if (hardcoded) {
    return {
      source: 'cache',
      ...hardcoded
    };
  }

  // Fall back to AI (slower, uses API credit)
  const response = await chrome.runtime.sendMessage({
    type: 'ai_explain',
    term: term,
    context: context
  });

  if (response.success) {
    return {
      source: 'ai',
      definition: response.explanation
    };
  }

  return null;
}
```

### Step 5: Reload Extension

1. Go to `chrome://extensions`
2. Find NeuroSync
3. Click refresh icon
4. Extension now uses AI!

---

## Part 5: Monitor & Optimize

### Monitor Costs

Check API usage:

**Anthropic Dashboard:**
https://console.anthropic.com/settings/usage

**OpenAI Dashboard:**
https://platform.openai.com/usage

**Local Cache Stats:**
```bash
curl http://localhost:3001/cache/stats
```

### Target Metrics

- **Cache hit rate:** >90%
- **Cost per user per day:** <$0.03
- **Response time:** <2 seconds
- **API error rate:** <1%

### Cost Optimization Tips

1. **Maximize caching:**
   - Set long TTL for definitions (24 hours)
   - Pre-cache common terms
   - Use adaptive TTL

2. **Reduce token usage:**
   - Truncate long context (max 2000 chars)
   - Use shorter prompts
   - Request fewer tokens

3. **Smart provider selection:**
   - Simple queries → Use cache
   - Complex queries → Use Claude (cheaper)
   - Structured output → Use GPT-4

4. **Rate limiting:**
   - Free users: 20 AI calls/hour
   - Rest served from cache
   - Pro users: 200 AI calls/hour

---

## Part 6: Production Deployment

### Option 1: Heroku

```bash
cd ai-server
git init
heroku create neurosync-ai
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set NODE_ENV=production
git add .
git commit -m "Deploy AI server"
git push heroku main
```

### Option 2: Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Choose `ai-server` folder
5. Add environment variables
6. Deploy

### Option 3: Vercel (Serverless)

```bash
npm i -g vercel
cd ai-server
vercel
```

Add environment variables in Vercel dashboard.

### Update Extension for Production

Edit `extension/background/ai-client.js`:

```javascript
constructor() {
  // this.serverUrl = 'http://localhost:3001'; // Dev
  this.serverUrl = 'https://neurosync-ai.herokuapp.com'; // Production
}
```

---

## Troubleshooting

### Error: Invalid API key

**Cause:** API key not set or incorrect

**Solution:**
1. Check `.env` file exists in `ai-server/`
2. Verify keys are correct (no extra spaces)
3. Restart server after changing `.env`

### Error: Rate limit exceeded

**Cause:** Too many requests per hour

**Solution:**
- Free users: Wait 1 hour or upgrade to Pro
- Pro users: Increase limit in `.env`
- Developer: Disable rate limiting for testing

### High costs (>$1/day)

**Cause:** Low cache hit rate

**Solution:**
1. Check cache stats: `curl localhost:3001/cache/stats`
2. Ensure `ENABLE_CACHING=true` in `.env`
3. Increase `CACHE_TTL` to 86400 (24 hours)
4. Pre-populate cache with common terms

### Slow responses (>5 seconds)

**Cause:** AI API latency

**Solution:**
1. Implement response streaming
2. Reduce token limits
3. Use Claude instead of GPT-4 (faster)
4. Add loading indicators in UI

### Cache not working

**Cause:** Different context on each request

**Solution:**
1. Normalize context before caching
2. Truncate long content to consistent length
3. Ignore timestamps in cache key
4. Use fuzzy matching for similar requests

---

## Cost Projections

### Realistic Scenario

**Assumptions:**
- 1000 active users
- 50 predictions/day average
- 90% cache hit rate

**Costs:**
- Daily AI calls: 5,000
- Cost per call: $0.006
- Daily cost: $30
- Monthly cost: $900

**Revenue:**
- 10% Pro conversion: 100 users
- Pro price: $4.99/month
- Monthly revenue: $499

**Result:** -$401/month ❌

### Optimized Scenario

**Changes:**
- Increase Pro pricing to $9.99
- 95% cache hit rate (better optimization)
- Pre-cache top 1000 terms

**Costs:**
- Daily AI calls: 2,500
- Daily cost: $15
- Monthly cost: $450

**Revenue:**
- 10% Pro conversion: 100 users
- Pro price: $9.99/month
- Monthly revenue: $999

**Result:** +$549/month ✅

### Scale Scenario

**At 10,000 users:**
- 20% Pro conversion: 2,000 users
- Monthly revenue: $19,980
- Monthly AI cost: $4,500
- **Profit: $15,480/month**

---

## Next Steps

1. ✅ Test all API endpoints
2. ✅ Verify caching works
3. ✅ Connect extension to AI server
4. ⬜ Implement content extraction in extension
5. ⬜ Add AI-powered UI updates
6. ⬜ Deploy to production
7. ⬜ Monitor costs and optimize

---

## Support

- **Anthropic Console:** https://console.anthropic.com/
- **OpenAI Platform:** https://platform.openai.com/
- **Documentation:** See `AI_INTEGRATION_PLAN.md`
- **Server API Docs:** See `ai-server/README.md`

---

**Congratulations!** Your AI server is ready. NeuroSync can now explain ANY concept, not just the 52 hardcoded ones! 🎉
