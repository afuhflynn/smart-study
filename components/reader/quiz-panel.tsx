// components/QuizPanel.tsx
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  RotateCcw,
  CheckCircle,
  XCircle,
  Trophy,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { QuizType, QuestionDifficulty } from "@prisma/client"; // Import the enum

// Import Tanstack Query hooks
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Document {
  id: string;
  title: string;
  content: string;
  chapters: { id: string; title: string; startIndex: number }[];
}

interface QuizPanelProps {
  document: Document;
}

interface Question {
  id: string;
  type: QuizType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: QuestionDifficulty; // Use the enum
}

interface QuizResultFrontend {
  // Renamed to avoid confusion with backend QuizResult model
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  // timeSpent: number; // Removed per-question time for simplicity in submission
}

// Updated QuizMetadata to reflect what the GET API now returns
interface QuizMetadata {
  totalQuestions: number;
  difficulty: QuestionDifficulty;
  createdAt: string;
  lastScore?: number;
  bestScore?: number;
  totalAttempts?: number;
  estimatedTime?: number; // Keep if you still want to mock/use this
}

// Define the shape of the data returned by the fetch quiz API
interface QuizResponse {
  success: boolean;
  id: string; // Quiz ID
  questions: Question[];
  metadata: QuizMetadata;
  error?: string;
}

