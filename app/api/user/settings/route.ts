import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(_: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        preferences: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return default preferences if none exist
    const defaultPreferences = {
      // Notifications
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
      readingReminders: true,
      achievementAlerts: true,

      // Reading Preferences
      fontSize: 16,
      fontFamily: "inter",
      readingSpeed: 250,
      autoPlay: false,
      highlightWords: true,
      showProgress: true,

      // Audio Settings
      defaultVoice: "rachel",
      speechRate: 1.0,
      volume: 75,
      autoplayChapters: false,

      // Interface
      theme: "system",
      language: "en",
      sidebarCollapsed: false,
      compactMode: false,

      // Privacy
      profileVisibility: "private",
      dataSharing: false,
      analyticsOptOut: false,
    };

    const preferences = user.preferences
      ? { ...defaultPreferences, ...(user.preferences as any) }
      : defaultPreferences;

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Failed to fetch user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Get current preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    });

    const currentPreferences = (currentUser?.preferences as any) || {};
    const newPreferences = {
      ...currentPreferences,
      ...body,
    };

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferences: newPreferences,
      },
      select: {
        preferences: true,
      },
    });

    return NextResponse.json({
      message: "Settings updated successfully",
      preferences: updatedUser.preferences,
    });
  } catch (error) {
    console.error("Failed to update user settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
