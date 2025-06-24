import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { z } from "zod";

const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["pdf", "text", "image"]),
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().min(0),
  wordCount: z.number().min(0),
  estimatedReadTime: z.number().min(0),
  chapters: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        startIndex: z.number(),
      })
    )
    .optional(),
  metadata: z
    .object({
      originalFileName: z.string().optional(),
      extractedAt: z.string().optional(),
      processingTime: z.number().optional(),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where = {
      userId: session.user.id,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { content: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          type: true,
          fileName: true,
          fileSize: true,
          wordCount: true,
          estimatedReadTime: true,
          progress: true,
          chapters: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.document.count({ where }),
    ]);

    const formattedDocuments = documents.map((doc) => ({
      ...doc,
      chapters: doc.chapters || [],
      metadata: doc.metadata || {},
      lastRead: doc.updatedAt,
      category: (doc.metadata as Record<string, string>)?.category || "General",
    }));

    return NextResponse.json({
      documents: formattedDocuments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createDocumentSchema.parse(body);

    const document = await prisma.document.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        type: validatedData.type,
        fileName: validatedData.fileName,
        fileSize: validatedData.fileSize,
        wordCount: validatedData.wordCount,
        estimatedReadTime: validatedData.estimatedReadTime,
        chapters: validatedData.chapters || [],
        metadata: validatedData.metadata || {},
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        type: true,
        fileName: true,
        wordCount: true,
        estimatedReadTime: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Document saved successfully",
      document,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to save document:", error);
    return NextResponse.json(
      { error: "Failed to save document" },
      { status: 500 }
    );
  }
}
