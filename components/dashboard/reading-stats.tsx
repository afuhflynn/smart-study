"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Target, Award, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface ReadingStatsProps {
  userStats?: any;
  isLoading?: boolean;
}

export function ReadingStats({ userStats, isLoading }: ReadingStatsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Weekly Goal Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Weekly Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </CardContent>
        </Card>

        {/* Reading Streak Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reading Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-3 w-8 mb-1 mx-auto" />
                  <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                </div>
              ))}
            </div>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>

        {/* Achievements Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3">
                  <Skeleton className="h-5 w-5" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weeklyGoal = userStats?.weeklyGoal || {
    current: 0,
    target: 5,
    percentage: 0,
  };

  const readingStreak = userStats?.streak?.last7Days || [];
  const achievements = userStats?.achievements || [];
  const currentStreak = userStats?.streak?.current || 0;

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "speed_reader":
        return TrendingUp;
      case "quiz_master":
        return Award;
      case "consistency":
        return Calendar;
      case "explorer":
        return Target;
      case "enthusiast":
        return Award;
      case "time_saver":
        return TrendingUp;
      default:
        return Award;
    }
  };

  const getStreakMessage = () => {
    if (currentStreak === 0) {
      return "Start your reading streak today! 📚";
    } else if (currentStreak === 1) {
      return "Great start! Keep it going tomorrow! 🌟";
    } else if (currentStreak < 7) {
      return `${currentStreak} day streak! You're building momentum! 🔥`;
    } else {
      return `Amazing ${currentStreak} day streak! You're a reading champion! 🏆`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Weekly Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Weekly Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Documents Read
              </span>
              <span className="text-sm font-medium">
                {weeklyGoal.current}/{weeklyGoal.target}
              </span>
            </div>

            <Progress value={weeklyGoal.percentage} className="h-2" />

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {weeklyGoal.current >= weeklyGoal.target
                ? "🎉 Weekly goal achieved! Keep up the great work!"
                : `${
                    weeklyGoal.target - weeklyGoal.current
                  } more documents to reach your weekly goal`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reading Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reading Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {readingStreak.map((day, index) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {day.day}
                </div>
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors ${
                    day.completed
                      ? "bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "border-gray-200 text-gray-400 dark:border-gray-700"
                  }`}
                >
                  {day.completed ? "✓" : index + 1}
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            {getStreakMessage()}
          </p>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements
              .sort((a, b) => {
                if (a.earned && !b.earned) return -1;
                if (!a.earned && b.earned) return 1;
                return b.progress - a.progress;
              })
              .map((achievement, index) => {
                const IconComponent = getAchievementIcon(achievement.type);
                return (
                  <motion.div
                    key={achievement.type}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                      achievement.earned
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <IconComponent
                      className={`h-5 w-5 mt-0.5 ${
                        achievement.earned
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-400"
                      }`}
                    />
                    <div className="flex-1">
                      <h4
                        className={`text-sm font-medium ${
                          achievement.earned
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {achievement.description}
                      </p>
                      {!achievement.earned && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>
                              {achievement.current}/{achievement.target}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(
                                  100,
                                  achievement.progress
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    {achievement.earned && (
                      <div className="text-green-600 dark:text-green-400">
                        <Award className="h-4 w-4" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
