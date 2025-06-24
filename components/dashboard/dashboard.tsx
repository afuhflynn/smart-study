"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/components/upload/file-upload";
import { RecentDocuments } from "./recent-documents";
import { ReadingStats } from "./reading-stats";
import { Plus, BookOpen, Clock, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export function Dashboard() {
  const [showUpload, setShowUpload] = useState(false);
  const { data: session } = useSession();
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/user/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      if (data.success) {
        return data.stats;
      } else {
        throw new Error(data.error || "Failed to load statistics");
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast.error("Failed to load dashboard statistics");
    }
  };

  const { data: stats, isPending } = useQuery({
    queryKey: ["stats"],
    staleTime: 5000,
    gcTime: 1000,
    queryFn: fetchStats,
  });

  const getStatCards = () => {
    if (!stats) return [];

    return [
      {
        title: "Documents Read",
        value: stats.documentsRead.toString(),
        change: `${stats.completionRate}% completion rate`,
        icon: BookOpen,
        gradient: "from-blue-500 to-indigo-500",
      },
      {
        title: "Hours Saved",
        value: stats.hoursSaved.toString(),
        change: `${stats.readingConsistency}% consistency`,
        icon: Clock,
        gradient: "from-emerald-500 to-teal-500",
      },
      {
        title: "Quiz Score",
        value: `${stats.quizScore}%`,
        change: `${stats.totalQuizzes} quizzes taken`,
        icon: TrendingUp,
        gradient: "from-violet-500 to-purple-500",
      },
      {
        title: "Reading Speed",
        value: `${stats.readingSpeed} WPM`,
        change: `${stats.wordsPerSession} words/session`,
        icon: Zap,
        gradient: "from-amber-500 to-orange-500",
      },
    ];
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl animate-float"></div>
        <div
          className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-full blur-xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 relative z-10"
      >
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome back, {session?.user?.name?.split(" ")[0]}!
          </span>{" "}
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block"
          >
            👋
          </motion.span>
        </motion.h1>
        <motion.p
          className="text-slate-600 dark:text-slate-300 text-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Continue your learning journey with AI-powered reading tools.
        </motion.p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="mb-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => setShowUpload(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover-glow group relative overflow-hidden"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="mr-2 h-5 w-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10">Upload Document</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        {isPending
          ? // Loading skeletons
            [...Array(4)].map((_, index) => (
              <Card
                key={index}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-xl" />
                  </div>
                </CardContent>
              </Card>
            ))
          : getStatCards().map((stat) => (
              <div key={stat.title} className="group">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover-glow transition-all duration-300 relative overflow-hidden">
                  {/* Animated background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  ></div>

                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                          {stat.value}
                        </p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {stat.change} from last month
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                      >
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Recent Documents */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <RecentDocuments isUploadComplete={isUploadComplete} />
        </motion.div>

        {/* Reading Stats */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <ReadingStats userStats={stats} isLoading={isPending} />
        </motion.div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowUpload(false)}
        >
          <motion.div
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.h2
              className="text-xl font-bold mb-4 text-slate-900 dark:text-white text-gradient"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Upload Document
            </motion.h2>
            <FileUpload
              onClose={() => setShowUpload(false)}
              setIsUploadComplete={setIsUploadComplete}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
