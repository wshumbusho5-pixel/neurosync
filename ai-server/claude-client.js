/**
 * NeuroSync Claude API Client
 * Handles all interactions with Anthropic's Claude API
 */

const Anthropic = require('@anthropic-ai/sdk');

class ClaudeClient {
  constructor(apiKey, model = 'claude-3-5-sonnet-20241022') {
    this.client = new Anthropic({
      apiKey: apiKey,
    });
    this.model = model;
    this.defaultMaxTokens = 1024;
  }

  /**
   * Explain a technical term with context
   */
  async explainTerm(term, context = {}) {
    const prompt = this.buildExplainPrompt(term, context);

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return {
        success: true,
        explanation: response.content[0].text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          cost: this.calculateCost(response.usage)
        }
      };

    } catch (error) {
      console.error('[Claude] Error explaining term:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze page content and extract key concepts
   */
  async analyzePage(content, metadata = {}) {
    const prompt = this.buildAnalyzePrompt(content, metadata);

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 800,
        temperature: 0.5,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const analysis = this.parseJsonResponse(response.content[0].text);

      return {
        success: true,
        analysis: analysis,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          cost: this.calculateCost(response.usage)
        }
      };

    } catch (error) {
      console.error('[Claude] Error analyzing page:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate a summary of content
   */
  async summarize(content, options = {}) {
    const prompt = this.buildSummaryPrompt(content, options);

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 400,
        temperature: 0.5,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return {
        success: true,
        summary: response.content[0].text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          cost: this.calculateCost(response.usage)
        }
      };

    } catch (error) {
      console.error('[Claude] Error summarizing:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Answer a specific question about content
   */
  async answerQuestion(question, context = {}) {
    const prompt = this.buildQuestionPrompt(question, context);

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 600,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return {
        success: true,
        answer: response.content[0].text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          cost: this.calculateCost(response.usage)
        }
      };

    } catch (error) {
      console.error('[Claude] Error answering question:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build prompt for explaining a term
   */
  buildExplainPrompt(term, context) {
    const { pageContent, surroundingText, pageTitle, documentType, userLevel } = context;

    return `You are NeuroSync, an AI assistant that helps developers understand technical concepts while they read.

${pageTitle ? `The user is reading: "${pageTitle}"` : ''}
${documentType ? `Document type: ${documentType}` : ''}
${userLevel ? `User's knowledge level: ${userLevel}` : 'User knowledge level: Intermediate'}

${surroundingText ? `Context where the term appears:\n${surroundingText}\n` : ''}

The user paused on and hovered over the term: "${term}"

Provide a helpful explanation in this exact format:

**Definition:** [1-2 sentence definition]

**In this context:** [How it's being used in the code/text they're reading]

**Example:** [One practical code example or usage]

**Related:** [2-3 related concepts they might want to learn next]

Keep it concise, friendly, and immediately actionable. Use markdown formatting.`;
  }

  /**
   * Build prompt for analyzing page content
   */
  buildAnalyzePrompt(content, metadata) {
    const { pageTitle, url } = metadata;

    return `Analyze this documentation/article page and extract key information.

${pageTitle ? `Title: ${pageTitle}` : ''}
${url ? `URL: ${url}` : ''}

Content excerpt:
${content.substring(0, 3000)}

Provide analysis as JSON:
{
  "documentType": "tutorial|documentation|article|reference|guide",
  "mainTopic": "primary subject",
  "keyTerms": ["term1", "term2", "term3"],
  "difficulty": "beginner|intermediate|advanced",
  "prerequisites": ["concept1", "concept2"],
  "summary": "2-3 sentence overview"
}

Return only valid JSON.`;
  }

  /**
   * Build prompt for summarizing content
   */
  buildSummaryPrompt(content, options) {
    const { lastPosition, timeAway, reason } = options;

    return `The user was reading this content but ${reason || 'lost their place'}:

${content.substring(0, 2000)}

${lastPosition ? `Last position: ${lastPosition}` : ''}
${timeAway ? `Time away: ${timeAway}` : ''}

Generate a helpful summary (3-4 sentences):
1. What this content is about
2. What section they were reading
3. Key points to remember
4. Suggested next step

Be concise and action-oriented.`;
  }

  /**
   * Build prompt for answering questions
   */
  buildQuestionPrompt(question, context) {
    const { pageContent, pageTitle } = context;

    return `You are NeuroSync, helping a user understand technical content.

${pageTitle ? `Current page: "${pageTitle}"` : ''}

${pageContent ? `Page content:\n${pageContent.substring(0, 2000)}\n` : ''}

User's question: "${question}"

Provide a clear, concise answer based on the page content if available, or your general knowledge if needed.

Use markdown formatting. Be friendly and practical.`;
  }

  /**
   * Parse JSON response from Claude
   */
  parseJsonResponse(text) {
    try {
      // Find JSON in response (Claude sometimes adds explanation before/after)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error) {
      console.error('[Claude] Error parsing JSON:', error);
      return null;
    }
  }

  /**
   * Calculate cost of API call
   * Claude 3.5 Sonnet pricing: $3/million input tokens, $15/million output tokens
   */
  calculateCost(usage) {
    const inputCost = (usage.input_tokens / 1_000_000) * 3;
    const outputCost = (usage.output_tokens / 1_000_000) * 15;
    return inputCost + outputCost;
  }

  /**
   * Stream a response (for real-time display)
   */
  async streamExplanation(term, context) {
    const prompt = this.buildExplainPrompt(term, context);

    try {
      const stream = await this.client.messages.stream({
        model: this.model,
        max_tokens: 500,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return stream;

    } catch (error) {
      console.error('[Claude] Error streaming:', error);
      throw error;
    }
  }
}

module.exports = ClaudeClient;
