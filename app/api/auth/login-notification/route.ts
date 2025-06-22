import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { detectDevice } from "@/lib/device-detector";
import { sendLoginNotification } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user agent and IP
    const userAgent = request.headers.get("user-agent") || "";
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Detect device info
    const deviceInfo = detectDevice(userAgent, ip);

    // Get full user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Send login notification email
    const emailSent = await sendLoginNotification(user, deviceInfo);

    // Log the login attempt (optional)
    console.log("Login notification:", {
      userId: user.id,
      email: user.email,
      deviceInfo,
      emailSent,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      emailSent,
      deviceInfo: {
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
      },
    });
  } catch (error) {
    console.error("Login notification failed:", error);
    return NextResponse.json(
      { error: "Failed to process login notification" },
      { status: 500 }
    );
  }
}
