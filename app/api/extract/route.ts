import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { model } from "@/constants/gemini";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Add file size limit check
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    let extractedText = "";

    if (type === "image") {
      // Use Gemini Vision for image OCR

      const imageBuffer = await file.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString("base64");

      if (!imageBase64) {
        throw new Error("Failed to process image data");
      }

      const result = await model.generateContent([
        "Extract all text from this image accurately. Preserve the structure and formatting as much as possible. Return only the extracted text content without any additional comments or formatting.",
        {
          inlineData: {
            data: imageBase64,
            mimeType: file.type,
          },
        },
      ]);

      extractedText = result.response.text();
    } else if (type === "pdf") {
      // Use Gemini for PDF processing (treating as image for now)

      const pdfBuffer = await file.arrayBuffer();
      const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

      if (!pdfBase64) {
        throw new Error("Failed to process PDF data");
      }

      const result = await model.generateContent([
        "Extract all text from this PDF document. Preserve the structure and formatting. Return only the extracted text content.",
        {
          inlineData: {
            data: pdfBase64,
            mimeType: file.type,
          },
        },
      ]);

      extractedText = result.response.text();
    } else if (type === "text") {
      extractedText = await file.text();
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "No text could be extracted from the file" },
        { status: 400 }
      );
    }

    // Generate chapters using Gemin
    const chapterPrompt = `
      Analyze the following text and create a logical chapter structure. 
      Return a JSON array of chapters with descriptive titles and approximate start positions (character indices).
      Make sure the chapters are well-organized and cover the entire document.
      
      Format: [{"id": "1", "title": "Chapter Title", "startIndex": 0}]
      
      Text to analyze:
      ${extractedText.substring(0, 4000)}${
      extractedText.length > 4000 ? "..." : ""
    }
    `;

    const chapterResult = await model.generateContent(chapterPrompt);
    let chapters = [];

    try {
      const chapterText = chapterResult.response.text();
      // Clean the response and extract JSON
      const cleanedText = chapterText.replace(/```json|```/g, "").trim();
      const jsonMatch = cleanedText.match(/\[.*\]/s);
      if (jsonMatch) {
        chapters = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error("Failed to parse chapters:", error);
      // Create default chapters based on content length
      const wordCount = extractedText.split(" ").length;
      if (wordCount > 1000) {
        chapters = [
          { id: "1", title: "Introduction", startIndex: 0 },
          {
            id: "2",
            title: "Main Content",
            startIndex: Math.floor(extractedText.length * 0.2),
          },
          {
            id: "3",
            title: "Conclusion",
            startIndex: Math.floor(extractedText.length * 0.8),
          },
        ];
      } else {
        chapters = [{ id: "1", title: "Full Document", startIndex: 0 }];
      }
    }

    // Save document to database
    const document = await prisma.document.create({
      data: {
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        content: extractedText,
        type: type as "pdf" | "text" | "image",
        fileName: file.name,
        fileSize: file.size,
        wordCount: extractedText.split(" ").length,
        estimatedReadTime: Math.ceil(extractedText.split(" ").length / 250),
        chapters: chapters,
        metadata: {
          originalFileName: file.name,
          extractedAt: new Date().toISOString(),
          processingTime: Date.now() - Date.now(), // Would be actual processing time
          fileType: file.type,
        },
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      documentId: document.id,
      content: extractedText,
      chapters,
      metadata: {
        wordCount: extractedText.split(" ").length,
        estimatedReadTime: Math.ceil(extractedText.split(" ").length / 250),
        fileSize: file.size,
        fileName: file.name,
        title: document.title,
      },
    });
  } catch (error) {
    console.error("Text extraction failed:", error);
    return NextResponse.json(
      { error: "Failed to extract text from file" },
      { status: 500 }
    );
  }
}
