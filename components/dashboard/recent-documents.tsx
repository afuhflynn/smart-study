"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Clock,
  BookOpen,
  MoreHorizontal,
  Trash2,
  Eye,
  Edit,
  Loader,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface Document {
  id: string;
  title: string;
  type: string;
  fileName: string;
  fileSize: number;
  wordCount: number;
  estimatedReadTime: number;
  progress: number;
  chapters: Array<{
    id: string;
    title: string;
    startIndex: number;
  }>;
  metadata: {
    category?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastRead: string;
  category: string;
}

const categoryColors: Record<string, string> = {
  Technology: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Science: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Business:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Education:
    "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  General: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
};

export function RecentDocuments({
  isUploadComplete,
}: {
  isUploadComplete: boolean;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [documentToDeleteId, setDocumentToDeleteId] = useState("");

  const fetchDocuments = async () => {
    try {
      const response = await fetch(
        "/api/documents?limit=6&sortBy=updatedAt&sortOrder=desc"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();
      return data.documents;
    } catch (error: Error | any) {
      console.error("Failed to fetch documents:", error);
      setError(error.message);
      toast.error("Failed to load documents");
    }
  };
  const {
    data: documents,
    isPending,
    isError,
    refetch,
  } = useQuery<Document[]>({
    queryKey: ["recent-document"],
    queryFn: fetchDocuments,
    staleTime: Infinity,
    gcTime: 0,
  });

  useEffect(() => {
    refetch();
  }, [isUploadComplete]);

  const handleDeleteDocument = async (documentId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setDocumentToDeleteId(documentId);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      refetch();
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchDocuments} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No documents yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Upload your first document to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Documents
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/documents">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/reader/${doc.id}`}>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer truncate">
                        {doc.title}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={
                          categoryColors[doc.category] ||
                          categoryColors["General"]
                        }
                      >
                        {doc.category}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {doc.wordCount.toLocaleString()} words •{" "}
                        {formatFileSize(doc.fileSize)} •{" "}
                        {doc.type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {isDeleting && documentToDeleteId === doc.id ? (
                    <div className="text-red-500 text-xs flex items-center gap-2">
                      Deleting <Loader className="animate-spin" />
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/reader/${doc.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Open
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleDeleteDocument(doc.id, doc.title)
                          }
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {doc.estimatedReadTime} min read
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(doc.lastRead), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(doc.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${doc.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
