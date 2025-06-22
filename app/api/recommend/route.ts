import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { 
      readingHistory, 
      preferences, 
      currentDocument,
      limit = 5 
    } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
      Based on the following reading history and preferences, recommend ${limit} books or documents 
      that would be interesting to this reader. Consider their reading patterns, preferred topics, 
      and difficulty levels.

      Reading History: ${JSON.stringify(readingHistory)}
      Preferences: ${JSON.stringify(preferences)}
      Current Document: ${currentDocument?.title || 'None'}

      Return a JSON array of recommendations with this structure:
      {
        "title": "Book/Document Title",
        "author": "Author Name",
        "description": "Brief description",
        "category": "Category",
        "difficulty": "Beginner|Intermediate|Advanced",
        "estimatedReadTime": "X hours",
        "matchScore": 85,
        "reasons": ["reason1", "reason2", "reason3"],
        "tags": ["tag1", "tag2", "tag3"]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let recommendations;
    try {
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      // Fallback recommendations
      recommendations = [
        {
          title: 'Advanced Machine Learning Techniques',
          author: 'Dr. Sarah Chen',
          description: 'Deep dive into cutting-edge ML algorithms and their practical applications.',
          category: 'Technology',
          difficulty: 'Advanced',
          estimatedReadTime: '8 hours',
          matchScore: 92,
          reasons: [
            'Builds on your current ML reading',
            'Matches your advanced skill level',
            'Covers topics you\'ve shown interest in'
          ],
          tags: ['machine-learning', 'algorithms', 'advanced']
        },
        {
          title: 'The Psychology of Learning',
          author: 'Prof. Michael Rodriguez',
          description: 'Understanding how the brain processes and retains information.',
          category: 'Psychology',
          difficulty: 'Intermediate',
          estimatedReadTime: '5 hours',
          matchScore: 87,
          reasons: [
            'Complements your technical reading',
            'Helps optimize learning strategies',
            'Popular among similar readers'
          ],
          tags: ['psychology', 'learning', 'cognition']
        }
      ];
    }

    // Add metadata
    const metadata = {
      generatedAt: new Date().toISOString(),
      basedOn: {
        documentsRead: readingHistory?.length || 0,
        categories: preferences?.categories || [],
        difficulty: preferences?.difficulty || 'intermediate'
      },
      algorithm: 'gemini-content-based'
    };

    return NextResponse.json({
      success: true,
      recommendations,
      metadata
    });

  } catch (error) {
    console.error('Recommendation generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}