"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Type,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";

interface Document {
  id: string;
  title: string;
  content: string;
  chapters: { id: string; title: string; startIndex: number }[];
  progress: number;
  wordCount: number;
  estimatedReadTime: number;
}

interface DocumentViewerProps {
  document: Document;
  currentChapter: number;
  onChapterChange: (chapter: number) => void;
  highlightedWordIndex?: number;
}

export function DocumentViewer({
  document,
  currentChapter,
  onChapterChange,
  highlightedWordIndex = -1,
}: DocumentViewerProps) {
  const [fontSize, setFontSize] = useState(16);
  const [readingProgress, setReadingProgress] = useState(document.progress);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingSessionActive, setReadingSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [wordsReadInSession, setWordsReadInSession] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setReadingProgress(Math.min(progress, 100));

      // Track reading progress for analytics
      trackReadingProgress(Math.min(progress, 100));
    }
  }, [document.id, currentChapter]);

  const trackReadingProgress = useCallback(
    async (progress: number) => {
      if (!session?.user) return;

      try {
        const chapter = document.chapters[currentChapter];
        const chapterContent = getCurrentChapterContent();
        const wordsInChapter = chapterContent.split(/\s+/).length;
        const wordsRead = Math.floor((progress / 100) * wordsInChapter);

        await fetch("/api/track-reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: document.id,
            chapterId: chapter.id,
            action: "update",
            progress: progress,
            wordsRead: wordsRead,
          }),
        });
      } catch (error) {
        console.error("Failed to track reading progress:", error);
      }
    },
    [document.id, document.chapters, currentChapter, session]
  );

  // Start reading session when component mounts
  useEffect(() => {
    if (session?.user && !readingSessionActive) {
      startReadingSession();
    }

    return () => {
      if (readingSessionActive) {
        endReadingSession();
      }
    };
  }, [session]);

  const startReadingSession = async () => {
    if (!session?.user) return;

    try {
      const chapter = document.chapters[currentChapter];
      await fetch("/api/track-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          chapterId: chapter.id,
          action: "start",
          progress: readingProgress,
        }),
      });

      setReadingSessionActive(true);
      setSessionStartTime(new Date());
    } catch (error) {
      console.error("Failed to start reading session:", error);
    }
  };

  const endReadingSession = async () => {
    if (!session?.user || !readingSessionActive) return;

    try {
      const chapter = document.chapters[currentChapter];
      await fetch("/api/track-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          chapterId: chapter.id,
          action: "end",
          progress: readingProgress,
          wordsRead: wordsReadInSession,
        }),
      });

      setReadingSessionActive(false);
      setSessionStartTime(null);
      setWordsReadInSession(0);
    } catch (error) {
      console.error("Failed to end reading session:", error);
    }
  };

  const getCurrentChapterContent = () => {
    const chapter = document.chapters[currentChapter];
    const nextChapter = document.chapters[currentChapter + 1];

    const startIndex = chapter.startIndex;
    const endIndex = nextChapter
      ? nextChapter.startIndex
      : document.content.length;

    return document.content.slice(startIndex, endIndex);
  };

  const formatContentWithHighlight = (content: string) => {
    let globalWordIndex = 0;

    return content
      .split("\n")
      .map((line, lineIndex) => {
        if (line.startsWith("# ")) {
          return `<h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">${line.slice(
            2
          )}</h1>`;
        } else if (line.startsWith("## ")) {
          return `<h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100 leading-tight">${line.slice(
            3
          )}</h2>`;
        } else if (line.startsWith("### ")) {
          return `<h3 class="text-xl font-medium mb-3 text-gray-700 dark:text-gray-200 leading-tight">${line.slice(
            4
          )}</h3>`;
        } else if (line.startsWith("- ")) {
          return `<li class="ml-6 mb-2 text-gray-600 dark:text-gray-300 leading-relaxed list-disc">${line.slice(
            2
          )}</li>`;
        } else if (line.trim() === "") {
          return '<div class="mb-4"></div>';
        } else if (line.match(/^\d+\./)) {
          return `<li class="ml-6 mb-2 text-gray-600 dark:text-gray-300 leading-relaxed list-decimal">${line}</li>`;
        } else if (line.startsWith("**") && line.endsWith("**")) {
          return `<p class="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed"><strong class="font-semibold text-gray-800 dark:text-gray-200">${line.slice(
            2,
            -2
          )}</strong></p>`;
        } else {
          // For regular paragraphs, handle word highlighting
          if (line.trim()) {
            const words = line.split(/(\s+)/);

            const highlightedLine = words
              .map((segment) => {
                if (segment.trim() === "") return segment; // Preserve whitespace

                const currentWordIndex = globalWordIndex;
                globalWordIndex++;

                if (currentWordIndex === highlightedWordIndex) {
                  return `<span class="bg-yellow-200 dark:bg-yellow-800 px-1 py-0.5 rounded transition-all duration-300 shadow-sm">${segment}</span>`;
                }
                return segment;
              })
              .join("");

            return `<p class="mb-4 leading-relaxed text-gray-600 dark:text-gray-300">${highlightedLine}</p>`;
          } else {
            return '<div class="mb-2"></div>';
          }
        }
      })
      .join("");
  };

  const navigateChapter = (direction: "prev" | "next") => {
    if (direction === "prev" && currentChapter > 0) {
      onChapterChange(currentChapter - 1);
    } else if (
      direction === "next" &&
      currentChapter < document.chapters.length - 1
    ) {
      onChapterChange(currentChapter + 1);
    }
  };

  // Scroll to highlighted word
  useEffect(() => {
    if (highlightedWordIndex >= 0) {
      const highlightedElement = contentRef.current?.querySelector(
        ".bg-yellow-200, .dark\\:bg-yellow-800"
      );
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [highlightedWordIndex]);

  // Reset scroll position when chapter changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
      setReadingProgress(0);
    }

    // End current session and start new one for new chapter
    if (readingSessionActive) {
      endReadingSession();
      setTimeout(() => startReadingSession(), 100);
    }
  }, [currentChapter]);

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-900">
      {/* Chapter Navigation Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:block w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Chapters
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {document.chapters.length} chapters • {document.estimatedReadTime}{" "}
            min read
          </p>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {document.chapters.map((chapter, index) => (
            <motion.button
              key={chapter.id}
              onClick={() => onChapterChange(index)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ${
                currentChapter === index
                  ? "bg-purple-50 dark:bg-purple-900/20 border-r-2 border-purple-600"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    currentChapter === index
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {chapter.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {index + 1}
                </span>
              </div>
              {currentChapter === index && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="mt-2 h-1 bg-purple-600 rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Reading Controls */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateChapter("prev")}
              disabled={currentChapter === 0}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateChapter("next")}
              disabled={currentChapter === document.chapters.length - 1}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-purple-600" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Type className="h-3 w-3" />
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[40px] text-center">
                {fontSize}px
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Type className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
            <span>Reading Progress</span>
            <span>{Math.round(readingProgress)}%</span>
          </div>
          <Progress value={readingProgress} className="h-2" />
        </div>

        {/* Content Area */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 scroll-smooth"
        >
          <motion.div
            key={currentChapter}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto p-8"
            style={{ fontSize: `${fontSize}px` }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: formatContentWithHighlight(getCurrentChapterContent()),
              }}
              className="prose prose-lg max-w-none leading-relaxed"
            />

            {/* Chapter Navigation at Bottom */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => navigateChapter("prev")}
                disabled={currentChapter === 0}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Chapter
              </Button>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                Chapter {currentChapter + 1} of {document.chapters.length}
              </span>

              <Button
                variant="outline"
                onClick={() => navigateChapter("next")}
                disabled={currentChapter === document.chapters.length - 1}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Next Chapter
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
