# Gemini AI Integration

This module provides a comprehensive integration with Google's Gemini AI API for WhisperNote. It supports text generation, streaming responses, search suggestions, and content enhancement.

## Features

- 🤖 **Text Generation** - Generate text using Gemini models with different AI modes
- 🌊 **Streaming** - Real-time streaming text generation for better UX
- 🔍 **Search Suggestions** - Intelligent search auto-suggestions based on context
- ✨ **Content Enhancement** - Summarize, expand, improve, and rewrite content
- ⚙️ **Configurable** - Different models and settings for each AI mode
- 🔒 **Type Safe** - Full TypeScript support with comprehensive type definitions

## Setup

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Add it to your environment variables:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

## Usage

### Basic Text Generation

```typescript
import { generateText } from '@/integrations/gemini';

const response = await generateText("Write a summary about AI", {
  mode: AIMode.STANDARD,
  temperature: 0.7
});

console.log(response.text);
```

### Streaming Text Generation

```typescript
import { generateTextStream } from '@/integrations/gemini';

for await (const chunk of generateTextStream("Write a story", {
  mode: AIMode.CREATIVE
})) {
  console.log(chunk.text);
  if (chunk.isComplete) break;
}
```

### Search Suggestions

```typescript
import { getSearchSuggestions } from '@/integrations/gemini';

const suggestions = await getSearchSuggestions("machine learn", {
  context: "AI and technology",
  limit: 5
});

suggestions.forEach(suggestion => {
  console.log(suggestion.text, suggestion.type);
});
```

### Content Enhancement

```typescript
import { enhanceContent } from '@/integrations/gemini';

const enhanced = await enhanceContent(
  "AI is good", 
  "expand", 
  { tone: "professional", length: "longer" }
);

console.log(enhanced.enhancedContent);
```

### Using Services Directly

```typescript
import { 
  textGenerationService, 
  searchSuggestionService, 
  contentEnhancementService 
} from '@/integrations/gemini';

// Text generation with more options
const result = await textGenerationService.improveWriting(
  "This text needs improvement", 
  AIMode.STANDARD
);

// Content summarization
const summary = await textGenerationService.generateSummary(
  longText, 
  'short', 
  AIMode.STANDARD
);

// Clear search cache
searchSuggestionService.clearCache();
```

## AI Modes

The integration supports three AI modes that align with subscription tiers:

- **Standard** (Free) - `gemini-2.5-flash` with conservative settings
- **Creative** (Pro) - `gemini-2.5-pro` with higher creativity 
- **Ultra** (Pro+) - `gemini-2.5-pro` with maximum capabilities

## Configuration

Each AI mode has specific configurations for:
- Model selection
- Temperature (creativity)
- Max tokens (length)
- Top-P and Top-K (diversity)

See `config.ts` for detailed settings.

## Error Handling

The integration includes comprehensive error handling:

```typescript
try {
  const result = await generateText("Hello");
} catch (error) {
  if (error.code === 'INVALID_API_KEY') {
    // Handle API key issues
  } else if (error.code === 'QUOTA_EXCEEDED') {
    // Handle quota limits
  }
}
```

## Performance Features

- **Caching** - Search suggestions are cached for 5 minutes
- **Streaming** - Real-time response chunks for better UX
- **Retry Logic** - Built-in retry mechanisms for failed requests
- **Validation** - Input validation and API key verification

## Integration Points

This module integrates with:
- Existing AI mode system (`/src/types/ai.ts`)
- Search functionality (auto-suggestions)
- Note editing (content enhancement)
- User subscription tiers (feature gating)

## Files Structure

```
src/integrations/gemini/
├── index.ts              # Main exports and convenience functions
├── types.ts              # TypeScript interfaces and types
├── config.ts             # Configuration and model settings
├── client.ts             # Core Gemini client wrapper
├── text-generation.ts    # Text generation service
├── search-suggestions.ts # Search auto-suggestion service
├── content-enhancement.ts # Content improvement service
└── README.md            # This file
```

## Examples

See the `/examples` folder for complete usage examples and integration patterns.