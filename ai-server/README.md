# NeuroSync AI Server

AI-powered intelligence server for NeuroSync using Claude (Anthropic) and GPT-4 (OpenAI).

## Features

- **Dynamic Explanations**: Explain ANY technical term using Claude AI
- **Content Analysis**: Understand page context with GPT-4
- **Smart Summaries**: Generate contextual summaries
- **Semantic Search**: Find relevant information using embeddings
- **Intelligent Caching**: 90%+ cache hit rate to reduce costs
- **Rate Limiting**: Free and Pro tier limits
- **Cost Tracking**: Monitor API usage and costs

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Get from https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-key-here
```

### 3. Start Server

```bash
npm start
```

Server runs on `http://localhost:3001`

### 4. Test

```bash
curl http://localhost:3001/health
```

## API Endpoints

### POST /explain

Explain a technical term with context.

**Request:**
```json
{
  "term": "useEffect",
  "context": {
    "pageTitle": "React Hooks Tutorial",
    "surroundingText": "function App() { useEffect(() => { ... }, []); }",
    "userLevel": "intermediate"
  },
  "userId": "user_123",
  "isPro": false
}
```

**Response:**
```json
{
  "success": true,
  "explanation": "**Definition:** useEffect is a React Hook...",
  "usage": {
    "inputTokens": 150,
    "outputTokens": 300,
    "cost": 0.0055
  },
  "fromCache": false
}
```

### POST /analyze-page

Analyze page content and extract key information.

**Request:**
```json
{
  "content": "# React Hooks\n\nReact Hooks are functions that...",
  "metadata": {
    "pageTitle": "React Hooks Documentation",
    "url": "https://react.dev/hooks"
  },
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "documentType": "documentation",
    "mainTopic": "React Hooks",
    "keyTerms": ["useState", "useEffect", "useContext"],
    "difficulty": "intermediate",
    "prerequisites": ["JavaScript", "React basics"],
    "summary": "Introduction to React Hooks..."
  },
  "usage": { ... }
}
```

### POST /summarize

Generate a summary of content.

**Request:**
```json
{
  "content": "Long article text...",
  "options": {
    "lastPosition": "Section 3: Advanced Hooks",
    "timeAway": "15 minutes",
    "reason": "switched tabs"
  },
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "summary": "This article covers React Hooks...",
  "usage": { ... }
}
```

### POST /answer

Answer a question about content.

**Request:**
```json
{
  "question": "What is the difference between useState and useRef?",
  "context": {
    "pageTitle": "React Hooks",
    "pageContent": "...",
    "userLevel": "beginner"
  },
  "useSemanticSearch": true,
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "useState and useRef are both React Hooks...",
  "usage": { ... }
}
```

### POST /extract-concepts

Extract key technical concepts from text.

**Request:**
```json
{
  "text": "React Hooks like useState and useEffect...",
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "concepts": [
    {
      "term": "useState",
      "category": "framework",
      "importance": "high"
    },
    {
      "term": "useEffect",
      "category": "framework",
      "importance": "high"
    }
  ],
  "usage": { ... }
}
```

### GET /cache/stats

Get cache statistics.

**Response:**
```json
{
  "hits": 450,
  "misses": 50,
  "totalRequests": 500,
  "hitRate": 90,
  "costSaved": 0.2475,
  "costSavedFormatted": "$0.2475",
  "size": 248
}
```

### GET /health

Health check and system status.

