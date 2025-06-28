"use client";

import { useState, useEffect, useCallback } from "react"; // useState, useEffect, useCallback will be mostly removed
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw, Copy, BookOpen, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Import TanStack Query hooks
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Document {
  id: string;
  title: string;
  content: string;
  chapters: { id: string; title: string; startIndex: number }[];
}

interface SummaryPanelProps {
  document: Document;
}

interface Summary {
  id: string;
  title: string;
  keyPoints: string[];
  mainIdeas: string[];
  actionItems: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readingTime: string;
  confidence: number;
  createdAt: string;
  documentId: string;
  chapterId?: string; // Optional, will be null for whole document summaries
}

// --- API Functions (separated for clarity) ---

// Function to fetch an existing summary
const fetchSummaryApi = async (docId: string): Promise<Summary | null> => {
  if (!docId) {
    return null; // Don't try to fetch if docId is not available
  }

  const response = await fetch(`/api/summarize/${docId}`, {
    method: "GET", // Sticking to POST as per original code, though GET would be more RESTful for fetching
    headers: { "Content-Type": "application/json" },
  });

  if (response.status === 404 || response.status === 204) {
    // No content or not found, means no summary exists for this document/chapter
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Try to parse error message
    throw new Error(
      errorData.error ||
        `Failed to fetch summary: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (data.success && data.summary) {
    return data.summary as Summary;
  } else {
    throw new Error(data.error || "No summary data received in response.");
  }
};

// Function to generate a new summary
const createSummaryApi = async (payload: {
  content: string;
  documentId: string;
  chapterId: string | null;
}): Promise<Summary> => {
  const response = await fetch("/api/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        `Failed to generate summary: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (data.success && data.summary) {
    return data.summary as Summary;
  } else {
    throw new Error(
      data.error || "Failed to generate summary: No summary in response."
    );
  }
};

export function SummaryPanel({ document }: SummaryPanelProps) {
  const queryClient = useQueryClient();

  // selectedChapter is fixed to "all", so we always work with the full document summary
  const selectedChapter = "all";
  const chapterIdForApi = selectedChapter === "all" ? null : selectedChapter;

  // --- TanStack Query Hooks ---

  // 1. useQuery for fetching the summary
  const {
    data: currentSummary,
    isLoading: isSummaryLoading, // Initial load state
    isFetching: isSummaryFetching, // Background refetching state
    isError: isSummaryFetchError,
    error: summaryFetchError,
    isFetched, // True if the query has completed at least one fetch
  } = useQuery<Summary | null, Error>({
    queryKey: ["summary", document.id, chapterIdForApi], // Unique key for this query
    queryFn: () => fetchSummaryApi(document.id), // Function to call
    enabled: !!document.id, // Only run the query if document.id exists
    staleTime: 5 * 60 * 1000, // Data is considered "fresh" for 5 minutes, no refetch on mount/focus if fresh
    gcTime: 10 * 60 * 1000, // Data stays in cache for 10 minutes after last use
    retry: 1, // Retry failed queries once
  });

  // 2. useMutation for generating a new summary
  const {
    mutate: generateNewSummary,
    isPending: isGeneratingNewSummary, // Mutation in progress state
    isError: isSummaryGenerationError,
    error: summaryGenerationError,
  } = useMutation<
    Summary,
    Error,
    { content: string; documentId: string; chapterId: string | null }
  >({
    mutationFn: createSummaryApi,
    onSuccess: (newSummary, variables) => {
      toast.success("Summary generated successfully!");
      // After successful generation, update the cache directly to reflect the new summary
      // This immediately shows the new summary without a separate refetch
      queryClient.setQueryData(
        ["summary", variables.documentId, variables.chapterId],
        newSummary
      );
      // Alternatively, you could invalidate the query to force a refetch:
      // queryClient.invalidateQueries(["summary", variables.documentId, variables.chapterId]);
    },
    onError: (err) => {
      console.error("Summary generation failed:", err);
      toast.error(`Error generating summary: ${err.message}`);
    },
  });

  // Combined loading and error states for rendering logic
  const isLoading = isSummaryLoading || isGeneratingNewSummary;
  const currentError = isSummaryFetchError
    ? summaryFetchError
    : isSummaryGenerationError
    ? summaryGenerationError
    : null;

  const handleGenerateSummaryClick = useCallback(() => {
    generateNewSummary({
      content: document.content,
      documentId: document.id,
      chapterId: chapterIdForApi,
    });
  }, [document.content, document.id, chapterIdForApi, generateNewSummary]);

  const copyToClipboard = async (summary: Summary) => {
    const text = `# ${summary.title}

## Key Points
${summary.keyPoints.map((point) => `• ${point}`).join("\n")}

## Main Ideas
${summary.mainIdeas.map((idea) => `• ${idea}`).join("\n")}

## Action Items
${summary.actionItems.map((item) => `• ${item}`).join("\n")}

Generated by SmartStudy AI`;

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Summary copied to clipboard!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const getDifficultyColor = (difficulty: Summary["difficulty"]) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "Advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // --- Conditional Renders (Revised with TanStack Query states) ---

  // 1. Loading/Generating in Progress:
  // Show loading skeleton if any API call is active or if summary hasn't been fetched yet.
  if (isLoading || (!isFetched && !currentSummary)) {
    return (
      <div className="h-full flex flex-col ">
        <div className="border-b p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Summary
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Key insights and takeaways from {document.title}
              </p>
            </div>
          </div>
          <Button
            className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600"
            disabled={true}
          >
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            {isSummaryLoading ? "Loading Summary..." : "Generating Summary..."}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/5" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State (after an attempt, and no summary loaded):
  // This triggers if fetching/generating failed and left `currentError` populated and `currentSummary` null.
  if (currentError && !currentSummary) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        <div className="border-b p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Summary
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Key insights and takeaways from {document.title}
              </p>
            </div>
          </div>
          <Button
            onClick={handleGenerateSummaryClick}
            disabled={isLoading}
            className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again / Generate New
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Summary Generation Failed
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {currentError.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. No Summary Available (after a completed initial load attempt, but no summary was found):
  // This state is reached when currentSummary is null, not loading, and initial fetch is done.
  if (!currentSummary && !isLoading && isFetched) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        <div className="border-b p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Summary
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Key insights and takeaways from {document.title}
              </p>
            </div>
          </div>
          <Button
            onClick={handleGenerateSummaryClick}
            disabled={isLoading}
            className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Summary
              </>
            )}
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Summary Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Generate an AI-powered summary to get key insights from this{" "}
              {selectedChapter === "all" ? "document" : "chapter"}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Main Summary Display:
  // This block is reached only if currentSummary is not null,
  // meaning a summary has been successfully loaded or generated.
  if (!currentSummary) {
    // This case should ideally not be reached with the above checks.
    // If it is, it indicates an unexpected state.
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Summary
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Key insights and takeaways from {document.title}
              </p>
            </div>
          </div>

          <Button
            onClick={handleGenerateSummaryClick}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Regenerate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center"
          >
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-300">
                Error Occurred
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                {currentError.message}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {currentSummary.title}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge
                    className={getDifficultyColor(currentSummary.difficulty)}
                  >
                    {currentSummary.difficulty}
                  </Badge>
                  <Badge variant="outline">{currentSummary.readingTime}</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                <span className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Confidence: {currentSummary.confidence}%
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(currentSummary)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Key Points */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  🎯 Key Points
                </h4>
                <ul className="space-y-2">
                  {currentSummary.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Main Ideas */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  💡 Main Ideas
                </h4>
                <ul className="space-y-2">
                  {currentSummary.mainIdeas.map((idea, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {idea}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Items */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  ✅ Next Steps
                </h4>
                <ul className="space-y-2">
                  {currentSummary.actionItems.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2 mr-3" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
