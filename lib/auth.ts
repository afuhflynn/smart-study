import { betterAuth, User } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false, // We only want OAuth
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
    "https://smart-study-liart.vercel.app",
  ].filter(Boolean),
  callbacks: {
    user: {
      created: async (user: User) => {
        console.log("User created:", user.id);
        // Initialize user preferences
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              preferences: {
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
              },
            },
          });
        } catch (error) {
          console.error("Failed to initialize user preferences:", error);
        }
        return user;
      },
    },
  },
});
