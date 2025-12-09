/**
 * NeuroSync OpenAI API Client
 * Handles interactions with OpenAI's GPT-4 and embeddings API
 */

const OpenAI = require('openai');

class OpenAIClient {
  constructor(apiKey, model = 'gpt-4-turbo-preview') {
    this.client = new OpenAI({
      apiKey: apiKey,
    });
    this.model = model;
    this.embeddingModel = 'text-embedding-3-small';
  }

  /**
   * Analyze page content using GPT-4
   */
  async analyzePage(content, metadata = {}) {
    const prompt = this.buildAnalyzePrompt(content, metadata);

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are NeuroSync, an AI assistant that analyzes technical documentation and helps developers understand what they\'re reading.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content);

      return {
        success: true,
        analysis: analysis,
        usage: {
          inputTokens: response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
          cost: this.calculateCost(response.usage)
        }
      };

    } catch (error) {
      console.error('[OpenAI] Error analyzing page:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate embeddings for semantic search
   */
  async createEmbedding(text) {
    try {
      const response = await this.client.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });

      return {
        success: true,
        embedding: response.data[0].embedding,
        usage: {
          tokens: response.usage.total_tokens,
          cost: this.calculateEmbeddingCost(response.usage.total_tokens)
        }
      };

    } catch (error) {
      console.error('[OpenAI] Error creating embedding:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Semantic search using embeddings
   */
  async semanticSearch(query, documents) {
    try {
      // Get query embedding
      const queryEmbedding = await this.createEmbedding(query);
      if (!queryEmbedding.success) {
        throw new Error('Failed to create query embedding');
      }

      // Get document embeddings (in parallel)
      const docEmbeddings = await Promise.all(
        documents.map(doc => this.createEmbedding(doc.text))
      );

      // Calculate cosine similarity
      const results = documents.map((doc, i) => {
        if (!docEmbeddings[i].success) return null;

        const similarity = this.cosineSimilarity(
          queryEmbedding.embedding,
          docEmbeddings[i].embedding
        );

        return {
          ...doc,
          similarity: similarity
        };
      }).filter(Boolean);

      // Sort by similarity (highest first)
      results.sort((a, b) => b.similarity - a.similarity);

      return {
        success: true,
        results: results,
        totalCost: queryEmbedding.usage.cost +
                   docEmbeddings.reduce((sum, e) => sum + (e.usage?.cost || 0), 0)
      };

    } catch (error) {
      console.error('[OpenAI] Error in semantic search:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Answer question using GPT-4
   */
  async answerQuestion(question, context = {}) {
    const { pageContent, pageTitle, searchResults } = context;

    try {
      const messages = [
        {
          role: 'system',
          content: 'You are NeuroSync, an AI assistant helping developers understand technical concepts. Provide clear, concise, and practical answers.'
        }
      ];

      // Add context if available
      if (pageTitle || pageContent) {
        messages.push({
          role: 'user',
          content: `Context:\n${pageTitle ? `Page: ${pageTitle}\n` : ''}${pageContent ? `Content: ${pageContent.substring(0, 1500)}` : ''}`
        });
      }

      // Add search results if available
      if (searchResults && searchResults.length > 0) {
        const relevantContent = searchResults
          .slice(0, 3)
          .map(r => r.text)
          .join('\n\n');

        messages.push({
          role: 'user',
          content: `Relevant information:\n${relevantContent}`
        });
      }

      // Add the actual question
      messages.push({
        role: 'user',
        content: `Question: ${question}`
      });

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 600
      });

      return {
        success: true,
        answer: response.choices[0].message.content,
        usage: {
          inputTokens: response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
          cost: this.calculateCost(response.usage)
        }
      };

    } catch (error) {
      console.error('[OpenAI] Error answering question:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract key concepts from text
   */
  async extractConcepts(text) {
    const prompt = `Extract the key technical concepts from this text. Return as JSON array.

Text:
${text.substring(0, 2000)}

Return JSON in this format:
{
  "concepts": [
    {
      "term": "concept name",
      "category": "programming|database|devops|framework|language|tool",
      "importance": "high|medium|low"
    }
  ]
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a technical content analyzer.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);

      return {
        success: true,
        concepts: result.concepts || [],
        usage: {
          inputTokens: response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens,
          cost: this.calculateCost(response.usage)
        }
      };

    } catch (error) {
      console.error('[OpenAI] Error extracting concepts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build prompt for page analysis
   */
  buildAnalyzePrompt(content, metadata) {
    const { pageTitle, url } = metadata;

    return `Analyze this technical content and return structured JSON.

${pageTitle ? `Title: ${pageTitle}` : ''}
${url ? `URL: ${url}` : ''}

Content:
${content.substring(0, 3000)}

Return JSON with this structure:
{
  "documentType": "tutorial|documentation|article|reference|guide|blog",
  "mainTopic": "primary subject",
  "keyTerms": ["term1", "term2", "term3"],
  "technologies": ["tech1", "tech2"],
  "difficulty": "beginner|intermediate|advanced",
  "prerequisites": ["concept1", "concept2"],
  "summary": "2-3 sentence overview",
  "estimatedReadTime": "X minutes"
}`;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculate cost of API call
   * GPT-4 Turbo pricing: $10/million input tokens, $30/million output tokens
   */
  calculateCost(usage) {
    const inputCost = (usage.prompt_tokens / 1_000_000) * 10;
    const outputCost = (usage.completion_tokens / 1_000_000) * 30;
    return inputCost + outputCost;
  }

  /**
   * Calculate embedding cost
   * text-embedding-3-small: $0.02/million tokens
   */
  calculateEmbeddingCost(tokens) {
    return (tokens / 1_000_000) * 0.02;
  }

  /**
   * Stream response for real-time display
   */
  async streamAnswer(question, context = {}) {
    const { pageContent, pageTitle } = context;

    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are NeuroSync, helping developers understand technical concepts.'
          },
          {
            role: 'user',
            content: `${pageTitle ? `Page: ${pageTitle}\n` : ''}${pageContent ? `Context: ${pageContent.substring(0, 1500)}\n\n` : ''}Question: ${question}`
          }
        ],
        temperature: 0.7,
        max_tokens: 600,
        stream: true
      });

      return stream;

    } catch (error) {
      console.error('[OpenAI] Error streaming:', error);
      throw error;
    }
  }
}

module.exports = OpenAIClient;
