# AI Integration Strategy

## Overview
Studently integrates AI capabilities across multiple features including document analysis, CV generation, skills extraction, company research, and evaluation assistance. The AI integration follows a provider abstraction pattern to support multiple AI services.

## Architecture

### AI Provider Abstraction

```
┌────────────────────────────────────────────────────────┐
│              AI Service Layer                          │
│  (High-level use cases: CV analysis, skills extraction)│
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│            AI Provider Interface                       │
│  (Abstract methods: analyze, extract, generate, etc.)  │
└──────────────────────┬───────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬─────────────┐
        ▼              ▼              ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌──────────┐ ┌─────────┐
│   OpenAI    │ │  Anthropic  │ │  Azure   │ │ Custom  │
│  Provider   │ │   Provider  │ │  OpenAI  │ │Provider │
└─────────────┘ └─────────────┘ └──────────┘ └─────────┘
```

### Feature Slice Structure

```
packages/backend/src/features/ai/
├── index.ts                           # Public API
│
├── api/
│   ├── ai.controller.ts               # HTTP endpoints
│   └── ai.routes.ts
│
├── model/
│   ├── ai-provider.types.ts           # Provider interfaces
│   ├── ai-prompt.types.ts             # Prompt templates
│   └── ai-usage.types.ts              # Usage tracking
│
├── lib/
│   ├── providers/
│   │   ├── provider.interface.ts      # Abstract interface
│   │   ├── openai.provider.ts         # OpenAI implementation
│   │   ├── anthropic.provider.ts      # Anthropic implementation
│   │   └── azure-openai.provider.ts   # Azure OpenAI implementation
│   │
│   ├── services/
│   │   ├── cv-analysis.service.ts     # CV-specific AI logic
│   │   ├── document-extraction.service.ts
│   │   ├── company-research.service.ts
│   │   └── evaluation-assist.service.ts
│   │
│   ├── ai.service.ts                  # Main AI service
│   ├── prompt.service.ts              # Prompt management
│   └── usage-tracker.service.ts       # Track AI usage/costs
│
└── config/
    └── ai.config.ts                   # Configuration
```

## Core Interfaces

### AIProvider Interface

```typescript
// packages/backend/src/features/ai/lib/providers/provider.interface.ts

export interface AIProviderConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
  jsonSchema?: Record<string, any>;
  stop?: string[];
}

export interface AICompletionResponse {
  content: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface AIProvider {
  /**
   * Provider name
   */
  name: string;
  
  /**
   * Generate text completion
   */
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  
  /**
   * Generate structured JSON output
   */
  completeJson<T>(
    request: AICompletionRequest,
    schema: Record<string, any>
  ): Promise<{ data: T; usage: AICompletionResponse['usage'] }>;
  
  /**
   * Generate embeddings (for semantic search)
   */
  embed(text: string): Promise<number[]>;
  
  /**
   * Check if provider is available
   */
  healthCheck(): Promise<boolean>;
}
```

### OpenAI Provider Implementation

