import { jsPDF } from "jspdf";
import { User, Document, QuizResult } from "@prisma/client";
import { prisma } from "./prisma";

interface UserDataExport {
  user: User;
  documents: Document[];
  quizResults: QuizResult[];
  stats: {
    totalDocuments: number;
    totalWords: number;
    averageQuizScore: number;
    totalReadingTime: number;
    joinDate: string;
  };
}

export async function generateUserDataPDF(userId: string): Promise<Buffer> {
  // Fetch all user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
      },
      quizResults: {
        include: {
          document: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Calculate stats
  const stats = {
    totalDocuments: user.documents.length,
    totalWords: user.documents.reduce((sum, doc) => sum + doc.wordCount, 0),
    averageQuizScore:
      user.quizResults.length > 0
        ? user.quizResults.reduce((sum, quiz) => sum + quiz.score, 0) /
          user.quizResults.length
        : 0,
    totalReadingTime: user.documents.reduce(
      (sum, doc) => sum + doc.estimatedReadTime,
      0
    ),
    joinDate: user.createdAt.toLocaleDateString(),
  };

  // Create PDF
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 7;

  // Helper function to add new page if needed
  const checkPage = (requiredSpace = 30) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("SmartStudy Data Export", margin, yPosition);
  yPosition += 15;

  // User Info Section
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Account Information", margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  const userInfo = [
    `Name: ${user.name || "Not provided"}`,
    `Email: ${user.email}`,
    `Member Since: ${stats.joinDate}`,
    `Bio: ${user.bio || "Not provided"}`,
    `Location: ${user.location || "Not provided"}`,
    `Website: ${user.website || "Not provided"}`,
    `Interests: ${
      user.interests.length > 0 ? user.interests.join(", ") : "None specified"
    }`,
  ];

  userInfo.forEach((info) => {
    checkPage();
    doc.text(info, margin, yPosition);
    yPosition += lineHeight;
  });

  yPosition += 10;

  // Reading Statistics
  checkPage(50);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Reading Statistics", margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  const statsInfo = [
    `Total Documents: ${stats.totalDocuments}`,
    `Total Words Read: ${stats.totalWords.toLocaleString()}`,
    `Estimated Reading Time: ${Math.round(stats.totalReadingTime)} minutes`,
    `Average Quiz Score: ${Math.round(stats.averageQuizScore)}%`,
    `Total Quiz Attempts: ${user.quizResults.length}`,
  ];

  statsInfo.forEach((stat) => {
    checkPage();
    doc.text(stat, margin, yPosition);
    yPosition += lineHeight;
  });

  yPosition += 10;

  // Documents Section
  if (user.documents.length > 0) {
    checkPage(50);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Your Documents", margin, yPosition);
    yPosition += 10;

    user.documents.forEach((document, index) => {
      checkPage(25);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${document.title}`, margin, yPosition);
      yPosition += lineHeight;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const docInfo = [
        `Type: ${document.type.toUpperCase()}`,
        `Word Count: ${document.wordCount.toLocaleString()}`,
        `Progress: ${Math.round(document.progress)}%`,
        `Uploaded: ${document.createdAt.toLocaleDateString()}`,
        `Last Read: ${document.updatedAt.toLocaleDateString()}`,
      ];

      docInfo.forEach((info) => {
        checkPage();
        doc.text(`  ${info}`, margin + 5, yPosition);
        yPosition += 5;
      });

      yPosition += 5;
    });
  }

  // Quiz Results Section
  if (user.quizResults.length > 0) {
    checkPage(50);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Quiz Results", margin, yPosition);
    yPosition += 10;

    user.quizResults.slice(0, 20).forEach((quiz, index) => {
      checkPage(20);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Quiz ${index + 1}: ${quiz.document?.title || "Unknown Document"}`,
        margin,
        yPosition
      );
      yPosition += lineHeight;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const quizInfo = [
        `Score: ${Math.round(quiz.score)}% (${quiz.correctAnswers}/${
          quiz.totalQuestions
        })`,
        `Difficulty: ${quiz.difficulty}`,
        `Time Spent: ${Math.round(quiz.timeSpent / 60)} minutes`,
        `Date: ${quiz.createdAt.toLocaleDateString()}`,
      ];

      quizInfo.forEach((info) => {
        checkPage();
        doc.text(`  ${info}`, margin + 5, yPosition);
        yPosition += 5;
      });

      yPosition += 5;
    });

    if (user.quizResults.length > 20) {
      checkPage();
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(
        `... and ${user.quizResults.length - 20} more quiz results`,
        margin,
        yPosition
      );
    }
  }

  // Footer
  doc.addPage();
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("This data export was generated by SmartStudy.", margin, 20);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 30);
  doc.text(
    "For questions about your data, contact flyinnsafuh@gmail.com",
    margin,
    40
  );

  return Buffer.from(doc.output("arraybuffer"));
}
