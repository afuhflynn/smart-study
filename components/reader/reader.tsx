"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DocumentViewer } from "./document-viewer";
import { SummaryPanel } from "./summary-panel";
import { QuizPanel } from "./quiz-panel";
import { AudioPlayer } from "./audio-player";
import {
  BookOpen,
  Headphones,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Menu,
} from "lucide-react";
import Link from "next/link";

interface ReaderProps {
  documentId: string;
  document?: any;
}

type ViewMode = "reader" | "summary" | "quiz";

export function Reader({ documentId, document: propDocument }: ReaderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("reader");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const [document, setDocument] = useState(propDocument);

  // Update document when prop changes
  useEffect(() => {
    if (propDocument) {
      setDocument(propDocument);
    }
  }, [propDocument]);

  // Update reading progress
  useEffect(() => {
    if (document && currentChapter >= 0) {
      const updateProgress = async () => {
        try {
          const chapterProgress =
            ((currentChapter + 1) / document.chapters.length) * 100;
          await fetch(`/api/documents/${documentId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              progress: chapterProgress,
            }),
          });
        } catch (error) {
          console.error("Failed to update progress:", error);
        }
      };

      // Debounce progress updates
      const timeoutId = setTimeout(updateProgress, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [documentId, document, currentChapter]);

  const viewModeButtons = [
    { mode: "reader" as ViewMode, icon: BookOpen, label: "Reader" },
    { mode: "summary" as ViewMode, icon: Sparkles, label: "Summary" },
    { mode: "quiz" as ViewMode, icon: MessageSquare, label: "Quiz" },
  ];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleWordHighlight = (wordIndex: number) => {
    setHighlightedWordIndex(wordIndex);
  };

  if (!document) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">
          Document not available
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
      >
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>

          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {document.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chapter {currentChapter + 1} of {document.chapters.length} •{" "}
              {document.estimatedReadTime} min read
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Selector */}
          <div className="hidden md:flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {viewModeButtons.map(({ mode, icon: Icon, label }) => (
              <motion.div
                key={mode}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className={
                    viewMode === mode
                      ? "bg-white dark:text-white text-black dark:bg-gray-800 shadow-sm"
                      : ""
                  }
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              </motion.div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayPause}
            className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Headphones className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {viewMode === "reader" && (
                <DocumentViewer
                  document={document}
                  currentChapter={currentChapter}
                  onChapterChange={setCurrentChapter}
                  highlightedWordIndex={highlightedWordIndex}
                />
              )}
              {viewMode === "summary" && <SummaryPanel document={document} />}
              {viewMode === "quiz" && <QuizPanel document={document} />}
            </motion.div>
          </div>

          {/* Audio Player */}
          <AudioPlayer
            document={document}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            currentChapter={currentChapter}
            onChapterChange={setCurrentChapter}
            onWordHighlight={handleWordHighlight}
          />
        </div>

        {/* Mobile View Mode Selector */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="md:hidden fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="flex bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-1">
            {viewModeButtons.map(({ mode, icon: Icon, label }) => (
              <motion.div
                key={mode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className={`rounded-full ${
                    viewMode === mode
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="sr-only">{label}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
