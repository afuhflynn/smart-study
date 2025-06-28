import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { QuestionDifficulty, QuizType } from "@prisma/client"; // Import enums

interface QuestionForSubmission {
  id: string;
  type: QuizType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: QuestionDifficulty; // Use the enum
}

interface QuizResultPayload {
  documentId: string;
  quizId: string | null; // The ID of the Quiz record if it exists
  questions: QuestionForSubmission[]; // Snapshot of the questions
  results: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    // timeSpent: number; // Removed per-question time for simplicity, using total time
  }[];
  score: number; // Percentage
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // Total time in milliseconds or seconds
  difficulty: QuestionDifficulty; // Overall difficulty of this attempt
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: QuizResultPayload = await req.json();

    const {
      documentId,
      quizId,
      questions,
      results,
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      difficulty,
    } = payload;

    if (
      !documentId ||
      !questions ||
      !Array.isArray(questions) ||
      !results ||
      !Array.isArray(results) ||
      score === undefined ||
      totalQuestions === undefined ||
      correctAnswers === undefined ||
      timeSpent === undefined ||
      !difficulty
    ) {
      return NextResponse.json(
        { error: "Invalid payload: Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Create a new QuizResult entry
    const newQuizResult = await prisma.quizResult.create({
      data: {
        documentId: documentId,
        userId: session.user.id,
        questions: questions as any, // Prisma's Json type accepts any JSON-serializable object
        answers: results as any,
        score: score,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        timeSpent: timeSpent,
        difficulty: difficulty,
      },
    });

    // 2. Update the corresponding Quiz entry (if quizId is provided)
    if (quizId) {
      const existingQuiz = await prisma.quiz.findUnique({
        where: { id: quizId, userId: session.user.id },
      });

      if (existingQuiz) {
        const currentAttempts = existingQuiz.totalAttempts || 0;
        const currentBestScore = existingQuiz.bestScore || 0;

        await prisma.quiz.update({
          where: { id: quizId },
          data: {
            totalAttempts: currentAttempts + 1,
            lastScore: Math.round(score), // Store as integer for consistency with bestScore
            bestScore: Math.round(Math.max(currentBestScore, score)),
            updatedAt: new Date(),
            // You might want to update difficulty/questionCount here if they change
            // during quiz generation, but typically they are set on creation.
          },
        });
      }
    } else {
      // This case should ideally not happen if a quiz is always generated first
      // but as a fallback, you might log or create a new Quiz entry if needed.
      console.warn("Quiz ID not provided for result update.");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Quiz result submitted successfully",
        result: newQuizResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to submit quiz results:", error);
    return NextResponse.json(
      {
        error: "Failed to submit quiz results",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
