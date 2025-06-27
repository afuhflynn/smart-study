"use client";

import { useState, useEffect } from "react";
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

interface Summary {
  id: string;
  title: string;
  content: string;
  date: string;
  uploadId: string;
  wordCount: number;
}

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [summaryToDelete, setSummaryToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // In a real app, we'd fetch summaries from API
  // For demo, we'll create mock data
  useEffect(() => {
    const fetchData = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData: Summary[] = [
        {
          id: "1",
          title: "Photosynthesis Process",
          content:
            "- Photosynthesis is the process where plants convert light energy into chemical energy.\n- Chlorophyll captures sunlight and uses it to transform carbon dioxide and water into glucose and oxygen.\n- Plants use glucose for energy and growth while releasing oxygen as a byproduct.\n- The process primarily takes place in the chloroplasts of plant cells.\n- Key factors affecting photosynthesis rates include light intensity, carbon dioxide concentration, and temperature.",
          date: "2025-03-15T10:30:00",
          uploadId: "upload-1",
          wordCount: 85,
        },
        {
          id: "2",
          title: "Cell Structure and Function",
          content:
            "- Cells are the basic units of life and contain various organelles with specific functions.\n- The nucleus controls cell activities and contains the cell's DNA.\n- Mitochondria are the powerhouses of the cell, producing energy through cellular respiration.\n- The cell membrane regulates what enters and exits the cell.\n- Plant cells have additional structures like cell walls and chloroplasts that animal cells lack.",
          date: "2025-03-14T14:45:00",
          uploadId: "upload-2",
          wordCount: 92,
        },
        {
          id: "3",
          title: "Newton's Laws of Motion",
          content:
            "- Newton's First Law states that objects at rest stay at rest and objects in motion stay in motion unless acted upon by an external force.\n- Newton's Second Law describes the relationship between force, mass, and acceleration (F = ma).\n- Newton's Third Law states that for every action, there is an equal and opposite reaction.\n- These laws form the foundation of classical mechanics and explain everyday motion.\n- Understanding these laws helps predict and analyze the movement of objects in our world.",
          date: "2025-03-13T09:15:00",
          uploadId: "upload-3",
          wordCount: 98,
        },
      ];

      setSummaries(mockData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleDelete = (id: string) => {
    setSummaries((prevSummaries) =>
      prevSummaries.filter((summary) => summary.id !== id)
    );
    setSummaryToDelete(null);
  };

  const filteredSummaries = summaries.filter(
    (summary) =>
      summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
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
        <Link href="/dashboard">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            New Upload
          </Button>
        </Link>
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
          {filteredSummaries.map((summary, index) => (
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
                      <span>{formatDate(summary.date)}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {summary.title}
                  </CardTitle>
                  <CardDescription>{summary.wordCount} words</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-sm text-foreground/70 line-clamp-4">
                    {summary.content
                      .split("\n")
                      .slice(0, 3)
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
                              formatDate(selectedSummary.date)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          <div className="prose dark:prose-invert max-w-none">
                            {selectedSummary?.content
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
                            href={`/dashboard/editor/${selectedSummary?.uploadId}`}
                          >
                            <Button>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Original
                            </Button>
                          </Link>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Link href={`/dashboard/editor/${summary.uploadId}`}>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
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
        open={!!summaryToDelete}
        onOpenChange={() => setSummaryToDelete(null)}
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
            <Button variant="outline" onClick={() => setSummaryToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => summaryToDelete && handleDelete(summaryToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