```typescript
// packages/backend/src/features/ai/lib/providers/openai.provider.ts

import OpenAI from 'openai';
import { 
  AIProvider, 
  AIProviderConfig, 
  AICompletionRequest, 
  AICompletionResponse 
} from './provider.interface';

export const OpenAIProvider = function(config: AIProviderConfig): AIProvider {
  const client = new OpenAI({
    apiKey: config.apiKey,
  });

  const complete = async (
    request: AICompletionRequest
  ): Promise<AICompletionResponse> => {
    const response = await client.chat.completions.create({
      model: config.model || 'gpt-4-turbo',
      messages: request.messages,
      temperature: request.temperature ?? config.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? config.maxTokens,
      top_p: config.topP,
      stop: request.stop,
      response_format: request.responseFormat === 'json' 
        ? { type: 'json_object' } 
        : undefined,
    });

    const choice = response.choices[0];
    
    return {
      content: choice.message.content || '',
      finishReason: choice.finish_reason as any,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      model: response.model,
    };
  };

  const completeJson = async <T>(
    request: AICompletionRequest,
    schema: Record<string, any>
  ): Promise<{ data: T; usage: AICompletionResponse['usage'] }> => {
    // Add schema to system message
    const enhancedRequest: AICompletionRequest = {
      ...request,
      messages: [
        {
          role: 'system',
          content: `You must respond with valid JSON matching this schema: ${JSON.stringify(schema)}`,
        },
        ...request.messages,
      ],
      responseFormat: 'json',
    };

    const response = await complete(enhancedRequest);
    
    const data = JSON.parse(response.content) as T;
    
    return {
      data,
      usage: response.usage,
    };
  };

  const embed = async (text: string): Promise<number[]> => {
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  };

  const healthCheck = async (): Promise<boolean> => {
    try {
      await client.models.list();
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    name: 'openai',
    complete,
    completeJson,
    embed,
    healthCheck,
  };
};
```

## AI Use Cases

### 1. CV Skills Extraction

```typescript
// packages/backend/src/features/ai/lib/services/cv-analysis.service.ts

import { AIService } from '../ai.service';
import { PromptService } from '../prompt.service';

export interface ExtractedSkills {
  technical: {
    name: string;
    category: string;
    proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience?: number;
  }[];
  softSkills: {
    name: string;
    evidence: string;
  }[];
  languages: {
    language: string;
    proficiency: string; // CEFR level
  }[];
  certifications: {
    name: string;
    issuer: string;
    date?: string;
  }[];
}

export const CvAnalysisService = function() {
  const aiService = AIService();
  const promptService = PromptService();

  /**
   * Extract skills from CV text
   */
  const extractSkills = async (
    cvText: string,
    provider: 'openai' | 'anthropic' = 'openai'
  ): Promise<ExtractedSkills> => {
    const prompt = await promptService.getPrompt('cv-skills-extraction', 'en');
    
    const schema = {
      type: 'object',
      properties: {
        technical: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              category: { type: 'string' },
              proficiencyLevel: { 
                type: 'string',
                enum: ['beginner', 'intermediate', 'advanced', 'expert']
              },
              yearsOfExperience: { type: 'number' },
            },
            required: ['name', 'category', 'proficiencyLevel'],
          },
        },
        softSkills: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              evidence: { type: 'string' },
            },
            required: ['name', 'evidence'],
          },
        },
        languages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              language: { type: 'string' },
              proficiency: { type: 'string' },
            },
            required: ['language', 'proficiency'],
          },
        },
        certifications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              issuer: { type: 'string' },
              date: { type: 'string' },
            },
            required: ['name', 'issuer'],
          },
        },
      },
      required: ['technical', 'softSkills', 'languages', 'certifications'],
    };

    const result = await aiService.completeJson<ExtractedSkills>(
      provider,
      'gpt-4-turbo',
      [
        { role: 'system', content: prompt.template },
        { role: 'user', content: `Extract skills from this CV:\n\n${cvText}` },
      ],
      schema
    );

    return result.data;
  };

  /**
   * Evaluate CV quality
   */
  const evaluateCvQuality = async (
    cvText: string,
    provider: 'openai' | 'anthropic' = 'openai'
  ): Promise<{
    overallScore: number;
    scores: {
      structure: number;
      content: number;
      clarity: number;
      relevance: number;
    };
    strengths: string[];
    improvements: string[];
  }> => {
    const prompt = await promptService.getPrompt('cv-quality-evaluation', 'en');
    
    const result = await aiService.completeJson(
      provider,
      'gpt-4',
      [
        { role: 'system', content: prompt.template },
        { role: 'user', content: cvText },
      ],
      {
        type: 'object',
        properties: {
          overallScore: { type: 'number', minimum: 0, maximum: 100 },
          scores: {
            type: 'object',
            properties: {
              structure: { type: 'number', minimum: 0, maximum: 100 },
              content: { type: 'number', minimum: 0, maximum: 100 },
              clarity: { type: 'number', minimum: 0, maximum: 100 },
              relevance: { type: 'number', minimum: 0, maximum: 100 },
            },
          },
          strengths: { type: 'array', items: { type: 'string' } },
          improvements: { type: 'array', items: { type: 'string' } },
        },
      }
    );

    return result.data;
  };

  /**
   * Generate CV from student profile
   */
  const generateCv = async (
    studentData: {
      personalInfo: any;
      experiences: any[];
      competencies: any[];
      achievements: any[];
    },
    template: 'modern' | 'classic' | 'creative' = 'modern'
  ): Promise<string> => {
    const prompt = await promptService.getPrompt(`cv-generation-${template}`, 'en');
    
    const result = await aiService.complete(
      'openai',
      'gpt-4',
      [
        { role: 'system', content: prompt.template },
        { 
          role: 'user', 
          content: `Generate a CV with this data:\n\n${JSON.stringify(studentData, null, 2)}` 
        },
      ]
    );

    return result.content;
  };

  return {
    extractSkills,
    evaluateCvQuality,
    generateCv,
  };
};
```

