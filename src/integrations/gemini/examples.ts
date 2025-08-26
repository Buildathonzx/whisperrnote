// Example usage of the Gemini AI integration
// This file demonstrates how to use the various AI features

import { 
  generateText, 
  generateTextStream,
  getSearchSuggestions,
  enhanceContent,
  AIMode,
  textGenerationService,
  isGeminiConfigured
} from '@/integrations/gemini';

export async function exampleTextGeneration() {
  // Basic text generation
  const response = await generateText("Write a short summary about artificial intelligence", {
    mode: AIMode.STANDARD,
    temperature: 0.7
  });
  
  console.log(response.text);
  return response;
}

export async function exampleStreamingGeneration() {
  // Streaming text generation for real-time display
  const chunks: string[] = [];
  
  for await (const chunk of generateTextStream("Write a creative story about space exploration", {
    mode: AIMode.CREATIVE,
    temperature: 0.8
  })) {
    chunks.push(chunk.text);
    console.log('Chunk:', chunk.text);
    
    if (chunk.isComplete) {
      console.log('Generation complete!');
      break;
    }
  }
  
  return chunks.join('');
}

export async function exampleSearchSuggestions() {
  // Generate search suggestions with context
  const suggestions = await getSearchSuggestions("machine learn", {
    context: "AI and technology research",
    limit: 5,
    userHistory: ["artificial intelligence", "neural networks", "deep learning"]
  });
  
  console.log('Search suggestions:');
  suggestions.forEach((suggestion, index) => {
    console.log(`${index + 1}. ${suggestion.text} (${suggestion.type}, score: ${suggestion.score})`);
  });
  
  return suggestions;
}

export async function exampleContentEnhancement() {
  const originalText = "AI is a technology that can help humans.";
  
  // Expand the content
  const expanded = await enhanceContent(originalText, "expand", {
    tone: "professional",
    length: "longer"
  });
  
  console.log('Original:', originalText);
  console.log('Expanded:', expanded.enhancedContent);
  
  // Improve writing
  const improved = await enhanceContent(originalText, "improve", {
    tone: "academic"
  });
  
  console.log('Improved:', improved.enhancedContent);
  
  return { expanded, improved };
}

export async function exampleAdvancedFeatures() {
  // Using services directly for more control
  
  // Generate a summary
  const summary = await textGenerationService.generateSummary(
    "Long text that needs to be summarized...",
    "short",
    AIMode.STANDARD
  );
  
  console.log('Summary:', summary.text);
  
  // Brainstorm ideas
  const ideas = await textGenerationService.brainstormIdeas(
    "sustainable technology solutions",
    5,
    AIMode.CREATIVE
  );
  
  console.log('Ideas:', ideas.text);
  
  // Answer a question with context
  const answer = await textGenerationService.answerQuestion(
    "What are the benefits of renewable energy?",
    "Context: Discussion about environmental sustainability and climate change",
    AIMode.STANDARD
  );
  
  console.log('Answer:', answer.text);
  
  return { summary, ideas, answer };
}

export function exampleConfigurationCheck() {
  // Check if Gemini is properly configured
  const isConfigured = isGeminiConfigured();
  
  console.log('Gemini AI configured:', isConfigured);
  
  if (!isConfigured) {
    console.warn('Please set GEMINI_API_KEY environment variable');
    return false;
  }
  
  return true;
}

// Demo function to run all examples
export async function runGeminiDemo() {
  console.log('🤖 Gemini AI Integration Demo\n');
  
  // Check configuration first
  if (!exampleConfigurationCheck()) {
    return;
  }
  
  try {
    console.log('1. Basic Text Generation:');
    await exampleTextGeneration();
    console.log('\n');
    
    console.log('2. Search Suggestions:');
    await exampleSearchSuggestions();
    console.log('\n');
    
    console.log('3. Content Enhancement:');
    await exampleContentEnhancement();
    console.log('\n');
    
    console.log('4. Advanced Features:');
    await exampleAdvancedFeatures();
    console.log('\n');
    
    console.log('5. Streaming Generation:');
    await exampleStreamingGeneration();
    
    console.log('\n✅ Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Export for use in components
export default {
  exampleTextGeneration,
  exampleStreamingGeneration,
  exampleSearchSuggestions,
  exampleContentEnhancement,
  exampleAdvancedFeatures,
  exampleConfigurationCheck,
  runGeminiDemo
};