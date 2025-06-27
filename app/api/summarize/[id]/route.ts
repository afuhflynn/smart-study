import { NextRequest, NextResponse } from "next/server";
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

    const summary = await prisma.summary.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!summary) {
      return NextResponse.json(
        {
          error: "Failed to fetch summary.",
          details: "An unexpected error occurred fetching summary details.",
        },
        { status: 500 }
      );
    }

    // find for document
    const document = await prisma.document.findFirst({
      where: {
        id: summary.documentId,
      },
    });

    return NextResponse.json({
      success: true,
      title: summary?.title,
      id: summary.id,
      content: summary.keyPoints.toString(),
      wordCount: document?.wordCount,
      createdAt: summary?.createdAt,
      updatedAt: summary?.updatedAt,
    });
  } catch (error) {
    console.error("Summary fetch failed:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
