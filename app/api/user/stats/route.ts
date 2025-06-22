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

    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        documents: {
          select: {
            id: true,
            progress: true,
            wordCount: true,
            estimatedReadTime: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        quizResults: {
          select: {
            score: true,
            timeSpent: true,
            createdAt: true,
            totalQuestions: true,
            correctAnswers: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate statistics
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Documents statistics
    const totalDocuments = user.documents.length;
    const completedDocuments = user.documents.filter(
      (doc) => doc.progress >= 100
    ).length;
    const documentsThisWeek = user.documents.filter(
      (doc) => doc.createdAt >= oneWeekAgo
    ).length;
    const documentsThisMonth = user.documents.filter(
      (doc) => doc.createdAt >= oneMonthAgo
    ).length;

    // Reading time calculations
    const totalEstimatedReadTime = user.documents.reduce(
      (sum, doc) => sum + doc.estimatedReadTime,
      0
    );
    const totalWordsRead = user.documents.reduce(
      (sum, doc) => sum + doc.wordCount * (doc.progress / 100),
      0
    );

    // Hours saved calculation (assuming 250 WPM average reading speed vs 150 WPM slow reading)
    const averageReadingSpeed = 250; // WPM
    const slowReadingSpeed = 150; // WPM
    const timeAtNormalSpeed = totalWordsRead / averageReadingSpeed; // minutes
    const timeAtSlowSpeed = totalWordsRead / slowReadingSpeed; // minutes
    const hoursSaved = Math.max(0, (timeAtSlowSpeed - timeAtNormalSpeed) / 60);

    // Quiz statistics
    const totalQuizzes = user.quizResults.length;
    const averageQuizScore =
      totalQuizzes > 0
        ? user.quizResults.reduce((sum, quiz) => sum + quiz.score, 0) /
          totalQuizzes
        : 0;
    const quizzesThisWeek = user.quizResults.filter(
      (quiz) => quiz.createdAt >= oneWeekAgo
    ).length;
    const recentQuizzes = user.quizResults.slice(-10); // Last 10 quizzes

    // Reading speed calculation (based on quiz completion times and word counts)
    const estimatedReadingSpeed =
      totalQuizzes > 0 && totalWordsRead > 0
        ? Math.round(
            totalWordsRead /
              (user.quizResults.reduce((sum, quiz) => sum + quiz.timeSpent, 0) /
                60)
          ) || 245
        : 245; // Default to 245 WPM

    // Weekly goal calculation (target: 5 documents per week)
    const weeklyGoalTarget = 5;
    const currentWeekProgress = documentsThisWeek;
    const weeklyGoalPercentage = Math.min(
      (currentWeekProgress / weeklyGoalTarget) * 100,
      100
    );

    // Reading streak calculation (days with document activity)
    const readingStreak = calculateReadingStreak(user.documents);

    // Achievement calculations
    const achievements = calculateAchievements({
      totalDocuments: completedDocuments,
      averageQuizScore,
      readingStreak: readingStreak.currentStreak,
      estimatedReadingSpeed,
      totalQuizzes,
      hoursSaved,
    });

    // Monthly comparisons for growth
    const lastMonthDocuments = user.documents.filter((doc) => {
      const docDate = new Date(doc.createdAt);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      return docDate >= twoMonthsAgo && docDate < oneMonthAgo;
    }).length;

    const lastMonthQuizzes = user.quizResults.filter((quiz) => {
      const quizDate = new Date(quiz.createdAt);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      return quizDate >= twoMonthsAgo && quizDate < oneMonthAgo;
    }).length;

    // Calculate growth percentages
    const documentsGrowth =
      lastMonthDocuments > 0
        ? ((documentsThisMonth - lastMonthDocuments) / lastMonthDocuments) * 100
        : documentsThisMonth > 0
        ? 100
        : 0;

    const quizzesGrowth =
      lastMonthQuizzes > 0
        ? ((quizzesThisWeek * 4 - lastMonthQuizzes) / lastMonthQuizzes) * 100
        : quizzesThisWeek > 0
        ? 100
        : 0;

    return NextResponse.json({
      success: true,
      stats: {
        // Main dashboard stats
        documentsRead: completedDocuments,
        totalDocuments,
        hoursSaved: Math.round(hoursSaved),
        quizScore: Math.round(averageQuizScore),
        readingSpeed: estimatedReadingSpeed,

        // Weekly goal
        weeklyGoal: {
          current: currentWeekProgress,
          target: weeklyGoalTarget,
          percentage: Math.round(weeklyGoalPercentage),
        },

        // Reading streak
        readingStreak: {
          currentStreak: readingStreak.currentStreak,
          longestStreak: readingStreak.longestStreak,
          weeklyPattern: readingStreak.weeklyPattern,
        },

        // Achievements
        achievements,

        // Additional metrics
        totalWordsRead: Math.round(totalWordsRead),
        totalQuizzes,
        documentsThisWeek,
        quizzesThisWeek,

        // Growth metrics
        growth: {
          documents:
            documentsGrowth > 0
              ? `+${Math.round(documentsGrowth)}%`
              : `${Math.round(documentsGrowth)}%`,
          quizzes:
            quizzesGrowth > 0
              ? `+${Math.round(quizzesGrowth)}%`
              : `${Math.round(quizzesGrowth)}%`,
          readingTime:
            hoursSaved > 0 ? `+${Math.round((hoursSaved / 30) * 100)}%` : "0%",
        },

        // Recent activity
        recentQuizzes: recentQuizzes.map((quiz) => ({
          score: Math.round(quiz.score),
          date: quiz.createdAt,
          questionsAnswered: quiz.totalQuestions,
          correctAnswers: quiz.correctAnswers,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

function calculateReadingStreak(documents: any[]) {
  // Sort documents by date
  const sortedDocs = documents
    .map((doc) => ({
      date: new Date(doc.updatedAt).toDateString(),
      progress: doc.progress,
    }))
    .filter((doc) => doc.progress > 0) // Only count docs with some progress
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedDocs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      weeklyPattern: Array(7).fill(false),
    };
  }

  // Calculate current streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

  // Check if user read today or yesterday
  if (sortedDocs[0]?.date === today || sortedDocs[0]?.date === yesterday) {
    currentStreak = 1;

    // Count consecutive days
    for (let i = 1; i < sortedDocs.length; i++) {
      const currentDate = new Date(sortedDocs[i - 1].date);
      const nextDate = new Date(sortedDocs[i].date);
      const dayDiff = Math.floor(
        (currentDate.getTime() - nextDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (dayDiff === 1) {
        currentStreak++;
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  // Calculate weekly pattern (last 7 days)
  const weeklyPattern = Array(7).fill(false);
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    return date.toDateString();
  }).reverse();

  last7Days.forEach((day, index) => {
    weeklyPattern[index] = sortedDocs.some((doc) => doc.date === day);
  });

  return {
    currentStreak,
    longestStreak,
    weeklyPattern,
  };
}

function calculateAchievements(stats: {
  totalDocuments: number;
  averageQuizScore: number;
  readingStreak: number;
  estimatedReadingSpeed: number;
  totalQuizzes: number;
  hoursSaved: number;
}) {
  const achievements = [
    {
      title: "Speed Reader",
      description: "Read at 200+ WPM",
      icon: "TrendingUp",
      earned: stats.estimatedReadingSpeed >= 200,
      progress: Math.min((stats.estimatedReadingSpeed / 200) * 100, 100),
      color: "text-blue-600",
      date:
        stats.estimatedReadingSpeed >= 200 ? new Date().toISOString() : null,
    },
    {
      title: "Quiz Master",
      description: "90%+ average quiz score",
      icon: "Award",
      earned: stats.averageQuizScore >= 90,
      progress: Math.min((stats.averageQuizScore / 90) * 100, 100),
      color: "text-purple-600",
      date: stats.averageQuizScore >= 90 ? new Date().toISOString() : null,
    },
    {
      title: "Consistency Champion",
      description: "7-day reading streak",
      icon: "Calendar",
      earned: stats.readingStreak >= 7,
      progress: Math.min((stats.readingStreak / 7) * 100, 100),
      color: "text-green-600",
      date: stats.readingStreak >= 7 ? new Date().toISOString() : null,
    },
    {
      title: "Document Explorer",
      description: "Complete 10+ documents",
      icon: "BookOpen",
      earned: stats.totalDocuments >= 10,
      progress: Math.min((stats.totalDocuments / 10) * 100, 100),
      color: "text-orange-600",
      date: stats.totalDocuments >= 10 ? new Date().toISOString() : null,
    },
    {
      title: "Quiz Enthusiast",
      description: "Take 25+ quizzes",
      icon: "Brain",
      earned: stats.totalQuizzes >= 25,
      progress: Math.min((stats.totalQuizzes / 25) * 100, 100),
      color: "text-indigo-600",
      date: stats.totalQuizzes >= 25 ? new Date().toISOString() : null,
    },
    {
      title: "Time Saver",
      description: "Save 10+ hours of reading time",
      icon: "Clock",
      earned: stats.hoursSaved >= 10,
      progress: Math.min((stats.hoursSaved / 10) * 100, 100),
      color: "text-emerald-600",
      date: stats.hoursSaved >= 10 ? new Date().toISOString() : null,
    },
  ];

  return achievements.sort((a, b) => {
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    return b.progress - a.progress;
  });
}
