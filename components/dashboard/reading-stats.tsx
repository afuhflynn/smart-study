"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Award, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const weeklyGoal = {
  current: 12,
  target: 15,
  percentage: 80,
};

const achievements = [
  {
    title: "Speed Reader",
    description: "Read 200+ WPM",
    icon: TrendingUp,
    earned: true,
    color: "text-green-600",
  },
  {
    title: "Quiz Master",
    description: "90%+ average score",
    icon: Award,
    earned: true,
    color: "text-blue-600",
  },
  {
    title: "Consistency King",
    description: "7 days streak",
    icon: Calendar,
    earned: false,
    color: "text-gray-400",
  },
];

const readingStreak = [
  { day: "Mon", completed: true },
  { day: "Tue", completed: true },
  { day: "Wed", completed: true },
  { day: "Thu", completed: true },
  { day: "Fri", completed: false },
  { day: "Sat", completed: false },
  { day: "Sun", completed: false },
];

export function ReadingStats() {
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
              {weeklyGoal.target - weeklyGoal.current} more documents to reach
              your weekly goal
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
            🔥 4 day streak! Keep it up to reach your weekly goal.
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
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                  achievement.earned
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-gray-50 dark:bg-gray-800"
                }`}
              >
                <achievement.icon
                  className={`h-5 w-5 mt-0.5 ${achievement.color}`}
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
                </div>
                {achievement.earned && (
                  <div className="text-green-600 dark:text-green-400">
                    <Award className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
