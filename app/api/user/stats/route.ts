import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get current date ranges
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Parallel database queries for efficiency
    const [
      totalDocuments,
      completedDocuments,
      weeklyDocuments,
      todayDocuments,
      totalQuizResults,
      weeklyQuizResults,
      totalReadingSessions,
      recentReadingSessions,
      userAchievements,
      documentsWithProgress,
    ] = await Promise.all([
      // Total documents
      prisma.document.count({
        where: { userId },
      }),

      // Completed documents (100% progress)
      prisma.document.count({
        where: {
          userId,
          progress: { gte: 100 },
        },
      }),

      // Weekly documents
      prisma.document.count({
        where: {
          userId,
          updatedAt: { gte: startOfWeek },
        },
      }),

      // Today's documents
      prisma.document.count({
        where: {
          userId,
          updatedAt: { gte: startOfToday },
        },
      }),

      // All quiz results
      prisma.quizResult.findMany({
        where: { userId },
        select: {
          score: true,
          timeSpent: true,
          totalQuestions: true,
          correctAnswers: true,
          createdAt: true,
          document: {
            select: { wordCount: true },
          },
        },
      }),

      // Weekly quiz results
      prisma.quizResult.findMany({
        where: {
          userId,
          createdAt: { gte: startOfWeek },
        },
      }),

      // Total reading sessions
      prisma.readingSession.findMany({
        where: { userId },
        select: {
          wordsRead: true,
          startTime: true,
          endTime: true,
          progressStart: true,
          progressEnd: true,
          createdAt: true,
        },
      }),

      // Recent reading sessions (last 30 days)
      prisma.readingSession.findMany({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: "desc" },
      }),

      // User achievements
      prisma.achievement.findMany({
        where: { userId },
      }),

      // Documents with their progress for streak calculation
      prisma.document.findMany({
        where: { userId },
        select: {
          id: true,
          progress: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    // Calculate reading statistics
    const totalWordsRead = totalReadingSessions.reduce(
      (sum, session) => sum + session.wordsRead,
      0
    );
    const totalReadingTimeMinutes = totalReadingSessions.reduce(
      (sum, session) => {
        if (session.endTime) {
          return (
            sum +
            (session.endTime.getTime() - session.startTime.getTime()) /
              (1000 * 60)
          );
        }
        return sum;
      },
      0
    );

    // Calculate reading speed (WPM)
    const readingSpeed =
      totalReadingTimeMinutes > 0
        ? Math.round(totalWordsRead / totalReadingTimeMinutes)
        : 0;

    // Calculate quiz average
    const quizAverage =
      totalQuizResults.length > 0
        ? Math.round(
            totalQuizResults.reduce((sum, quiz) => sum + quiz.score, 0) /
              totalQuizResults.length
          )
        : 0;

    // Calculate hours saved (compared to average 150 WPM reading speed)
    const averageReadingSpeed = 150; // words per minute
    const userEfficiencyFactor =
      readingSpeed > 0 ? readingSpeed / averageReadingSpeed : 1;
    const timeAtAverageSpeed = totalWordsRead / averageReadingSpeed; // minutes
    const timeAtUserSpeed = totalReadingTimeMinutes;
    const hoursSaved = Math.max(0, (timeAtAverageSpeed - timeAtUserSpeed) / 60);

    // Calculate reading streak
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Group documents by date and check for consecutive days
    const dailyActivity = new Map();
    documentsWithProgress.forEach((doc) => {
      const date = doc.updatedAt.toDateString();
      if (!dailyActivity.has(date)) {
        dailyActivity.set(date, 0);
      }
      if (doc.progress > 0) {
        dailyActivity.set(date, dailyActivity.get(date) + 1);
      }
    });

    // Calculate streak from today backwards
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      // Check last year
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toDateString();

      if (dailyActivity.has(dateStr) && dailyActivity.get(dateStr) > 0) {
        if (i === 0 || tempStreak > 0) {
          // Continue streak only if no gaps
          tempStreak++;
          currentStreak = tempStreak;
        }
      } else {
        if (i === 0) {
          // No activity today, check yesterday
          continue;
        }
        break; // Streak broken
      }
    }

    // Weekly goal progress
    const weeklyGoal = 5; // Default goal, could be from user preferences
    const weeklyProgress = Math.min(100, (weeklyDocuments / weeklyGoal) * 100);

    // Calculate achievement progress
    const achievementTypes = {
      speed_reader: {
        title: "Speed Reader",
        description: "Read at 200+ WPM",
        target: 200,
        current: readingSpeed,
        earned: readingSpeed >= 200,
      },
      quiz_master: {
        title: "Quiz Master",
        description: "90%+ average quiz score",
        target: 90,
        current: quizAverage,
        earned: quizAverage >= 90,
      },
      consistency: {
        title: "Consistency Champion",
        description: "7+ day reading streak",
        target: 7,
        current: currentStreak,
        earned: currentStreak >= 7,
      },
      explorer: {
        title: "Document Explorer",
        description: "Complete 10+ documents",
        target: 10,
        current: completedDocuments,
        earned: completedDocuments >= 10,
      },
      enthusiast: {
        title: "Quiz Enthusiast",
        description: "Complete 25+ quizzes",
        target: 25,
        current: totalQuizResults.length,
        earned: totalQuizResults.length >= 25,
      },
      time_saver: {
        title: "Time Saver",
        description: "Save 10+ hours through efficient reading",
        target: 10,
        current: Math.round(hoursSaved),
        earned: hoursSaved >= 10,
      },
    };

    // Update achievements in database
    for (const [type, achievement] of Object.entries(achievementTypes)) {
      if (achievement.earned) {
        const existingAchievement = userAchievements.find(
          (a) => a.type === type
        );
        if (!existingAchievement) {
          await prisma.achievement.create({
            data: {
              userId,
              type,
              unlockedAt: new Date(),
            },
          });
        }
      }
    }

    // Get updated achievements
    const updatedAchievements = await prisma.achievement.findMany({
      where: { userId },
    });

    // Reading activity for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const activity = dailyActivity.get(dateStr) || 0;

      last7Days.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: dateStr,
        completed: activity > 0,
        count: activity,
      });
    }

    const stats = {
      // Main dashboard stats
      documentsRead: completedDocuments,
      hoursSaved: Math.round(hoursSaved * 10) / 10, // Round to 1 decimal
      quizScore: quizAverage,
      readingSpeed: readingSpeed,

      // Weekly goal
      weeklyGoal: {
        current: weeklyDocuments,
        target: weeklyGoal,
        percentage: Math.round(weeklyProgress),
      },

      // Reading streak
      streak: {
        current: currentStreak,
        best: Math.max(currentStreak, maxStreak),
        last7Days: last7Days,
      },

      // Achievements
      achievements: Object.entries(achievementTypes).map(
        ([type, achievement]) => {
          const earned = updatedAchievements.find((a) => a.type === type);
          return {
            type,
            title: achievement.title,
            description: achievement.description,
            earned: !!earned,
            progress: Math.min(
              100,
              (achievement.current / achievement.target) * 100
            ),
            current: achievement.current,
            target: achievement.target,
            unlockedAt: earned?.unlockedAt || null,
          };
        }
      ),

      // Additional stats
      totalDocuments,
      totalQuizzes: totalQuizResults.length,
      weeklyQuizzes: weeklyQuizResults.length,
      totalReadingTime: Math.round(totalReadingTimeMinutes),
      averageSessionTime:
        totalReadingSessions.length > 0
          ? Math.round(totalReadingTimeMinutes / totalReadingSessions.length)
          : 0,

      // Activity insights
      mostActiveDay: last7Days.reduce(
        (max, day) => (day.count > max.count ? day : max),
        last7Days[0]
      ),
      readingConsistency: Math.round(
        (last7Days.filter((d) => d.completed).length / 7) * 100
      ),

      // Performance metrics
      wordsPerSession:
        totalReadingSessions.length > 0
          ? Math.round(totalWordsRead / totalReadingSessions.length)
          : 0,
      completionRate:
        totalDocuments > 0
          ? Math.round((completedDocuments / totalDocuments) * 100)
          : 0,
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}
