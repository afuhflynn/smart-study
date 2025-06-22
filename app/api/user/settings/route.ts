import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { z } from "zod";

const updateSettingsSchema = z.object({
  preferences: z
    .object({
      // Notifications
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      weeklyDigest: z.boolean().optional(),
      readingReminders: z.boolean().optional(),
      achievementAlerts: z.boolean().optional(),

      // Reading Preferences
      fontSize: z.number().min(12).max(24).optional(),
      fontFamily: z.string().optional(),
      readingSpeed: z.number().min(150).max(500).optional(),
      autoPlay: z.boolean().optional(),
      highlightWords: z.boolean().optional(),
      showProgress: z.boolean().optional(),

      // Audio Settings
      defaultVoice: z.string().optional(),
      speechRate: z.number().min(0.5).max(2.0).optional(),
      volume: z.number().min(0).max(100).optional(),
      autoplayChapters: z.boolean().optional(),

      // Interface
      theme: z.enum(["light", "dark", "system"]).optional(),
      language: z.string().optional(),
      sidebarCollapsed: z.boolean().optional(),
      compactMode: z.boolean().optional(),

      // Privacy
      profileVisibility: z.enum(["public", "friends", "private"]).optional(),
      dataSharing: z.boolean().optional(),
      analyticsOptOut: z.boolean().optional(),
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
    const validatedData = updateSettingsSchema.parse(body);

    // Get current preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    });

    const currentPreferences = (currentUser?.preferences as any) || {};
    const newPreferences = {
      ...currentPreferences,
      ...validatedData.preferences,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to update user settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
