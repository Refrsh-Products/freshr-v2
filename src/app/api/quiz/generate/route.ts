import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateQuizFromContent } from "@/lib/openai";
import { extractTextFromPDF, cleanExtractedText } from "@/lib/pdf-processor";

interface UploadedFile {
  fileName: string;
  fileType: string;
  filePath: string;
}

interface GenerateRequestBody {
  files?: UploadedFile[] | null;
  text?: string | null;
  numberOfQuestions?: number;
  difficulty?: "easy" | "medium" | "hard";
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GenerateRequestBody = await request.json();
    const { files, text, numberOfQuestions = 5, difficulty = "medium" } = body;

    let content: string = "";
    const filesToCleanup: string[] = [];

    if (files && files.length > 0) {
      // Process each uploaded file
      const contentParts: string[] = [];

      for (const file of files) {
        // Download file from Supabase Storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("presentation-files")
          .download(file.filePath);

        if (downloadError) {
          console.error("Download error:", downloadError);
          // Clean up any files we've tracked so far
          if (filesToCleanup.length > 0) {
            await supabase.storage
              .from("presentation-files")
              .remove(filesToCleanup);
          }
          return NextResponse.json(
            { error: `Failed to retrieve file: ${file.fileName}` },
            { status: 400 },
          );
        }

        filesToCleanup.push(file.filePath);

        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let fileContent: string;

        if (file.fileType === "application/pdf") {
          const rawText = await extractTextFromPDF(buffer);
          fileContent = cleanExtractedText(rawText);
        } else if (file.fileType === "text/plain") {
          fileContent = buffer.toString("utf-8");
        } else {
          continue; // Skip unsupported file types
        }

        if (fileContent.trim()) {
          contentParts.push(
            `--- Content from: ${file.fileName} ---\n${fileContent}`,
          );
        }
      }

      // Clean up all files from storage after processing
      if (filesToCleanup.length > 0) {
        await supabase.storage
          .from("presentation-files")
          .remove(filesToCleanup);
      }

      content = contentParts.join("\n\n");
    } else if (text && text.trim()) {
      content = text.trim();
    } else {
      return NextResponse.json(
        { error: "Please provide either files or text content." },
        { status: 400 },
      );
    }

    if (content.length < 100) {
      return NextResponse.json(
        {
          error:
            "Content is too short. Please provide more content to generate meaningful questions.",
        },
        { status: 400 },
      );
    }

    // Limit content length to avoid token limits
    const maxContentLength = 30000; // Increased for multiple files
    if (content.length > maxContentLength) {
      content = content.substring(0, maxContentLength);
    }

    // Generate quiz using OpenAI
    const quiz = await generateQuizFromContent(
      content,
      numberOfQuestions,
      difficulty,
    );

    // Generate a unique ID for the quiz
    const quizId = crypto.randomUUID();

    return NextResponse.json({
      success: true,
      quiz: {
        id: quizId,
        ...quiz,
        difficulty,
        topic: quiz.title,
        description: `A ${difficulty} difficulty quiz with ${numberOfQuestions} questions`,
        createdAt: new Date().toISOString(),
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate quiz",
      },
      { status: 500 },
    );
  }
}
