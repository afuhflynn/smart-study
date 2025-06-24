import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { z } from "zod";

const trackReadingSchema = z.object({
  documentId: z.string(),
  chapterId: z.string().optional(),
  action: z.enum(["start", "update", "end"]),
  progress: z.number().min(0).max(100).optional(),
  wordsRead: z.number().min(0).optional(),
  timeSpent: z.number().min(0).optional(), // seconds
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = trackReadingSchema.parse(body);

    const userId = session.user.id;

    if (data.action === "start") {
      // Start a new reading session
      const readingSession = await prisma.readingSession.create({
        data: {
          documentId: data.documentId,
          userId,
          chapterId: data.chapterId,
          startTime: new Date(),
          progressStart: data.progress || 0,
          wordsRead: 0,
        },
      });

      return NextResponse.json({
        success: true,
        sessionId: readingSession.id,
      });
    } else if (data.action === "update") {
      // Update the most recent active session
      const activeSession = await prisma.readingSession.findFirst({
        where: {
          documentId: data.documentId,
          userId,
          endTime: null,
        },
        orderBy: { startTime: "desc" },
      });

      if (activeSession) {
        await prisma.readingSession.update({
          where: { id: activeSession.id },
          data: {
            wordsRead: data.wordsRead || activeSession.wordsRead,
            progressEnd: data.progress || activeSession.progressEnd,
          },
        });
      }

      return NextResponse.json({ success: true });
    } else if (data.action === "end") {
      // End the reading session
      const activeSession = await prisma.readingSession.findFirst({
        where: {
          documentId: data.documentId,
          userId,
          endTime: null,
        },
        orderBy: { startTime: "desc" },
      });

      if (activeSession) {
        const endTime = new Date();
        const totalMinutes =
          (endTime.getTime() - activeSession.startTime.getTime()) / (1000 * 60);

        await prisma.readingSession.update({
          where: { id: activeSession.id },
          data: {
            endTime,
            progressEnd: data.progress || activeSession.progressEnd,
            wordsRead: data.wordsRead || activeSession.wordsRead,
            isCompleted: (data.progress || 0) >= 100,
            totalMinutes,
          },
        });

        // Update document progress
        if (data.progress !== undefined) {
          await prisma.document.update({
            where: { id: data.documentId },
            data: {
              progress: data.progress,
              updatedAt: new Date(),
            },
          });
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to track reading:", error);
    return NextResponse.json(
      { error: "Failed to track reading activity" },
      { status: 500 }
    );
  }
}
