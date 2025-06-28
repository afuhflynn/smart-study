"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Search,
  MoreHorizontal,
  Eye,
  Upload,
  Clock,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

// --- 1) Debounce hook
function useDebounce<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

interface Document {
  id: string;
  title: string;
  type: string;
  fileName: string;
  fileSize: number;
  wordCount: number;
  estimatedReadTime: number;
  progress: number;
  chapters: Array<{ id: string; title: string; startIndex: number }>;
  metadata: { category?: string };
  createdAt: string;
  updatedAt: string;
  category: string;
}

// --- 2) Memoized card — prevents re-renders when props didn’t actually change
const DocumentCard = React.memo(function DocumentCard({
  doc,
}: {
  doc: Document;
}) {
  const categoryColors: Record<string, string> = {
    Technology: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    Science:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Business:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Education:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    General: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  };

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Link href={`/reader/${doc.id}?tab=reader`}>
                <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate">
                  {doc.title}
                </h3>
              </Link>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant="secondary"
                  className={
                    categoryColors[doc.category] || categoryColors.General
                  }
                >
                  {doc.category}
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                  {doc.type}
                </span>
              </div>
            </div>

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
                  <Link href={`/reader/${doc.id}?tab=reader`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Open
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  {doc.wordCount.toLocaleString()} words
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {doc.estimatedReadTime} min
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>{formatFileSize(doc.fileSize)}</span>
                <span className="flex items-center text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(doc.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round(doc.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${doc.progress}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 3) Debounced value
  const debouncedSearch = useDebounce(searchQuery, 500);

  // 4) Keep track of last controller so we can abort
  const abortCtrl = useRef<AbortController>();

  const fetchDocuments = useCallback(async () => {
    if (abortCtrl.current) abortCtrl.current.abort();
    abortCtrl.current = new AbortController();

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        sortBy,
        sortOrder,
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const res = await fetch(`/api/documents?${params}`, {
        signal: abortCtrl.current.signal,
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setDocuments(data.documents || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);
        toast.error("Failed to load documents");
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortBy, sortOrder, debouncedSearch]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const categoryOptions = useMemo(
    () => ["updatedAt", "createdAt", "title", "wordCount"] as const,
    []
  );

  return (
    <div className="h-screen overflow-auto paddingX">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Documents
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage and organize your reading materials
              </p>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Link href="/dashboard">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt === "updatedAt"
                      ? "Last Modified"
                      : opt === "createdAt"
                      ? "Date Created"
                      : opt === "title"
                      ? "Title"
                      : "Word Count"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Documents Grid */}
          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-2 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No documents found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {debouncedSearch
                  ? "Try adjusting your search terms"
                  : "Upload your first document to get started"}
              </p>
              <Button asChild>
                <Link href="/dashboard">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
