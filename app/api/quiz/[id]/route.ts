import { NextRequest, NextResponse } from "next/server";
import { MAX_CHARACTER_INPUT_LENGTH } from "@/constants/constants";
import { model } from "@/constants/gemini";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "No quiz id provided" },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!quiz) {
      return NextResponse.json(
        {
          error: "Failed to fetch quiz questions",
          details: "An unexpected error occurred fetching quiz details.",
        },
        { status: 500 }
      );
    }

    // Ensure each question has required fields and proper format
    const questions = (quiz?.questions as any).map(
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
        type: q.type || "MULTIPLE_CHOICE",
        question: q.question || `Question ${index + 1}`,
        options:
          q.options ||
          (q.type === "TRUE_FALSE" ? ["True", "False"] : undefined),
        correctAnswer: q.correctAnswer || "Answer not provided",
        explanation: q.explanation || "Explanation not provided",
        difficulty: q.difficulty || "Medium",
      })
    );

    return NextResponse.json({
      success: true,
      questions,
      title: quiz?.title,
      id: quiz.id,
      lastScore: quiz?.lasScore,
      bestScore: quiz?.bestScore,
      totalAttempts: quiz?.totalAttempts,
      createdAt: quiz?.createdAt,
      updatedAt: quiz?.updatedAt,
      questionCount: quiz?.questionCount,
    });
  } catch (error) {
    console.error("Quiz fetching failed:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch quiz questions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
