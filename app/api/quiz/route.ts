import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const {
      content,
      difficulty = "medium",
      questionCount = 5,
    } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error("Google Gemini API key not configured");

      // Return fallback questions
      const fallbackQuestions = [
        {
          id: "1",
          type: "multiple-choice",
          question: "What is the main topic of this content?",
          options: [
            "Primary concept discussed",
            "Secondary topic mentioned",
            "Unrelated concept",
            "Background information",
          ],
          correctAnswer: "Primary concept discussed",
          explanation: "This is the main focus of the provided content.",
          difficulty: "Easy",
        },
        {
          id: "2",
          type: "fill-in-blank",
          question: "The key principle mentioned is _______.",
          correctAnswer: "main principle",
          explanation:
            "This principle is central to understanding the content.",
          difficulty: "Medium",
        },
        {
          id: "3",
          type: "true-false",
          question: "The content provides practical examples.",
          options: ["True", "False"],
          correctAnswer: "True",
          explanation:
            "Most educational content includes practical examples to illustrate concepts.",
          difficulty: "Easy",
        },
      ];

      return NextResponse.json({
        success: true,
        questions: fallbackQuestions.slice(0, questionCount),
        metadata: {
          totalQuestions: Math.min(questionCount, fallbackQuestions.length),
          difficulty,
          estimatedTime: Math.min(questionCount, fallbackQuestions.length) * 2,
          createdAt: new Date().toISOString(),
        },
        warning: "Using fallback quiz - Google Gemini API key not configured",
      });
    }

    // Limit content length for API efficiency
    const maxLength = 6000;
    const truncatedContent =
      content.length > maxLength
        ? content.substring(0, maxLength) + "..."
        : content;

    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Create ${questionCount} quiz questions based on the following content. 
        Mix question types: multiple choice, fill-in-the-blank, and true/false.
        Difficulty level: ${difficulty}
        
        Format as a JSON array with this structure for each question:
        {
          "id": "unique_id",
          "type": "multiple-choice" | "fill-in-blank" | "true-false",
          "question": "The question text",
          "options": ["option1", "option2", "option3", "option4"] (for multiple choice and true/false),
          "correctAnswer": "correct answer",
          "explanation": "why this is correct",
          "difficulty": "Easy" | "Medium" | "Hard"
        }

        Important:
        - Return ONLY a valid JSON array, no additional text
        - For true/false questions, options should be ["True", "False"]
        - For fill-in-blank questions, don't include options
        - Make questions relevant to the content
        - Ensure variety in question types

        Content:
        ${truncatedContent}
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      console.log("Gemini Quiz API Response:", responseText);

      let questions;
      try {
        // Clean the response
        const cleanedText = responseText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        // Try to find JSON array in the response
        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON array found in response");
        }

        // Validate and fix questions
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error("Invalid questions format");
        }

        // Ensure each question has required fields and proper format
        questions = questions.map(
          (
            q: {
              id: string;
              type: string;
              question: string;
              options: unknown[];
              correctAnswer: string;
              explanation: string;
              difficulty: string;
            },
            index: number
          ) => ({
            id: q.id || `q-${Date.now()}-${index}`,
            type: q.type || "multiple-choice",
            question: q.question || `Question ${index + 1}`,
            options:
              q.options ||
              (q.type === "true-false" ? ["True", "False"] : undefined),
            correctAnswer: q.correctAnswer || "Answer not provided",
            explanation: q.explanation || "Explanation not provided",
            difficulty: q.difficulty || "Medium",
          })
        );
      } catch (parseError) {
        console.error("Failed to parse quiz response:", parseError);
        console.error("Raw response:", responseText);

        // Create fallback questions
        questions = [
          {
            id: "1",
            type: "multiple-choice",
            question: "What is the main topic of this content?",
            options: [
              "Primary concept discussed",
              "Secondary topic mentioned",
              "Unrelated concept",
              "Background information",
            ],
            correctAnswer: "Primary concept discussed",
            explanation: "This is the main focus of the provided content.",
            difficulty: "Easy",
          },
          {
            id: "2",
            type: "fill-in-blank",
            question: "The key principle mentioned is _______.",
            correctAnswer: "main principle",
            explanation:
              "This principle is central to understanding the content.",
            difficulty: "Medium",
          },
        ];
      }

      // Ensure we don't exceed requested question count
      questions = questions.slice(0, questionCount);

      return NextResponse.json({
        success: true,
        questions,
        metadata: {
          totalQuestions: questions.length,
          difficulty,
          estimatedTime: questions.length * 2, // 2 minutes per question
          createdAt: new Date().toISOString(),
        },
      });
    } catch (geminiError) {
      console.error("Gemini Quiz API error:", geminiError);

      // Return fallback questions
      const fallbackQuestions = [
        {
          id: "1",
          type: "multiple-choice",
          question: "What is the main topic of this content?",
          options: [
            "Primary concept discussed",
            "Secondary topic mentioned",
            "Unrelated concept",
            "Background information",
          ],
          correctAnswer: "Primary concept discussed",
          explanation: "This is the main focus of the provided content.",
          difficulty: "Easy",
        },
        {
          id: "2",
          type: "fill-in-blank",
          question: "The key principle mentioned is _______.",
          correctAnswer: "main principle",
          explanation:
            "This principle is central to understanding the content.",
          difficulty: "Medium",
        },
        {
          id: "3",
          type: "true-false",
          question: "The content provides practical examples.",
          options: ["True", "False"],
          correctAnswer: "True",
          explanation:
            "Most educational content includes practical examples to illustrate concepts.",
          difficulty: "Easy",
        },
      ];

      return NextResponse.json({
        success: true,
        questions: fallbackQuestions.slice(0, questionCount),
        metadata: {
          totalQuestions: Math.min(questionCount, fallbackQuestions.length),
          difficulty,
          estimatedTime: Math.min(questionCount, fallbackQuestions.length) * 2,
          createdAt: new Date().toISOString(),
        },
        warning: "Using fallback quiz due to AI service unavailability",
      });
    }
  } catch (error) {
    console.error("Quiz generation failed:", error);
    return NextResponse.json(
      {
        error: "Failed to generate quiz questions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
