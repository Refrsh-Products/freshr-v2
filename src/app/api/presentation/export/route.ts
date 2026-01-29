import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generatePPTX,
  generatePDF,
  getExportFilename,
  type GeneratedPresentationData,
  type PresentationTheme,
} from "@/lib/presentation-export";

interface ExportRequestBody {
  presentation: GeneratedPresentationData;
  format: "pptx" | "pdf";
  theme?: PresentationTheme;
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

    const body: ExportRequestBody = await request.json();
    const { presentation, format, theme = "professional" } = body;

    // Validate request body
    if (!presentation) {
      return NextResponse.json(
        { error: "Presentation data is required" },
        { status: 400 }
      );
    }

    if (!format || !["pptx", "pdf"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Must be 'pptx' or 'pdf'" },
        { status: 400 }
      );
    }

    // Validate presentation structure
    if (!presentation.title || !presentation.slides || !Array.isArray(presentation.slides)) {
      return NextResponse.json(
        { error: "Invalid presentation data structure" },
        { status: 400 }
      );
    }

    if (presentation.slides.length === 0) {
      return NextResponse.json(
        { error: "Presentation must have at least one slide" },
        { status: 400 }
      );
    }

    // Generate the file based on format
    let fileBuffer: Buffer;
    let contentType: string;

    if (format === "pptx") {
      fileBuffer = await generatePPTX(presentation, theme);
      contentType =
        "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    } else {
      fileBuffer = await generatePDF(presentation, theme);
      contentType = "application/pdf";
    }

    // Get sanitized filename
    const filename = getExportFilename(presentation, format);

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(fileBuffer);

    // Return the file as a download
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Presentation export error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to export presentation",
      },
      { status: 500 }
    );
  }
}
