import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { generateUserDataPDF } from "@/lib/pdf-generator";
import { sendDataExportNotification } from "@/lib/email";

export async function POST() {
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

    // Check if data has been exported and is not yet expired.
    const documentExported = await prisma.dataExport.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (documentExported) {
      // Delete exported data and ask user to request for another one
      const deletedData = await prisma.dataExport.delete({
        where: {
          id: documentExported.id,
          userId: documentExported.userId,
        },
      });

      if (!deletedData) {
        return NextResponse.json(
          { error: "An unexpected error occurred. Try again later." },
          { status: 409 }
        );
      }
    }

    // Save exported data
    const document = await prisma.dataExport.create({
      data: {
        userId: user.id,
        data: pdfBuffer.toString(),
        token,
        expiresAt, // Expires in 24 hours
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Sorry, an unexpected error occurred. Try again later." },
        { status: 500 }
      );
    }

    // Create download URL
    const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/user/download-data?token=${token}`;

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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data
    const foundUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!foundUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Download token required" },
        { status: 400 }
      );
    }

    // Check if token exists and is valid and delete and send it as response.
    const tokenData = await prisma.dataExport.delete({
      where: {
        userId: foundUser.id,
        token,
      },
    });
    if (!tokenData) {
      return NextResponse.json(
        { error: "Invalid or expired download token" },
        { status: 404 }
      );
    }

    if (tokenData.expiresAt < new Date()) {
      // Delete the exported data
      await prisma.dataExport.delete({
        where: {
          id: tokenData.id,
          userId: foundUser.id,
        },
      });
      return NextResponse.json(
        { error: "Download token has expired" },
        { status: 410 }
      );
    }

    const filename = `SmartStudy-Data-Export-${
      foundUser?.name?.replace(/\s+/g, "-") || "User"
    }-${new Date().toISOString().split("T")[0]}.pdf`;

    // Return PDF
    return new NextResponse(tokenData.data, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": tokenData.data.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download failed:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
