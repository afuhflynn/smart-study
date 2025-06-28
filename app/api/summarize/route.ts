import { NextRequest, NextResponse } from "next/server";
import { MAX_CHARACTER_INPUT_LENGTH } from "@/constants/constants";
import { model } from "@/constants/gemini";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  // Authenticate user
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse JSON with clear error handling
  let body: { content?: string; documentId?: string; title?: string };
  try {
    body = await request.json();
  } catch (err) {
    console.error("Invalid JSON payload:", err);
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { content, documentId, title } = body;
  if (!content) {
    return NextResponse.json({ error: "No content provided" }, { status: 400 });
  }

  // Fallback summary if API key missing
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.error("Google Gemini API key not configured");
    const fallbackSummary = {
      id: `summary-${Date.now()}`,
      title: title || "Content Summary",
      keyPoints: [
        "Key information extracted from the content",
        "Important details and concepts identified",
        "Main arguments or findings presented",
        "Supporting evidence or examples mentioned",
      ],
      mainIdeas: [
        "Primary theme of the content",
        "Central argument or hypothesis",
        "Core methodology or approach",
      ],
      actionItems: [
        "Review the main concepts discussed",
        "Consider practical applications",
        "Explore related topics for deeper understanding",
      ],
      difficulty: "Intermediate",
      readingTime: "3 min summary",
      confidence: 70,
      createdAt: new Date().toISOString(),
      documentId,
    };

    return NextResponse.json({
      success: true,
      summary: fallbackSummary,
      warning: "Using fallback summary - API key not configured",
    });
  }

  // Truncate content
  const truncatedContent =
    content.length > MAX_CHARACTER_INPUT_LENGTH
      ? content.slice(0, MAX_CHARACTER_INPUT_LENGTH) + "..."
      : content;

  // Build prompt
  const prompt = `
Please analyze the following text and return ONLY a valid JSON object:
{
  "title": "<string>",
  "keyPoints": ["<string>"...],
  "mainIdeas": ["<string>"...],
  "actionItems": ["<string>"...],
  "difficulty": "Beginner|Intermediate|Advanced",
  "readingTime": "<string>",
  "confidence": <number 60-100>
}

Text:
${truncatedContent}
`;

  // Call Gemini
  let aiResponse: string;
  try {
    const result = await model.generateContent(prompt);
    aiResponse = await result.response.text();
  } catch (e) {
    console.error("Gemini API error:", e);
    aiResponse = "";
  }
  console.log("AI response:", aiResponse);

  // Parse AI JSON
  let summary: any;
  try {
    const cleaned = aiResponse.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found");
    summary = JSON.parse(match[0]);
  } catch (err) {
    console.error("Failed to parse AI response:", err);
    summary = {
      title: title || "AI-Generated Summary",
      keyPoints: [
        "Main concept extracted from the content",
        "Secondary important point identified",
        "Supporting detail or example provided",
        "Key insight or conclusion drawn",
      ],
      mainIdeas: [
        "Core theme of the content",
        "Underlying principle or concept",
        "Key relationship or connection",
      ],
      actionItems: [
        "Review and reflect on the key points",
        "Apply the main concepts in practice",
        "Research related topics for deeper understanding",
      ],
      difficulty: "Intermediate",
      readingTime: "4 min summary",
      confidence: 75,
    };
  }

  // check if quiz for document already exists, delete and create new one
  const documentExists = await prisma.summary.findFirst({
    where: {
      documentId,
      userId: session.user.id,
    },
  });

  if (documentExists) {
    await prisma.summary.delete({
      where: {
        documentId,
      },
    });
  }

  // Save to DB
  const newSummary = await prisma.summary.create({
    data: {
      title: summary.title,
      keyPoints: summary.keyPoints,
      mainIdeas: summary.mainIdeas,
      actionItems: summary.actionItems,
      difficulty: summary.difficulty,
      readingTime: summary.readingTime,
      confidence: summary.confidence,
      userId: session.user.id,
      documentId: documentId as string,
    },
  });

  return NextResponse.json({ success: true, summary: newSummary });
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summaries = await prisma.summary.findMany({
    where: { userId: session.user.id },
  });
  return NextResponse.json({ success: true, summaries });
}