### 2. Company Research Agent

```typescript
// packages/backend/src/features/ai/lib/services/company-research.service.ts

export interface CompanyResearchResult {
  companyName: string;
  industry: string;
  size: string;
  location: string;
  description: string;
  recentNews: {
    title: string;
    date: string;
    summary: string;
    source: string;
  }[];
  culture: string;
  technologies: string[];
  opportunities: {
    title: string;
    department: string;
    relevanceScore: number;
  }[];
  recommendations: string[];
}

export const CompanyResearchService = function() {
  const aiService = AIService();
  const webSearchService = WebSearchService();

  /**
   * Research company and identify opportunities
   */
  const researchCompany = async (
    companyName: string,
    studentProfile: {
      skills: string[];
      interests: string[];
      targetRoles: string[];
    }
  ): Promise<CompanyResearchResult> => {
    // Step 1: Web search for company information
    const searchResults = await webSearchService.search(
      `${companyName} company profile careers technology stack`,
      { maxResults: 10 }
    );

    // Step 2: Extract structured data with AI
    const companyInfo = await aiService.completeJson<CompanyResearchResult>(
      'openai',
      'gpt-4-turbo',
      [
        {
          role: 'system',
          content: 'You are a career research assistant. Analyze company information and identify opportunities matching student profile.',
        },
        {
          role: 'user',
          content: `Company: ${companyName}\n\nSearch Results:\n${searchResults.map(r => `${r.title}\n${r.snippet}`).join('\n\n')}\n\nStudent Profile:\nSkills: ${studentProfile.skills.join(', ')}\nInterests: ${studentProfile.interests.join(', ')}\nTarget Roles: ${studentProfile.targetRoles.join(', ')}`,
        },
      ],
      {
        type: 'object',
        properties: {
          companyName: { type: 'string' },
          industry: { type: 'string' },
          size: { type: 'string' },
          location: { type: 'string' },
          description: { type: 'string' },
          recentNews: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                date: { type: 'string' },
                summary: { type: 'string' },
                source: { type: 'string' },
              },
            },
          },
          culture: { type: 'string' },
          technologies: { type: 'array', items: { type: 'string' } },
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                department: { type: 'string' },
                relevanceScore: { type: 'number', minimum: 0, maximum: 100 },
              },
            },
          },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      }
    );

    return companyInfo.data;
  };

  return {
    researchCompany,
  };
};
```

### 3. Evaluation Assistance