**Response:**
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
    "stats": { ... }
  },
  "rateLimit": {
    "enabled": true,
    "free": "20",
    "pro": "200"
  }
}
```

## Cost Optimization

### Caching Strategy

The server uses intelligent caching to reduce API costs:

- **Explain term**: 24 hour cache (definitions rarely change)
- **Analyze page**: 1 hour cache (content may update)
- **Summarize**: 30 minute cache (context-specific)
- **Answer question**: 2 hour cache (answers may need updates)

**Target: 90% cache hit rate**

### Cost Breakdown

**Without Caching:**
- 50 predictions/day/user
- ~$0.006 per prediction
- **$9/user/month** ❌ Not profitable

**With 90% Caching:**
- 45 cached (free)
- 5 AI calls ($0.03/day)
- **$0.90/user/month** ✅ Profitable!

### Rate Limiting

- **Free tier**: 20 AI requests/hour
- **Pro tier**: 200 AI requests/hour
- Cached responses don't count toward limit

## AI Provider Selection

### Claude (Primary)

Used for:
- Explaining technical terms
- Generating summaries
- Answering questions

**Why:** Best at following instructions, concise explanations, strong code understanding.

**Pricing:** $3/M input tokens, $15/M output tokens

### GPT-4 (Secondary)

Used for:
- Page content analysis (structured output)
- Semantic search (embeddings)
- Complex multi-step reasoning

**Why:** Best structured output, great embeddings, strong general knowledge.

**Pricing:** $10/M input tokens, $30/M output tokens

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API key | ✅ Yes | - |
| `OPENAI_API_KEY` | OpenAI API key | ✅ Yes | - |
| `PORT` | Server port | ❌ No | 3001 |
| `CLAUDE_MODEL` | Claude model | ❌ No | claude-3-5-sonnet-20241022 |
| `OPENAI_MODEL` | OpenAI model | ❌ No | gpt-4-turbo-preview |
| `CACHE_TTL` | Cache TTL (seconds) | ❌ No | 3600 |
| `CACHE_MAX_SIZE` | Max cached items | ❌ No | 1000 |
| `RATE_LIMIT_FREE` | Free tier limit/hour | ❌ No | 20 |
| `RATE_LIMIT_PRO` | Pro tier limit/hour | ❌ No | 200 |
| `ENABLE_CACHING` | Enable caching | ❌ No | true |
| `ENABLE_RATE_LIMITING` | Enable rate limits | ❌ No | true |

### Feature Flags

```env
ENABLE_CACHING=true           # Cache AI responses
ENABLE_RATE_LIMITING=true     # Enforce usage limits
ENABLE_ANALYTICS=true         # Track usage stats
```

## Development

### Run in Dev Mode

```bash
npm run dev
```

Uses `nodemon` for auto-reload.

### Test AI Endpoints

```bash
# Explain a term
curl -X POST http://localhost:3001/explain \
  -H "Content-Type: application/json" \
  -d '{"term": "useState", "userId": "test123"}'

# Analyze page
curl -X POST http://localhost:3001/analyze-page \
  -H "Content-Type: application/json" \
  -d '{"content": "React Hooks tutorial...", "userId": "test123"}'

# Get cache stats
curl http://localhost:3001/cache/stats
```

### Monitor Costs

Check cache stats regularly:

```bash
curl http://localhost:3001/cache/stats
```

Look for:
- **Hit rate**: Should be >90%
- **Cost saved**: Track savings from caching

## Production Deployment

### Deploy to Heroku

```bash
heroku create neurosync-ai
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
heroku config:set OPENAI_API_KEY=sk-...
git push heroku main
```

### Deploy to Railway

```bash
railway login
railway init
railway up
```

### Environment Setup

1. Set all environment variables in hosting platform
2. Use production API keys (not test keys)
3. Set `NODE_ENV=production`
4. Enable all optimizations (`ENABLE_CACHING=true`)

## Security

- ✅ API keys in environment variables (never in code)
- ✅ CORS restricted to extension origins
- ✅ Rate limiting prevents abuse
- ✅ No user data stored permanently
- ✅ Request size limits (10MB max)
- ✅ Admin endpoints require authentication

## Monitoring

### Key Metrics

- **Cache hit rate**: >90% target
- **Average response time**: <2 seconds
- **Cost per user per day**: <$0.03
- **API error rate**: <1%

### Alerts

Set up alerts for:
- Cache hit rate <80%
- Cost per user >$0.10/day
- API error rate >5%
- Response time >3 seconds

## Troubleshooting

### API Key Errors

```
Error: Invalid API key
```

**Solution:** Check `.env` file has correct keys from provider dashboards.

### High Costs

**Solution:**
1. Check cache stats: `curl http://localhost:3001/cache/stats`
2. Ensure `ENABLE_CACHING=true`
3. Look for cache misses - may need to adjust TTL
4. Reduce token limits in prompts

### Slow Responses

**Solution:**
1. Check if caching is enabled
2. Reduce content size before sending to AI
3. Use Claude instead of GPT-4 (faster)
4. Implement response streaming

### Rate Limit Errors

```
Error: Rate limit exceeded
```

**Solution:**
- Free users: Upgrade to Pro
- Pro users: Wait for limit reset (1 hour)
- Developer: Increase limits in `.env`

## Cost Projections

### Realistic Usage

Assumptions:
- 1000 active users
- 50 predictions/day average
- 90% cache hit rate

**Daily:**
- Total requests: 50,000
- Cached: 45,000 (free)
- AI calls: 5,000 ($30/day)

**Monthly:**
- AI costs: $900
- Revenue (20% Pro): $998 (200 × $4.99)
- **Profit:** $98/month

### Optimistic Usage

With 5000 users, 10% Pro:
- Revenue: $2,495/month
- AI costs: $1,350/month
- **Profit:** $1,145/month

## Support

- Claude API: https://console.anthropic.com/
- OpenAI API: https://platform.openai.com/
- Documentation: See `AI_INTEGRATION_PLAN.md`

## License

Proprietary - NeuroSync
