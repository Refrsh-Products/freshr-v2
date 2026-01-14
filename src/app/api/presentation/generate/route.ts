import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePresentationOutline } from "@/lib/openai";
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
    const numberOfSlides =
      parseInt(formData.get("numberOfSlides") as string) || 10;
    const style =
      (formData.get("style") as "professional" | "academic" | "casual") ||
      "professional";

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
            "Content is too short. Please provide more content to generate a meaningful presentation.",
        },
        { status: 400 }
      );
    }

    // Limit content length to avoid token limits
    const maxContentLength = 15000;
    if (content.length > maxContentLength) {
      content = content.substring(0, maxContentLength);
    }

    // Generate presentation using OpenAI
    const presentation = await generatePresentationOutline(
      content,
      numberOfSlides,
      style
    );

    // Generate a unique ID for the presentation
    const presentationId = crypto.randomUUID();

    return NextResponse.json({
      success: true,
      presentation: {
        id: presentationId,
        ...presentation,
        createdAt: new Date().toISOString(),
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Presentation generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate presentation",
      },
      { status: 500 }
    );
  }
}