```typescript
// packages/backend/src/features/ai/lib/services/evaluation-assist.service.ts

export const EvaluationAssistService = function() {
  const aiService = AIService();

  /**
   * Generate evaluation comments based on performance data
   */
  const generateEvaluationComments = async (
    studentData: {
      name: string;
      competencyScores: { competency: string; score: number }[];
      projectWork: string[];
      attendance: number;
      participation: string;
    }
  ): Promise<{
    strengths: string;
    areasForImprovement: string;
    recommendations: string[];
    nextSteps: string[];
  }> => {
    const result = await aiService.completeJson(
      'openai',
      'gpt-4',
      [
        {
          role: 'system',
          content: 'You are an educational evaluator. Provide constructive, specific, and actionable feedback.',
        },
        {
          role: 'user',
          content: `Generate evaluation comments for:\n\n${JSON.stringify(studentData, null, 2)}`,
        },
      ],
      {
        type: 'object',
        properties: {
          strengths: { type: 'string' },
          areasForImprovement: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } },
          nextSteps: { type: 'array', items: { type: 'string' } },
        },
      }
    );

    return result.data;
  };

  return {
    generateEvaluationComments,
  };
};
```

## Prompt Management

### Prompt Template Entity

```typescript
export interface PromptTemplate extends TranslatableEntity {
  categoryCode: string; // 'cv-analysis', 'evaluation', etc.
  
  template: string; // Actual prompt text
  
  variables: {
    name: string;
    description: string;
    required: boolean;
    defaultValue?: string;
  }[];
  
  version: number;
  isActiveVersion: boolean;
  
  modelRecommendation?: string; // 'gpt-4', 'claude-3-opus'
  temperatureRecommendation?: number;
  
  exampleInputs?: Record<string, any>[];
  exampleOutputs?: string[];
}
```

### Prompt Service

```typescript
export const PromptService = function() {
  const repository = PromptRepository();

  const getPrompt = async (
    code: string,
    language: string = 'en'
  ): Promise<PromptTemplate> => {
    const tenantId = getTenantId();
    
    // Get active version
    const prompt = await repository.findActiveByCode(tenantId, code);
    
    if (!prompt) {
      throw new Error(`Prompt template not found: ${code}`);
    }
    
    // Get translation
    const translation = await translationService.getTranslation(
      tenantId,
      'prompt-template',
      code,
      language
    );
    
    if (translation) {
      prompt.name = translation.name;
      prompt.description = translation.description;
    }
    
    return prompt;
  };

  const interpolate = (
    template: string,
    variables: Record<string, any>
  ): string => {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    
    return result;
  };

  return {
    getPrompt,
    interpolate,
  };
};
```

## Usage Tracking & Cost Management

```typescript
export interface AIUsageLog extends BaseEntity {
  provider: string; // 'openai', 'anthropic'
  model: string;
  operation: string; // 'cv-analysis', 'company-research'
  
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  
  estimatedCostUsd: number;
  
  userId: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  
  durationMs: number;
  
  success: boolean;
  errorMessage?: string;
}

export const UsageTrackerService = function() {
  const repository = AIUsageRepository();

  const logUsage = async (log: AIUsageLog): Promise<void> => {
    await repository.create(log);
  };

  const getUsageByTenant = async (
    tenantId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalCost: number;
    totalTokens: number;
    byProvider: Record<string, { tokens: number; cost: number }>;
    byOperation: Record<string, { tokens: number; cost: number }>;
  }> => {
    return repository.aggregateUsage(tenantId, startDate, endDate);
  };

  return {
    logUsage,
    getUsageByTenant,
  };
};
```

## Configuration

```env
# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://...

# Default models
AI_DEFAULT_PROVIDER=openai
AI_DEFAULT_MODEL=gpt-4-turbo
AI_DEFAULT_TEMPERATURE=0.7

# Rate limiting
AI_MAX_REQUESTS_PER_HOUR=100
AI_MAX_TOKENS_PER_REQUEST=4000

# Cost limits (USD)
AI_DAILY_COST_LIMIT=50
AI_MONTHLY_COST_LIMIT=1000
```

---

**Document Version**: 1.0  
**Last Updated**: March 17, 2026  
**Status**: Final
