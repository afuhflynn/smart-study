"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { useToast } from "@/hooks/use-toast";
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

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [extractedText, setExtractedText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("text");
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [quiz, setQuiz] = useState<any[] | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});

  // Get extracted text from local storage (in a real app, we'd fetch from API)
  useEffect(() => {
    const storedText = localStorage.getItem("extractedText");
    if (storedText) {
      setExtractedText(storedText);
    } else {
      // Mock data for demo
      setExtractedText(
        "The process of photosynthesis in plants involves the conversion of light energy into chemical energy. Chlorophyll, the green pigment in plants, captures light energy from the sun. This energy is used to convert carbon dioxide and water into glucose and oxygen. The glucose is used by the plant for energy and growth, while oxygen is released into the atmosphere as a byproduct. Factors affecting the rate of photosynthesis include light intensity, carbon dioxide concentration, and temperature. Photosynthesis occurs primarily in the chloroplasts of plant cells."
      );
    }
  }, []);

  const generateSummary = async () => {
    setLoading(true);

    try {
      // In a real app, we'd call our API
      // For demo, simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock summary response
      const mockSummary = `
- Photosynthesis is the process where plants convert light energy into chemical energy.
- Chlorophyll captures sunlight and uses it to transform carbon dioxide and water into glucose and oxygen.
- Plants use glucose for energy and growth while releasing oxygen as a byproduct.
- The process primarily takes place in the chloroplasts of plant cells.
- Key factors affecting photosynthesis rates include light intensity, carbon dioxide concentration, and temperature.
      `;

      setSummary(mockSummary);
      setActiveTab("summary");

      toast({
        title: "Summary Generated",
        description: "Your AI-powered summary is ready!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    setIsGeneratingQuiz(true);

    try {
      // In a real app, we'd call our API
      // For demo, simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Mock quiz response
      const mockQuiz = [
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
          question:
            "Which pigment in plants captures light energy from the sun?",
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

      setQuiz(mockQuiz);
      setActiveTab("quiz");

      toast({
        title: "Quiz Generated",
        description: "Your quiz questions are ready!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleAnswerSelection = (
    questionIndex: number,
    answerIndex: number
  ) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const calculateScore = () => {
    if (!quiz) return 0;

    let correct = 0;
    quiz.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctIndex) {
        correct++;
      }
    });

    return correct;
  };

  const submitQuiz = () => {
    const score = calculateScore();
    const total = quiz?.length || 0;

    toast({
      title: `Quiz Score: ${score}/${total}`,
      description: `You answered ${score} out of ${total} questions correctly.`,
    });

    // In a real app, we'd save the results to the database
    // Then navigate to a results page
    router.push(`/dashboard/quiz/${params.uploadId}/results`);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
  };

  return (
    <div className="space-y-6 paddingX">
      <div>
        <h1 className="text-3xl font-bold mb-2">Text Editor</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Review the extracted text
        </p>
      </div>

      <div className="flex items-center flex-col gap-6">
        <Card className="h-full flex flex-col w-full">
          <CardHeader>
            <CardTitle>OCR Text</CardTitle>
            <CardDescription>
              Review and edit the extracted text if needed
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <Textarea
              className="min-h-[400px] resize-none h-full"
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="The extracted text will appear here. You can edit it if needed."
            />
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            {/* <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Original
            </Button> */}
            <Button size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
