import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { generateUserDataPDF } from "@/lib/pdf-generator";
import { sendDataExportNotification } from "@/lib/email";
import { z } from "zod";

// Store for temporary download tokens
const downloadTokens = new Map<
  string,
  {
    userId: string;
    pdfBuffer: Buffer;
    expiresAt: Date;
  }
>();

// Clean up expired tokens every hour
setInterval(() => {
  const now = new Date();
  for (const [token, data] of downloadTokens.entries()) {
    if (data.expiresAt < now) {
      downloadTokens.delete(token);
    }
  }
}, 60 * 60 * 1000); // 1 hour

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate PDF
    console.log("Generating PDF for user:", user.email);
    const pdfBuffer = await generateUserDataPDF(user.id);

    // Create temporary download token (expires in 24 hours)
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    downloadTokens.set(token, {
      userId: user.id,
      pdfBuffer,
      expiresAt,
    });

    // Create download URL
    const downloadUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/api/user/download-data?token=${token}`;

    // Send email notification
    const emailSent = await sendDataExportNotification(
      user,
      downloadUrl,
      expiresAt
    );

    return NextResponse.json({
      success: true,
      message: "Data export prepared successfully",
      downloadUrl,
      expiresAt: expiresAt.toISOString(),
      emailSent,
    });
  } catch (error) {
    console.error("Data export failed:", error);
    return NextResponse.json(
      {
        error: "Failed to export data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for downloading the PDF
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Download token required" },
        { status: 400 }
      );
    }

    // Check if token exists and is valid
    const tokenData = downloadTokens.get(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: "Invalid or expired download token" },
        { status: 404 }
      );
    }

    if (tokenData.expiresAt < new Date()) {
      downloadTokens.delete(token);
      return NextResponse.json(
        { error: "Download token has expired" },
        { status: 410 }
      );
    }

    // Get user for filename
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: { name: true, email: true },
    });

    const filename = `ChapterFlux-Data-Export-${
      user?.name?.replace(/\s+/g, "-") || "User"
    }-${new Date().toISOString().split("T")[0]}.pdf`;

    // Return PDF
    return new NextResponse(tokenData.pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": tokenData.pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download failed:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
