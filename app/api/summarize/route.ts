import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { content, chapterId, documentId } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error("Google Gemini API key not configured");

      // Return fallback summary
      const fallbackSummary = {
        id: `summary-${Date.now()}`,
        title: "Content Summary",
        keyPoints: [
          "Key information extracted from the content",
          "Important details and concepts identified",
          "Main arguments or findings presented",
          "Supporting evidence or examples mentioned",
        ],
        mainIdeas: [
          "Primary theme of the content",
          "Central argument or hypothesis",
          "Core methodology or approach",
        ],
        actionItems: [
          "Review the main concepts discussed",
          "Consider practical applications",
          "Explore related topics for deeper understanding",
        ],
        difficulty: "Intermediate",
        readingTime: "3 min summary",
        confidence: 70,
        createdAt: new Date().toISOString(),
        documentId,
        chapterId,
      };

      return NextResponse.json({
        success: true,
        summary: fallbackSummary,
        warning:
          "Using fallback summary - Google Gemini API key not configured",
      });
    }

    // Limit content length for API efficiency
    const maxLength = 8000;
    const truncatedContent =
      content.length > maxLength
        ? content.substring(0, maxLength) + "..."
        : content;

    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Please analyze the following text and create a comprehensive summary. 
        Respond with ONLY a valid JSON object in this exact format:
        {
          "title": "A descriptive title for this content",
          "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
          "mainIdeas": ["Core concept 1", "Core concept 2", "Core concept 3"],
          "actionItems": ["Action 1", "Action 2", "Action 3"],
          "difficulty": "Beginner",
          "readingTime": "5 min summary",
          "confidence": 85
        }

        Important: 
        - Respond ONLY with the JSON object, no additional text
        - Use "Beginner", "Intermediate", or "Advanced" for difficulty
        - Include 4-6 key points, 3-4 main ideas, and 3-5 action items
        - Confidence should be a number between 60-100

        Text to summarize:
        ${truncatedContent}
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      console.log("Gemini API Response:", responseText);

      // Clean and parse the response
      let summary;
      try {
        // Remove any markdown formatting and extra text
        const cleanedText = responseText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        // Try to find JSON object in the response
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          summary = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON object found in response");
        }

        // Validate required fields
        if (
          !summary.title ||
          !summary.keyPoints ||
          !summary.mainIdeas ||
          !summary.actionItems
        ) {
          throw new Error("Invalid summary structure");
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        console.error("Raw response:", responseText);

        // Create fallback summary
        summary = {
          title: "AI-Generated Summary",
          keyPoints: [
            "Main concept extracted from the content",
            "Secondary important point identified",
            "Supporting detail or example provided",
            "Key insight or conclusion drawn",
          ],
          mainIdeas: [
            "Core theme of the content",
            "Underlying principle or concept",
            "Key relationship or connection",
          ],
          actionItems: [
            "Review and reflect on the key points",
            "Apply the main concepts in practice",
            "Research related topics for deeper understanding",
          ],
          difficulty: "Intermediate",
          readingTime: "4 min summary",
          confidence: 75,
        };
      }

      // Add metadata
      summary.id = `summary-${Date.now()}`;
      summary.createdAt = new Date().toISOString();
      summary.documentId = documentId;
      summary.chapterId = chapterId;

      return NextResponse.json({
        success: true,
        summary,
      });
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);

      // Return fallback summary with error info
      const fallbackSummary = {
        id: `summary-${Date.now()}`,
        title: "Content Summary",
        keyPoints: [
          "Key information extracted from the content",
          "Important details and concepts identified",
          "Main arguments or findings presented",
          "Supporting evidence or examples mentioned",
        ],
        mainIdeas: [
          "Primary theme of the content",
          "Central argument or hypothesis",
          "Core methodology or approach",
        ],
        actionItems: [
          "Review the main concepts discussed",
          "Consider practical applications",
          "Explore related topics for deeper understanding",
        ],
        difficulty: "Intermediate",
        readingTime: "3 min summary",
        confidence: 70,
        createdAt: new Date().toISOString(),
        documentId,
        chapterId,
      };

      return NextResponse.json({
        success: true,
        summary: fallbackSummary,
        warning: "Using fallback summary due to AI service unavailability",
      });
    }
  } catch (error) {
    console.error("Summarization failed:", error);
    return NextResponse.json(
      {
        error: "Failed to generate summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
