import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateQuizFromContent } from "@/lib/openai";
import { extractTextFromPDF, cleanExtractedText } from "@/lib/pdf-processor";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;
    const numberOfQuestions =
      parseInt(formData.get("numberOfQuestions") as string) || 5;
    const difficulty =
      (formData.get("difficulty") as "easy" | "medium" | "hard") || "medium";

    let content: string;

    if (file) {
      // Process uploaded file
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (file.type === "application/pdf") {
        const rawText = await extractTextFromPDF(buffer);
        content = cleanExtractedText(rawText);
      } else if (file.type === "text/plain") {
        content = buffer.toString("utf-8");
      } else {
        return NextResponse.json(
          { error: "Unsupported file type. Please upload a PDF or text file." },
          { status: 400 }
        );
      }
    } else if (text && text.trim()) {
      content = text.trim();
    } else {
      return NextResponse.json(
        { error: "Please provide either a file or text content." },
        { status: 400 }
      );
    }

    if (content.length < 100) {
      return NextResponse.json(
        {
          error:
            "Content is too short. Please provide more content to generate meaningful questions.",
        },
        { status: 400 }
      );
    }

    // Limit content length to avoid token limits
    const maxContentLength = 15000;
    if (content.length > maxContentLength) {
      content = content.substring(0, maxContentLength);
    }

    // Generate quiz using OpenAI
    const quiz = await generateQuizFromContent(
      content,
      numberOfQuestions,
      difficulty
    );

    // Generate a unique ID for the quiz
    const quizId = crypto.randomUUID();

    // Store quiz in Supabase (optional - for persistence)
    // You would need to create a quizzes table in Supabase
    // For now, we'll just return the quiz data

    return NextResponse.json({
      success: true,
      quiz: {
        id: quizId,
        ...quiz,
        difficulty,
        topic: quiz.title, // Use the generated title as topic
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
      { status: 500 }
    );
  }
}
