"use client";

import { useState } from "react"; // useEffect and isLoading state will be managed by TanStack Query
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
  Target,
} from "lucide-react";

// TanStack Query imports
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner"; // Assuming you have a toast component (e.g., from shadcn/ui)

// Initialize QueryClient outside the component to prevent re-initialization
const queryClient = new QueryClient();

// --- Adjusted Quiz Interface based on Prisma model and client-side expectations ---
interface Quiz {
  id: string;
  title: string;
  // NOTE: `difficulty` is NOT directly on the Prisma Quiz model.
  // The API now derives it from the first question's difficulty.
  // For a robust solution, consider adding a `difficulty` field to your Prisma Quiz model.
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  userId: string;
  documentId: string; // Matches Prisma `documentId`
  totalAttempts: number; // No longer optional due to API mapping `null` to 0
  bestScore: number; // No longer optional due to API mapping `null` to 0
  lastScore: number; // Mapped from Prisma's `lastScore` typo, no longer optional
  createdAt: string; // Matches Prisma `createdAt`, used for date display
  updatedAt: string;
  // `questions` (Json[]) is not included here as we don't display it directly on this page
}

// --- Helper Functions ---

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
  // Handle cases where total is 0 to prevent division by zero
  if (total === 0) return "text-foreground/70"; // Or any other appropriate style
  const percentage = (score / total) * 100;
  if (percentage >= 80) return "text-green-600 dark:text-green-400";
  if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

// --- API Functions for TanStack Query ---

async function fetchQuizzes(): Promise<{ quizzes: Quiz[] }> {
  const res = await fetch("/api/quiz");
  if (!res.ok) {
    if (res.status === 401) {
      // Optionally redirect to login or handle unauthorized state
      // For now, re-throw to be caught by TanStack Query's error handling
      const errorData = await res.json();
      throw new Error(errorData.error || "Unauthorized: Please log in.");
    }
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch quizzes");
  }
  return res.json();
}

// --- Main QuizzesPage Component ---
function QuizzesPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [quizToDeleteId, setQuizToDeleteId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Query to fetch quizzes
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["quizzes"],
    queryFn: fetchQuizzes,
  });

  async function deleteQuiz(id: string): Promise<{ id: string }> {
    const res = await fetch(`/api/quiz/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || `Failed to delete quiz with ID: ${id}`
      );
    }
    refetch();
    return res.json();
  }
  // Mutation to delete a quiz
  const deleteMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: (data) => {
      // Invalidate the 'quizzes' query to refetch data
      // This is generally preferred for simple list invalidation,
      // or you could use setQueryData to remove the item directly for a faster UI.
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setQuizToDeleteId(null); // Close the dialog
      toast.success(`Quiz "${data.id}" deleted successfully!`);
    },
    onError: (err) => {
      toast.error(`Error deleting quiz: ${err.message}`);
    },
  });

  const handleDeleteClick = (id: string) => {
    setQuizToDeleteId(id);
  };

  const confirmDelete = () => {
    if (quizToDeleteId) {
      deleteMutation.mutate(quizToDeleteId);
    }
  };

  const allQuizzes = data?.quizzes || [];

  const filteredQuizzes = allQuizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-destructive">
          Error: {error?.message || "Failed to load quizzes."}
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["quizzes"] })
          }
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
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
                      <span>{formatDate(quiz.createdAt)}</span>
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
                        {/* Check if lastScore is defined before displaying */}
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
                    <Link
                      href={`/reader/${quiz.documentId}?tab=quiz&quizId=${quiz.id}`}
                    >
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
                    onClick={() => handleDeleteClick(quiz.id)}
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
      <Dialog
        open={!!quizToDeleteId}
        onOpenChange={() => {
          setQuizToDeleteId(null);
          deleteMutation.reset(); // Reset mutation state if dialog is closed manually
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete this quiz and all associated results.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQuizToDeleteId(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Wrap the component with QueryClientProvider
export default function QuizzesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <QuizzesPageContent />
    </QueryClientProvider>
  );
}
