"use client";

import { useState } from "react"; // useEffect and isLoading state will be managed by TanStack Query
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Search,
  Trash2,
  ExternalLink,
  Upload,
  Calendar,
  RefreshCw,
  Eye,
} from "lucide-react";

// TanStack Query imports
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner"; // Assuming you have a toast component (e.g., from shadcn/ui)

// Initialize QueryClient outside the component to prevent re-initialization
const queryClient = new QueryClient();

// --- Adjusted Summary Interface based on Prisma model ---
interface Summary {
  id: string;
  title: string;
  // These are JSON[] in Prisma, which typically come as arrays of objects.
  // We'll assume a structure like { point: string } for keyPoints, etc.
  keyPoints: { point: string }[];
  mainIdeas: { idea: string }[];
  actionItems: { item: string }[];
  difficulty: string;
  readingTime: string;
  confidence: number;
  userId: string;
  documentId: string; // Corresponds to uploadId in original UI
  createdAt: string; // Date object from Prisma will be a string in JSON
  updatedAt: string;
}

// --- Helper Functions ---

/**
 * Formats the content from keyPoints, mainIdeas, and actionItems into a single string.
 * This mimics the original `content` field.
 */
const formatSummaryContent = (summary: Summary): string => {
  let content = "";
  if (summary.keyPoints && summary.keyPoints.length > 0) {
    content +=
      "Key Points:\n" + summary.keyPoints.map((kp) => `- ${kp}`).join("\n");
  }
  if (summary.mainIdeas && summary.mainIdeas.length > 0) {
    if (content) content += "\n\n";
    content +=
      "Main Ideas:\n" + summary.mainIdeas.map((mi) => `- ${mi}`).join("\n");
  }
  if (summary.actionItems && summary.actionItems.length > 0) {
    if (content) content += "\n\n";
    content +=
      "Action Items:\n" + summary.actionItems.map((ai) => `- ${ai}`).join("\n");
  }
  return content;
};

const getWordCount = (text: string): number => {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

// --- API Functions for TanStack Query ---

async function fetchSummaries(): Promise<{ summaries: Summary[] }> {
  const res = await fetch("/api/summarize");
  if (!res.ok) {
    if (res.status === 401) {
      // Optionally redirect to login or handle unauthorized state
      throw new Error("Unauthorized: Please log in.");
    }
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch summaries");
  }
  return res.json();
}

// --- Main SummariesPage Component ---
function SummariesPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [summaryToDeleteId, setSummaryToDeleteId] = useState<string | null>(
    null
  ); // Changed name for clarity

  const queryClient = useQueryClient();

  // Query to fetch summaries
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["summaries"],
    queryFn: fetchSummaries,
  });

  async function deleteSummary(id: string): Promise<{ id: string }> {
    const res = await fetch(`/api/summarize/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || `Failed to delete summary with ID: ${id}`
      );
    }
    refetch();
    return res.json();
  }

  // Mutation to delete a summary
  const deleteMutation = useMutation({
    mutationFn: deleteSummary,
    onSuccess: (data) => {
      // Invalidate the 'summaries' query to refetch data
      queryClient.invalidateQueries({ queryKey: ["summaries"] });
      setSummaryToDeleteId(null); // Close the dialog
      toast.success(`Summary "${data.id}" deleted successfully!`);
    },
    onError: (err) => {
      toast.error(`Error deleting summary: ${err.message}`);
    },
  });

  const handleDeleteClick = (id: string) => {
    setSummaryToDeleteId(id);
  };

  const confirmDelete = () => {
    if (summaryToDeleteId) {
      deleteMutation.mutate(summaryToDeleteId);
    }
  };

  const allSummaries = data?.summaries || [];

  const filteredSummaries = allSummaries.filter(
    (summary) =>
      summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatSummaryContent(summary)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-destructive">
          Error: {error?.message || "Failed to load summaries."}
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["summaries"] })
          }
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 paddingX h-screen overflow-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Summaries</h1>
          <p className="text-foreground/70">
            View and manage your AI-generated summaries
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
        <Input
          placeholder="Search summaries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Summaries Grid */}
      {filteredSummaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSummaries.map((summary, index) => {
            const formattedContent = formatSummaryContent(summary);
            const wordCount = getWordCount(formattedContent);

            return (
              <motion.div
                key={summary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div className="flex items-center space-x-1 text-xs text-foreground/50">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(summary.createdAt)}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {summary.title}
                    </CardTitle>
                    <CardDescription>{wordCount} words</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="text-sm text-foreground/70 line-clamp-4">
                      {formattedContent
                        .split("\n")
                        .slice(0, 3) // Only show first 3 lines in card preview
                        .map((line, i) =>
                          line.trim() ? (
                            <p key={i} className="mb-1">
                              {line.trim()}
                            </p>
                          ) : null
                        )}
                    </div>
                  </CardContent>
                  <div className="px-6 pb-6 pt-2 border-t flex justify-between">
                    <div className="space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSummary(summary)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{selectedSummary?.title}</DialogTitle>
                            <DialogDescription>
                              Generated on{" "}
                              {selectedSummary &&
                                formatDate(selectedSummary.createdAt)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4">
                            <div className="prose dark:prose-invert max-w-none">
                              {selectedSummary?.id === summary.id && // Only render content if this is the currently selected summary
                                formatSummaryContent(selectedSummary)
                                  .split("\n")
                                  .map((line, i) =>
                                    line.trim() ? (
                                      <p key={i} className="mb-2">
                                        {line.trim()}
                                      </p>
                                    ) : null
                                  )}
                            </div>
                          </div>
                          <DialogFooter>
                            <Link
                              href={`/reader/${selectedSummary?.documentId}?tab=reader`} // Use documentId
                            >
                              <Button>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Original
                              </Button>
                            </Link>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Link href={`/dashboard/editor/${summary.documentId}`}>
                        {" "}
                        {/* Use documentId */}
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                    {/* Delete Button */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(summary.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 space-y-4">
              <FileText className="h-12 w-12 text-foreground/30 mx-auto" />
              <h3 className="text-xl font-medium">No summaries found</h3>
              <p className="text-foreground/70 max-w-md mx-auto">
                {searchTerm
                  ? `No summaries match "${searchTerm}". Try a different search term.`
                  : "You haven't generated any summaries yet. Upload a textbook page to get started."}
              </p>
              {!searchTerm && (
                <Link href="/dashboard/upload">
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload a Page
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!summaryToDeleteId}
        onOpenChange={() => {
          setSummaryToDeleteId(null);
          deleteMutation.reset(); // Reset mutation state if dialog is closed manually
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete this summary. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSummaryToDeleteId(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Wrap the component with QueryClientProvider
export default function SummariesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SummariesPageContent />
    </QueryClientProvider>
  );
}
