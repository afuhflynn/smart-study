"use client";

import { useState, useEffect, useCallback } from "react";
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
import { toast } from "sonner"; // Assuming sonner toast is configured
import { QuizType } from "@prisma/client";

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
  difficulty: "Easy" | "Medium" | "Hard";
}

interface QuizResult {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface QuizMetadata {
  totalQuestions: number;
  difficulty: string;
  estimatedTime: number;
  createdAt: string;
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
// Changed to GET for RESTfulness, assuming backend supports it via query param
const getQuizByDocumentId = async (
  documentId: string
): Promise<QuizResponse | null> => {
  const response = await fetch(`/api/quiz/${documentId}`, {
    method: "GET", // Changed to GET
    headers: { "Content-Type": "application/json" },
  });

  if (response.status === 404 || response.status === 204) {
    // No quiz found for this document, not an error state
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Failed to fetch quiz: ${response.status} ${response.statusText}`
    );
  }

  const data: QuizResponse = await response.json();
  if (!data.success) {
    // If success is false, even if status is OK, treat as error
    throw new Error(data.error || "Failed to fetch quiz due to server logic.");
  }
  return data;
};

// Helper function for creating a new quiz
interface CreateQuizPayload {
  content: string;
  difficulty: "easy" | "medium" | "hard";
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

  const data: QuizResponse = await response.json();
  if (!data.success || !data.questions || data.questions.length === 0) {
    throw new Error(
      data.error || "Failed to generate quiz or no questions returned."
    );
  }
  return data;
};

export function QuizPanel({ document }: QuizPanelProps) {
  const queryClient = useQueryClient();

  // UI-specific states (not managed by Tanstack Query)
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [questionCount, setQuestionCount] = useState<number>(10);

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
      // The onSuccess of useQuery will handle updating quizData and UI states
      toast.success(`Generated ${data.questions?.length || 0} quiz questions!`);
    },
    onError: (error) => {
      toast.error(`Error generating quiz: ${error.message}`);
    },
  });

  // Derived states from Tanstack Query results
  const questions = quizData?.questions || [];
  const quizId = quizData?.id || null;
  const quizMetadata = quizData?.metadata || null;
  const isGenerating = createQuizMutation.isPending; // True if a new quiz is being generated
  // Consolidated error message from either fetching or generating
  const currentError = isQuizError
    ? quizError.message
    : createQuizMutation.isError
    ? createQuizMutation.error.message
    : null;

  // Callback to reset UI states for a new quiz attempt
  const restartQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
    setQuizCompleted(false);
    setResults([]);
  }, []);

  // Handler for generating a new quiz via mutation
  const handleGenerateNewQuiz = useCallback(() => {
    const contentToUse = document.content.substring(0, 4000); // Limit content for API
    createQuizMutation.mutate({
      content: contentToUse,
      difficulty: difficulty,
      questionCount: questionCount,
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

  const calculateResults = (): QuizResult[] => {
    return questions.map((question) => ({
      questionId: question.id,
      userAnswer: userAnswers[question.id] || "",
      isCorrect:
        (userAnswers[question.id] || "").toLowerCase().trim() ===
        question.correctAnswer.toLowerCase().trim(),
      timeSpent: Math.floor(Math.random() * 60) + 30, // Mock time for now
    }));
  };

  const submitQuiz = () => {
    const quizResults = calculateResults();
    setResults(quizResults);
    setQuizCompleted(true);
    setShowResults(true);

    const correctCount = quizResults.filter((r) => r.isCorrect).length;
    const percentage = Math.round((correctCount / questions.length) * 100);

    toast.success(
      `Quiz completed! You scored ${percentage}% (${correctCount}/${questions.length})`
    );
    // Optionally, update quiz score on server if quizId is set
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

  const getDifficultyColor = (difficulty: Question["difficulty"]) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "Hard":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // --- Conditional Renders (Revised Order) ---

  // 1. Initial Load or Generation in Progress:
  // `isQuizLoading` covers the initial data fetch.
  // `isGenerating` covers the new quiz generation.
  // `!isFetched` ensures we show this for the very first attempt to get data,
  // preventing a flash of "no quiz available" before the fetch completes.
  if (isQuizLoading || isGenerating || (!isFetched && !currentError)) {
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
                {isGenerating ? "Preparing questions for" : "Loading quiz for"}{" "}
                {document.title}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isGenerating ? "Preparing Quiz" : "Loading Quiz"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {isGenerating
                ? "Generating new questions..."
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
              disabled={isGenerating}
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
  if (questions.length === 0 && !isGenerating && isFetched) {
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
            <Button
              onClick={handleGenerateNewQuiz}
              disabled={isGenerating}
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
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={restartQuiz}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button
                onClick={handleGenerateNewQuiz}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                New Quiz
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
    // Log an error or return a fallback component.
    console.error("currentQ is undefined, unexpected state.");
    return null;
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
                  setDifficulty(e.target.value as "easy" | "medium" | "hard")
                }
                className="px-2 py-1 border rounded text-sm bg-gray-50 dark:bg-gray-800"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <Button
              onClick={handleGenerateNewQuiz}
              disabled={isGenerating}
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
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Submit Quiz
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
