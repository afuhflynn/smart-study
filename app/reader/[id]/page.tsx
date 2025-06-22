"use client";

import { useState, useEffect } from "react";
import { Reader } from "@/components/reader/reader";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ReaderPage() {
  const params = useParams();
  const documentId = params.id as string;
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Document not found");
          }
          throw new Error("Failed to load document");
        }

        const data = await response.json();
        setDocument(data.document);
      } catch (error) {
        console.error("Failed to fetch document:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load document"
        );
        toast.error("Failed to load document");
      } finally {
        setIsLoading(false);
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  if (isLoading) {
    return (
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="flex items-center justify-center h-screen">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Loading document...
                </p>
              </div>
            </main>
          </div>
        </ThemeProvider>
      </AuthProvider>
    );
  }

  if (error || !document) {
    return (
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {error || "Document not found"}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  The document you're looking for doesn't exist or you don't
                  have access to it.
                </p>
                <a
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  ← Back to Dashboard
                </a>
              </div>
            </main>
          </div>
        </ThemeProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <main>
            <Reader documentId={documentId} document={document} />
          </main>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}
