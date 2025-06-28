"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import TanStack Query hooks

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Loader2,
  FileQuestion,
  ChevronRight,
  RotateCcw,
  Check,
  HelpCircle,
  Save,
} from "lucide-react";
import { toast } from "sonner";

// Define the Document interface based on your Prisma schema
interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  fileName: string;
  fileSize: number;
  wordCount: number;
  estimatedReadTime: number;
  progress: number;
  chapters?: any; // Use more specific type if known
  metadata?: any; // Use more specific type if known
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Mock AI responses (moved outside the component for better performance)
const MOCK_SUMMARY_RESPONSE = `
Photosynthesis is the process where plants convert light energy into chemical energy.
Chlorophyll captures sunlight and uses it to transform carbon dioxide and water into glucose and oxygen.
Plants use glucose for energy and growth while releasing oxygen as a byproduct.
The process primarily takes place in the chloroplasts of plant cells.
Key factors affecting photosynthesis rates include light intensity, carbon dioxide concentration, and temperature.
`;

const MOCK_QUIZ_RESPONSE = [
  {
    question: "What does photosynthesis convert light energy into?",
    options: [
      "Thermal energy",
      "Chemical energy",
      "Mechanical energy",
      "Electrical energy",
    ],
    correctIndex: 1,
  },
  {
    question: "Which pigment in plants captures light energy from the sun?",
    options: ["Melanin", "Hemoglobin", "Chlorophyll", "Carotene"],
    correctIndex: 2,
  },
  {
    question: "What are the two main products of photosynthesis?",
    options: [
      "Glucose and carbon dioxide",
      "Oxygen and water",
      "Glucose and oxygen",
      "Water and carbon dioxide",
    ],
    correctIndex: 2,
  },
  {
    question: "Where does photosynthesis primarily occur in plant cells?",
    options: ["Mitochondria", "Nucleus", "Cell membrane", "Chloroplasts"],
    correctIndex: 3,
  },
  {
    question: "Which factor does NOT affect the rate of photosynthesis?",
    options: [
      "Light intensity",
      "Carbon dioxide concentration",
      "Plant species",
      "Temperature",
    ],
    correctIndex: 2,
  },
];

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient(); // Initialize QueryClient

  const documentId = params.uploadId as string;

  // Local state for editor and AI features
  const [extractedText, setExtractedText] = useState<string>("");
  const [originalExtractedText, setOriginalExtractedText] =
    useState<string>("");
  const [summary, setSummary] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("text");
  const [quiz, setQuiz] = useState<any[] | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});

  // 1. Fetch Document Content (useQuery) - Updated for v5 object syntax
  const {
    data: documentData,
    isLoading: loadingDocument,
    isError: isDocumentError,
    error: documentError,
    refetch,
  } = useQuery<Document, Error>({
    queryKey: ["document", documentId], // queryKey is now a property
    queryFn: async () => {
      // queryFn is now a property
      if (!documentId) {
        throw new Error("Document ID is missing.");
      }
      const response = await fetch(`/api/documents/${documentId}`); // Your API endpoint
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
      const result = await response.json();
      return result.document;
    },
    enabled: !!documentId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (documentData) {
      setExtractedText(documentData.content);
      setOriginalExtractedText(documentData.content);
    }
  }, [documentData]);

  // 2. Save Changes Mutation (useMutation) - Updated for v5 object syntax
  const { mutate: saveDocumentChanges, isPending: isSaving } = useMutation<
    Document,
    Error,
    { id: string; content: string }
  >({
    mutationFn: async ({ id, content }) => {
      // mutationFn is now a property
      const response = await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
      refetch();
      return response.json();
    },
    onSuccess: (updatedDoc) => {
      setOriginalExtractedText(updatedDoc.content);
      // Invalidate queries also uses object syntax in v5
      queryClient.invalidateQueries({ queryKey: ["document", updatedDoc.id] });
      toast.success("Changes saved successfully!");
    },
    onError: (err) => {
      toast.error(`Error saving changes: ${err.message}`);
    },
  });

  const resetToOriginal = useCallback(() => {
    setExtractedText(originalExtractedText);
    toast.success("Reset to original text");
  }, [originalExtractedText, toast]);

  if (loadingDocument) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
        <p className="ml-2 text-lg text-neutral-500">Loading document...</p>
      </div>
    );
  }

  if (isDocumentError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FileQuestion className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-600">
          Error Loading Document
        </h2>
        <p className="text-neutral-500 mt-2">{documentError?.message}</p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["document", documentId],
            })
          }
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 paddingX flex-1 h-full overflow-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {documentData?.title ? documentData.title : "Text Editor"}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Review and modify the extracted text
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="h-full flex flex-col w-full">
          <CardHeader>
            <CardTitle>OCR Text</CardTitle>
            <CardDescription>
              Review and edit the extracted text if needed
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <Textarea
              className="min-h-[400px] resize-y h-full"
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="The extracted text will appear here. You can edit it if needed."
            />
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToOriginal}
              disabled={extractedText === originalExtractedText || isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Original
            </Button>
            <Button
              size="sm"
              onClick={() =>
                saveDocumentChanges({ id: documentId, content: extractedText })
              }
              disabled={
                isSaving ||
                extractedText === originalExtractedText ||
                !documentId
              }
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