// Helper function for fetching an existing quiz by document ID
const getQuizByDocumentId = async (
  documentId: string
): Promise<QuizResponse | null> => {
  const response = await fetch(`/api/quiz/${documentId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (response.status === 404 || response.status === 204) {
    return null; // No quiz found for this document, not an error state
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Failed to fetch quiz: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json(); // This data contains top-level quiz properties

  // Map backend response to QuizResponse interface, creating the metadata object
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch quiz due to server logic.");
  }

  return {
    success: data.success,
    id: data.id,
    questions: data.questions,
    metadata: {
      totalQuestions: data.questionCount || data.questions.length,
      difficulty: data.difficulty || "Medium", // Default if not provided
      createdAt: data.createdAt,
      lastScore: data.lastScore,
      bestScore: data.bestScore,
      totalAttempts: data.totalAttempts,
      // estimatedTime: data.estimatedTime, // Include if your API provides this
    },
  };
};

// Helper function for creating a new quiz
interface CreateQuizPayload {
  content: string;
  difficulty: QuestionDifficulty; // Use the enum
  questionCount: number;
  documentId: string;
  title: string;
}

const createQuiz = async (
  payload: CreateQuizPayload
): Promise<QuizResponse> => {
  const response = await fetch(`/api/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Failed to generate quiz: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  if (!data.success || !data.questions || data.questions.length === 0) {
    throw new Error(
      data.error || "Failed to generate quiz or no questions returned."
    );
  }

  // Map backend response to QuizResponse interface, creating the metadata object
  return {
    success: data.success,
    id: data.id,
    questions: data.questions,
    metadata: {
      totalQuestions: data.questionCount || data.questions.length,
      difficulty: data.difficulty || "MEDIUM", // Default if not provided
      createdAt: data.createdAt,
      lastScore: data.lastScore,
      bestScore: data.bestScore,
      totalAttempts: data.totalAttempts,
      // estimatedTime: data.estimatedTime, // Include if your API provides this
    },
  };
};

// New Helper function for submitting quiz results
interface SubmitQuizResultPayload {
  documentId: string;
  quizId: string | null;
  questions: Question[]; // Snapshot of questions
  results: QuizResultFrontend[]; // User's answers and correctness
  score: number; // Percentage
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // Total time in milliseconds
  difficulty: QuestionDifficulty;
}

const submitQuizResults = async (
  payload: SubmitQuizResultPayload
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`/api/quiz/results`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Failed to submit quiz results: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

export function QuizPanel({ document }: QuizPanelProps) {
  const queryClient = useQueryClient();

  // UI-specific states
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false); // Redundant if showResults covers completion
  const [results, setResults] = useState<QuizResultFrontend[]>([]);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("MEDIUM"); // Initialize with an enum value
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null); // For tracking total quiz time

  console.log(quizCompleted);
  // Tanstack Query for fetching existing quiz
  const {
    data: quizData,
    isLoading: isQuizLoading, // Initial fetch loading state
    isError: isQuizError, // Error state for fetch
    error: quizError, // Error object for fetch
    isFetched, // True if the query has completed at least one fetch
  } = useQuery<QuizResponse | null, Error>({
    queryKey: ["quiz", document.id],
    queryFn: () => getQuizByDocumentId(document.id),
    enabled: !!document.id, // Only run the query if document.id is available
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes

    // If the fetch returns null (no existing quiz), this is not an error but a state for user to generate one.
    // The `isFetched` flag helps distinguish this from `isLoading`.
  });

  // Tanstack Mutation for generating a new quiz
  const createQuizMutation = useMutation<
    QuizResponse,
    Error,
    CreateQuizPayload
  >({
    mutationFn: createQuiz,
    onSuccess: (data) => {
      // Invalidate the existing quiz query to force a refetch of the new quiz
      queryClient.invalidateQueries({ queryKey: ["quiz", document.id] });
      toast.success(`Generated ${data.questions?.length || 0} quiz questions!`);
      restartQuiz(); // Reset UI state for a fresh quiz attempt
      setQuizStartTime(Date.now()); // Start timer for the new quiz
      // Update local state for difficulty and questionCount to match generated quiz
      setDifficulty(data.metadata.difficulty);
      setQuestionCount(data.metadata.totalQuestions);
    },
    onError: (error) => {
      toast.error(`Error generating quiz: ${error.message}`);
    },
  });

  // Tanstack Mutation for submitting quiz results
  const submitResultsMutation = useMutation<
    { success: boolean; message: string },
    Error,
    SubmitQuizResultPayload
  >({
    mutationFn: submitQuizResults,
    onSuccess: (data) => {
      toast.success(data.message || "Quiz results submitted!");
      // Invalidate the main quiz query to refetch updated scores (lastScore, bestScore, totalAttempts)
      queryClient.invalidateQueries({ queryKey: ["quiz", document.id] });
    },
    onError: (error) => {
      toast.error(`Error submitting results: ${error.message}`);
    },
  });

  // Derived states from Tanstack Query results
  const questions = quizData?.questions || [];
  const quizId = quizData?.id || null;
  const quizMetadata = quizData?.metadata || null; // Access metadata directly
  const isGenerating = createQuizMutation.isPending; // True if a new quiz is being generated
  const isSubmitting = submitResultsMutation.isPending; // New: True if quiz results are being submitted

  // Consolidated error message from either fetching, generating, or submitting
  const currentError = isQuizError
    ? quizError.message
    : createQuizMutation.isError
    ? createQuizMutation.error.message
    : submitResultsMutation.isError
    ? submitResultsMutation.error.message
    : null;

  // Callback to reset UI states for a new quiz attempt or retake
  const restartQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
    setQuizCompleted(false);
    setResults([]);
    setQuizStartTime(Date.now()); // Reset and start timer for new attempt
  }, []);

  // Handler for generating a new quiz via mutation
  const handleGenerateNewQuiz = useCallback(() => {
    // Limit content for API to avoid hitting token limits
    const contentToUse = document.content.substring(0, 4000);
    createQuizMutation.mutate({
      content: contentToUse,
      difficulty: difficulty, // Use current state value
      questionCount: questionCount, // Use current state value
      documentId: document.id,
      title: document.title,
    });
  }, [
    createQuizMutation,
    document.content,
    document.id,
    document.title,
    difficulty,
    questionCount,
  ]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const calculateResults = (): QuizResultFrontend[] => {
    return questions.map((question) => ({
      questionId: question.id,
      userAnswer: userAnswers[question.id] || "",
      isCorrect:
        (userAnswers[question.id] || "").toLowerCase().trim() ===
        question.correctAnswer.toLowerCase().trim(),
      // timeSpent is not used for per-question tracking in the current submission payload
    }));
  };

  const submitQuiz = () => {
    const quizResults = calculateResults();
    setResults(quizResults);
    setQuizCompleted(true);
    setShowResults(true);

    const correctCount = quizResults.filter((r) => r.isCorrect).length;
    const percentage =
      questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

    toast.success(
      `Quiz completed! You scored ${percentage.toFixed(0)}% (${correctCount}/${
        questions.length
      })`
    );

    // Calculate total time spent in milliseconds
    const totalTime = quizStartTime ? Date.now() - quizStartTime : 0;

    // Submit results to the backend
    submitResultsMutation.mutate({
      documentId: document.id,
      quizId: quizId,
      questions: questions, // Send a snapshot of the questions
      results: quizResults, // Send the calculated results
      score: percentage,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeSpent: totalTime,
      difficulty: difficulty, // Send the difficulty of this attempt
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const totalQuestions = questions.length;
  const scorePercentage =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const getDifficultyColor = (difficulty: QuestionDifficulty) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "HARD":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // --- Conditional Renders (Revised Order) ---

  // 1. Initial Load or Generation/Submission in Progress:
  // `isQuizLoading` covers the initial data fetch.
  // `isGenerating` covers the new quiz generation.
  // `isSubmitting` covers the result submission.
  // `!isFetched` ensures we show this for the very first attempt to get data,
  // preventing a flash of "no quiz available" before the fetch completes.
  if (
    isQuizLoading ||
    isGenerating ||
    isSubmitting ||
    (!isFetched && !currentError)
  ) {
    return (
      <div className="h-full flex flex-col ">
        <div className="border-b p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Interactive Quiz
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isGenerating
                  ? "Preparing questions for"
                  : isSubmitting
                  ? "Submitting results for"
                  : "Loading quiz for"}{" "}
                {document.title}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isGenerating
                ? "Preparing Quiz"
                : isSubmitting
                ? "Submitting Quiz"
                : "Loading Quiz"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {isGenerating
                ? "Generating new questions..."
                : isSubmitting
                ? "Saving your progress..."
                : "Checking for existing quiz or fetching..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State (after an attempt, and no questions are loaded):
  // This triggers if fetching/generating failed and `currentError` is populated,
  // AND `questions` are empty (meaning no successful data fetch).
  // `isFetched` ensures we only show this after an initial fetch attempt.
  if (currentError && questions.length === 0 && isFetched) {
    return (
      <div className="h-full flex flex-col ">
        <div className="border-b p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Interactive Quiz
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Test your understanding
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Quiz Operation Failed
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {currentError}
            </p>
            <Button
              onClick={handleGenerateNewQuiz}
              disabled={isGenerating || isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Try Again / Generate New
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. No Quiz Available (after a completed initial load attempt, but no questions were found/generated):
  // This state is reached when `questions.length` is 0, `isGenerating` is false,
  // AND `isFetched` is true (meaning the useQuery hook has completed its initial fetch, even if it returned null).
  if (questions.length === 0 && !isGenerating && !isSubmitting && isFetched) {
    return (
      <div className="h-full flex flex-col ">
        <div className="border-b p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Interactive Quiz
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Test your understanding
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Quiz Available
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Generate quiz questions to test your understanding of this
              document.
            </p>
            {/* Difficulty and Question Count selection before generating new */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="question-count-select"
                  className="text-sm text-gray-600 dark:text-gray-300"
                >
                  Questions:
                </Label>
                <select
                  id="question-count-select"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="px-3 py-2 border rounded-md text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                  <option value={30}>30</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="difficulty-select"
                  className="text-sm text-gray-600 dark:text-gray-300"
                >
                  Difficulty:
                </Label>
                <select
                  id="difficulty-select"
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as QuestionDifficulty)
                  }
                  className="px-3 py-2 border rounded-md text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleGenerateNewQuiz}
              disabled={isGenerating || isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                "Generating..."
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Generate Quiz
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Show Results State:
  if (showResults) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/50 dark:to-blue-900/50 rounded-lg">
                <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Quiz Results
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  You scored {correctAnswers}/{totalQuestions} (
                  {Math.round(scorePercentage)}%)
                </p>
                {quizMetadata && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <p>
                      Total Attempts:{" "}
                      <span className="font-semibold">
                        {quizMetadata.totalAttempts || 0}
                      </span>
                    </p>
                    <p>
                      Last Score:{" "}
                      <span className="font-semibold">
                        {quizMetadata.lastScore !== undefined
                          ? `${quizMetadata.lastScore}%`
                          : "N/A"}
                      </span>{" "}
                      | Best Score:{" "}
                      <span className="font-semibold">
                        {quizMetadata.bestScore !== undefined
                          ? `${quizMetadata.bestScore}%`
                          : "N/A"}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={restartQuiz}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button
                onClick={handleGenerateNewQuiz}
                disabled={isGenerating || isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGenerating || isSubmitting ? "Processing..." : "New Quiz"}
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={scorePercentage} className="h-1" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {questions.map((question, index) => {
              const result = results.find((r) => r.questionId === question.id);
              const isCorrect = result?.isCorrect || false;

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className={`border-l-4 ${
                      isCorrect ? "border-l-green-500" : "border-l-red-500"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base flex items-center space-x-2">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span>Question {index + 1}</span>
                          <Badge
                            className={getDifficultyColor(question.difficulty)}
                          >
                            {question.difficulty}
                          </Badge>
                        </CardTitle>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {question.question}
                      </p>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Your answer:{" "}
                            <span
                              className={
                                isCorrect ? "text-green-600" : "text-red-600"
                              }
                            >
                              {result?.userAnswer || "Not answered"}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Correct answer:{" "}
                              <span className="text-green-600">
                                {question.correctAnswer}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 5. Main Quiz Display State (Default Fallback):
  const currentQ = questions[currentQuestion];

  if (!currentQ) {
    // This should ideally not be reached if previous conditions are correct,
    // as it means questions array is empty but we're past "no quiz available" state.
    console.error("currentQ is undefined, unexpected state.");
    return null; // Or render a different fallback, e.g., a "loading..." or "error" message.
  }

  return (
    <div className="h-full flex flex-col ">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Interactive Quiz
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Test your understanding of {document.title}
              </p>
              {quizMetadata && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <p>
                    Total Attempts:{" "}
                    <span className="font-semibold">
                      {quizMetadata.totalAttempts || 0}
                    </span>
                  </p>
                  <p>
                    Last Score:{" "}
                    <span className="font-semibold">
                      {quizMetadata.lastScore !== undefined
                        ? `${quizMetadata.lastScore}%`
                        : "N/A"}
                    </span>{" "}
                    | Best Score:{" "}
                    <span className="font-semibold">
                      {quizMetadata.bestScore !== undefined
                        ? `${quizMetadata.bestScore}%`
                        : "N/A"}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <label className="text-sm ">Questions:</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="px-2 py-1 border rounded text-sm bg-gray-50 dark:bg-gray-800"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
                <option value={30}>30</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Label className="text-sm text-gray-600 dark:text-gray-300">
                Difficulty:
              </Label>
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as QuestionDifficulty)
                }
                className="px-2 py-1 border rounded text-sm bg-gray-50 dark:bg-gray-800"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <Button
              onClick={handleGenerateNewQuiz}
              disabled={isGenerating || isSubmitting}
              variant="outline"
              size="sm"
            >
              {isGenerating ? "Generating..." : "New Quiz"}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <Badge className={getDifficultyColor(currentQ.difficulty)}>
            {currentQ.difficulty}
          </Badge>
        </div>

        <Progress
          value={((currentQuestion + 1) / questions.length) * 100}
          className="mt-2"
        />
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{currentQ.question}</CardTitle>
              </CardHeader>

              <CardContent>
                {currentQ.type === "MULTIPLE_CHOICE" && currentQ.options && (
                  <RadioGroup
                    value={userAnswers[currentQ.id] || ""}
                    onValueChange={(value) =>
                      handleAnswerChange(currentQ.id, value)
                    }
                  >
                    {currentQ.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer text-gray-700 dark:text-gray-300"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQ.type === "FILL_IN_BLANK" && (
                  <div className="space-y-3">
                    <Label
                      htmlFor="fill-answer"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Your answer:
                    </Label>
                    <Input
                      id="fill-answer"
                      value={userAnswers[currentQ.id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(currentQ.id, e.target.value)
                      }
                      placeholder="Type your answer here..."
                      className="w-full"
                    />
                  </div>
                )}

                {currentQ.type === "TRUE_FALSE" && currentQ.options && (
                  <RadioGroup
                    value={userAnswers[currentQ.id] || ""}
                    onValueChange={(value) =>
                      handleAnswerChange(currentQ.id, value)
                    }
                  >
                    {currentQ.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <RadioGroupItem
                          value={option}
                          id={`tf-option-${index}`}
                        />
                        <Label
                          htmlFor={`tf-option-${index}`}
                          className="flex-1 cursor-pointer text-gray-700 dark:text-gray-300"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="border-t p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={submitQuiz}
                disabled={isSubmitting} // Disable during submission
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                disabled={currentQuestion === questions.length - 1}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
