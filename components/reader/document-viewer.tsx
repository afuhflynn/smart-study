"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Profiler,
} from "react";
import throttle from "lodash.throttle";
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
  content: string;
}

export function DocumentViewer({ document, content }: DocumentViewerProps) {
  const [readingProgress, setReadingProgress] = useState(document?.progress);
  const contentRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Basic formatting without highlight
  const formattedHTML = useMemo(() => {
    return (
      content &&
      content
        .split("\n")
        .map((line) => {
          if (line.startsWith("# ")) {
            return `<h1 class=\"text-3xl font-bold mb-6 text-gray-900 dark:text-white leading-tight\">${line.slice(
              2
            )}</h1>`;
          } else if (line.startsWith("## ")) {
            return `<h2 class=\"text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100 leading-tight\">${line.slice(
              3
            )}</h2>`;
          } else if (line.startsWith("### ")) {
            return `<h3 class=\"text-xl font-medium mb-3 text-gray-700 dark:text-gray-200 leading-tight\">${line.slice(
              4
            )}</h3>`;
          } else if (line.startsWith("- ")) {
            return `<li class=\"ml-6 mb-2 text-gray-600 dark:text-gray-300 leading-relaxed list-disc\">${line.slice(
              2
            )}</li>`;
          } else if (line.trim() === "") {
            return '<div class="mb-4"></div>';
          } else if (/^\d+\./.test(line)) {
            return `<li class=\"ml-6 mb-2 text-gray-600 dark:text-gray-300 leading-relaxed list-decimal\">${line}</li>`;
          } else if (line.startsWith("**") && line.endsWith("**")) {
            return `<p class=\"mb-4 text-gray-600 dark:text-gray-300 leading-relaxed\"><strong class=\"font-semibold text-gray-800 dark:text-gray-200\">${line.slice(
              2,
              -2
            )}</strong></p>`;
          } else {
            return `<p class=\"mb-4 leading-relaxed text-gray-600 dark:text-gray-300\">${line}</p>`;
          }
        })
        .join("")
    );
  }, [content]);

  // API call to track progress
  const trackReadingProgress = useCallback(
    async (progress: number) => {
      if (!session?.user) return;
      const totalWords = content.split(/\s+/).length;
      const wordsRead = Math.floor(((progress / 100) * totalWords) as number);
      try {
        await fetch("/api/track-reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: document?.id,
            action: "update",
            progress,
            wordsRead,
          }),
        });
      } catch (err) {
        console.error("Tracking error", err);
      }
    },
    [session?.user, document?.id, document?.chapters, content]
  );

  // Throttle network calls
  const throttledTrack = useRef(
    throttle((p: number) => trackReadingProgress(p), 2000)
  ).current;

  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const progress = Math.min(
      (scrollTop / (scrollHeight - clientHeight)) * 100,
      100
    );
    setReadingProgress(progress);
    throttledTrack(progress);
  }, [throttledTrack]);

  // Start/end session only once
  useEffect(() => {
    let active = false;
    if (session?.user) {
      active = true;
      fetch("/api/track-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          action: "start",
          progress: readingProgress,
        }),
      }).catch(console.error);
    }
    return () => {
      if (active) {
        fetch("/api/track-reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: document.id,
            action: "end",
            progress: readingProgress,
          }),
        }).catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    setReadingProgress(0);
  }, [content]);

  return (
    <Profiler id="DocumentViewer" onRender={() => {}}>
      <div className="h-full flex ">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Area */}
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto  scroll-smooth"
          >
            <motion.div
              key={document?.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto p-8"
            >
              <div
                dangerouslySetInnerHTML={{ __html: formattedHTML as string }}
                className="prose prose-lg max-w-none leading-relaxed"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </Profiler>
  );
}
