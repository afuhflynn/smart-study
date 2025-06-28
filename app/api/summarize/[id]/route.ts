import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!params.id) {
      return NextResponse.json(
        { error: "No quiz id provided" },
        { status: 400 }
      );
    }

    const summary = await prisma.summary.findUnique({
      where: {
        documentId: params.id,
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
      summary,
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

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!params.id) {
      return NextResponse.json(
        { error: "No summary id provided" },
        { status: 400 }
      );
    }

    const summary = await prisma.summary.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!summary) {
      return NextResponse.json(
        {
          error: "Failed to delete summary.",
          details: "An unexpected error occurred deleting summary.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Summary deleted successfully",
    });
  } catch (error) {
    console.error("Summary deletion failed:", error);
    return NextResponse.json(
      {
        error: "Failed to delete summary.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
