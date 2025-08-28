'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, type } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    let systemInstruction = '';
    let title = '';
    
    switch (type) {
      case 'topic':
        title = `Topic: ${prompt}`;
        systemInstruction = `You are an expert researcher and educator. Create a comprehensive note about the given topic.
        Format your response as a well-structured markdown document with:
        - A clear introduction explaining what the topic is
        - Key concepts and definitions
        - Important details and explanations
        - Examples where relevant
        - A conclusion summarizing the main points
        
        Make it informative but accessible. Use markdown formatting for headers, lists, and emphasis.`;
        break;
        
      case 'brainstorm':
        title = `Ideas for: ${prompt}`;
        systemInstruction = `You are a creative brainstorming expert. Generate innovative ideas related to the given topic.
        Format your response as a markdown document with:
        - A brief introduction to the brainstorming session
        - Multiple creative suggestions organized in sections
        - Each idea should include a brief explanation
        - Consider different approaches: traditional, innovative, technology-based, collaborative, cost-effective
        - Include next steps or action items
        
        Be creative and think outside the box while keeping ideas practical.`;
        break;
        
      case 'research':
        title = `Research on: ${prompt}`;
        systemInstruction = `You are a research specialist. Provide comprehensive research findings on the given topic.
        Format your response as a structured research document with:
        - Executive summary
        - Key findings with supporting details
        - Current trends and developments
        - Important statistics or data points where relevant
        - Analysis and insights
        - Potential implications or applications
        - Areas for further research
        
        Present information in a clear, academic style using markdown formatting.`;
        break;
        
      case 'custom':
        title = `AI Generated: ${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}`;
        systemInstruction = `You are a helpful AI assistant. Respond to the user's request thoughtfully and comprehensively.
        Format your response using appropriate markdown formatting.
        Provide detailed, accurate, and helpful information based on the user's specific request.`;
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid generation type' },
          { status: 400 }
        );
    }

    const model = genAI.getGenerativeModel({ 
      model: '',
      systemInstruction: systemInstruction
    });

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    if (!text) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      );
    }

    // Extract tags from the prompt
    const words = prompt.toLowerCase().split(/\s+/);
    const relevantWords = words.filter((word: string | any[]) => 
      word.length > 3 && 
      !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word)
    );
    
    const baseTags = ['ai-generated', type];
    const additionalTags = relevantWords.slice(0, Math.min(3, relevantWords.length));
    const tags = [...baseTags, ...additionalTags];

    return NextResponse.json({
      title,
      content: text,
      tags
    });

  } catch (error) {
    console.error('AI generation failed:', error);
    return NextResponse.json(
      { error: `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}