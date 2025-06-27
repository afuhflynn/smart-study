"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileQuestion,
  Search,
  Trash2,
  Play,
  Upload,
  Calendar,
  RefreshCw,
  Trophy,
  Target,
} from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  date: string;
  summaryId: string;
  lastScore?: number;
  totalAttempts: number;
  bestScore: number;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // In a real app, we'd fetch quizzes from API
  // For demo, we'll create mock data
  useEffect(() => {
    const fetchData = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData: Quiz[] = [
        {
          id: "1",
          title: "Photosynthesis Process Quiz",
          difficulty: "medium",
          questionCount: 5,
          date: "2025-03-15T10:35:00",
          summaryId: "summary-1",
          lastScore: 4,
          totalAttempts: 3,
          bestScore: 5,
        },
        {
          id: "2",
          title: "Cell Structure and Function Quiz",
          difficulty: "easy",
          questionCount: 5,
          date: "2025-03-14T14:50:00",
          summaryId: "summary-2",
          lastScore: 3,
          totalAttempts: 2,
          bestScore: 4,
        },
        {
          id: "3",
          title: "Newton's Laws of Motion Quiz",
          difficulty: "hard",
          questionCount: 5,
          date: "2025-03-13T09:20:00",
          summaryId: "summary-3",
          totalAttempts: 0,
          bestScore: 0,
        },
      ];

      setQuizzes(mockData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleDelete = (id: string) => {
    setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== id));
    setQuizToDelete(null);
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 paddingX h-screen overflow-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Quizzes</h1>
          <p className="text-foreground/70">
            Take quizzes and track your learning progress
          </p>
        </div>
        <Link href="/dashboard/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            New Upload
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
        <Input
          placeholder="Search quizzes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <FileQuestion className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <div className="flex items-center space-x-1 text-xs text-foreground/50">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(quiz.date)}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(quiz.difficulty)}>
                      {quiz.difficulty}
                    </Badge>
                    <span>{quiz.questionCount} questions</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-3">
                    {quiz.totalAttempts > 0 ? (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground/70">
                            Best Score:
                          </span>
                          <span
                            className={`font-medium ${getScoreColor(
                              quiz.bestScore,
                              quiz.questionCount
                            )}`}
                          >
                            {quiz.bestScore}/{quiz.questionCount}
                          </span>
                        </div>
                        {quiz.lastScore !== undefined && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground/70">
                              Last Score:
                            </span>
                            <span
                              className={`font-medium ${getScoreColor(
                                quiz.lastScore,
                                quiz.questionCount
                              )}`}
                            >
                              {quiz.lastScore}/{quiz.questionCount}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground/70">Attempts:</span>
                          <span className="font-medium">
                            {quiz.totalAttempts}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <Target className="h-8 w-8 text-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-foreground/70">
                          Not attempted yet
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <div className="px-6 pb-6 pt-2 border-t flex justify-between">
                  <div className="space-x-2">
                    <Link href={`/dashboard/quiz/${quiz.id}`}>
                      <Button size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        {quiz.totalAttempts > 0 ? "Retake" : "Start"}
                      </Button>
                    </Link>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setQuizToDelete(quiz.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 space-y-4">
              <FileQuestion className="h-12 w-12 text-foreground/30 mx-auto" />
              <h3 className="text-xl font-medium">No quizzes found</h3>
              <p className="text-foreground/70 max-w-md mx-auto">
                {searchTerm
                  ? `No quizzes match "${searchTerm}". Try a different search term.`
                  : "You haven't generated any quizzes yet. Upload a textbook page and create a summary to generate quizzes."}
              </p>
              {!searchTerm && (
                <Link href="/dashboard">
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload a Page
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!quizToDelete} onOpenChange={() => setQuizToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete this quiz and all associated results.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuizToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => quizToDelete && handleDelete(quizToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
