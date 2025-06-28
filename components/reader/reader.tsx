"use client";

import { useState, useEffect, Suspense } from "react";
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
import { usePathname, useSearchParams } from "next/navigation";

interface ReaderProps {
  documentId: string;
  document?: any;
}

type ViewMode = "reader" | "summary" | "quiz";

const ReaderComponent = ({
  documentId,
  document: propDocument,
}: ReaderProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [content, setContent] = useState<string>("");
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [document, setDocument] = useState(propDocument);
  const params = useSearchParams();
  const currentTab = params.get("tab");
  const pathName = usePathname();
  console.log(content);

  // Update document when prop changes
  useEffect(() => {
    if (propDocument) {
      setDocument(propDocument);
      setContent(propDocument.content);
    }
  }, [propDocument, setContent]);

  // Update reading progress
  useEffect(() => {
    if (document && currentChapter >= 0) {
      const updateProgress = async () => {
        try {
          const chapterProgress =
            ((currentChapter + 1) / document?.chapters?.length) * 100;
          await fetch(`/api/documents/${documentId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              progress: chapterProgress,
            }),
          });

          // TODO: to be removed
          setCurrentChapter(currentChapter);
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
    <div className="h-screen flex flex-col ">
      {/* Top Navigation */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-4 border-b   shadow-sm"
      >
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>

          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {document?.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Selector */}
          <div className="hidden md:flex  rounded-lg p-1 bg-gray-100 dark:bg-gray-800">
            {viewModeButtons.map(({ mode, icon: Icon, label }) => (
              <motion.div
                key={mode}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={"ghost"}
                  size="sm"
                  className={
                    currentTab?.toLowerCase() === mode.toLowerCase()
                      ? " dark:text-white text-black bg-gray-200 dark:bg-gray-900 shadow-sm"
                      : "hover:bg-gray-200 hover:dark:bg-gray-900"
                  }
                  asChild
                >
                  <Link href={`${pathName}?tab=${mode.toLowerCase()}`}>
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Link>
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
              key={currentTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {currentTab === "reader" && (
                <DocumentViewer
                  document={document}
                  content={document.content}
                />
              )}
              {currentTab === "summary" && <SummaryPanel document={document} />}
              {currentTab === "quiz" && <QuizPanel document={document} />}

              {currentTab !== "reader" &&
                currentTab !== "summary" &&
                currentTab !== "quiz" && (
                  <div className="h-screen flex items-center justify-center">
                    <p className="text-gray-600 dark:text-gray-300">
                      Document not available or invalid tab. Check the tab value
                      in url.
                    </p>
                  </div>
                )}
            </motion.div>
          </div>

          {/* Audio Player */}
          <AudioPlayer
            document={document}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            content={document.content}
          />
        </div>

        {/* Mobile View Mode Selector */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="md:hidden fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="flex rounded-full shadow-lg border  p-1 items-center gap-6">
            {viewModeButtons.map(({ mode, icon: Icon, label }) => (
              <motion.div
                key={mode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-6"
              >
                <Button
                  variant={
                    currentTab?.toLocaleLowerCase() === mode
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  className={`rounded-full ${
                    currentTab?.toLowerCase() === mode.toLowerCase()
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
};

export function Reader({ documentId, document }: ReaderProps) {
  return (
    <Suspense>
      <ReaderComponent documentId={documentId} document={document} />
    </Suspense>
  );
}
