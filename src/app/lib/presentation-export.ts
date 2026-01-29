import PptxGenJS from "pptxgenjs";
import { jsPDF } from "jspdf";

export interface SlideData {
  title: string;
  content: string;
  format: "concise" | "detailed" | "bulletpoint";
}

export interface GeneratedPresentationData {
  id: string;
  title: string;
  subtitle?: string;
  slides: SlideData[];
  estimatedDuration: string;
  createdAt: string;
  userId: string;
}

export type PresentationTheme = "dark" | "white" | "classic" | "professional";

interface ThemeColors {
  primary: string;
  secondary: string;
  text: string;
  background: string;
  accent: string;
  titleText: string;
}

const THEME_COLORS: Record<PresentationTheme, ThemeColors> = {
  dark: {
    primary: "1E293B", // Slate-800
    secondary: "64748B", // Slate-500
    text: "1F2937", // Gray-800
    background: "0F172A", // Slate-900
    accent: "06B6D4", // Cyan-500
    titleText: "FFFFFF", // White for title
  },
  white: {
    primary: "FFFFFF", // White
    secondary: "E5E7EB", // Gray-200
    text: "1F2937", // Gray-800
    background: "FFFFFF", // White
    accent: "3B82F6", // Blue-500
    titleText: "1F2937", // Gray-800 for title
  },
  classic: {
    primary: "1E3A8A", // Blue-900 (Navy)
    secondary: "1E40AF", // Blue-800
    text: "1F2937", // Gray-800
    background: "1E3A8A", // Blue-900
    accent: "FBBF24", // Amber-400 (Gold)
    titleText: "FFFFFF", // White for title
  },
  professional: {
    primary: "2563EB", // Blue-600 (current)
    secondary: "64748B", // Slate-500
    text: "1E293B", // Slate-800
    background: "F1F5F9", // Slate-100
    accent: "8B5CF6", // Violet-500
    titleText: "FFFFFF", // White for title
  },
};

/**
 * Sanitizes a string to be used as a safe filename
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .substring(0, 50);
}

/**
 * Generates a PowerPoint (.pptx) file from presentation data
 */
export async function generatePPTX(
  presentation: GeneratedPresentationData,
  theme: PresentationTheme = "professional",
): Promise<Buffer> {
  const pres = new PptxGenJS();

  // Set presentation metadata
  pres.author = "Freshr";
  pres.company = "Freshr";
  pres.title = presentation.title;
  pres.subject = presentation.subtitle || "";

  // Get theme colors
  const colors = THEME_COLORS[theme];

  // Title Slide
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: colors.primary };

  // Main title
  titleSlide.addText(presentation.title, {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: colors.titleText,
    align: "center",
    valign: "middle",
  });

  // Subtitle (if exists)
  if (presentation.subtitle) {
    titleSlide.addText(presentation.subtitle, {
      x: 0.5,
      y: 3.5,
      w: 9,
      h: 0.8,
      fontSize: 24,
      color: colors.titleText,
      align: "center",
      valign: "middle",
    });
  }

  // Content Slides
  presentation.slides.forEach((slide, index) => {
    const contentSlide = pres.addSlide();

    // Header background bar
    contentSlide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.8,
      fill: { color: colors.primary },
    });

    // Slide number indicator
    contentSlide.addText(`${index + 1} / ${presentation.slides.length}`, {
      x: 8.5,
      y: 0.1,
      w: 1.3,
      h: 0.6,
      fontSize: 12,
      color: colors.titleText,
      align: "right",
      valign: "middle",
    });

    // Slide title - truncate if too long to ensure single line
    const maxTitleLength = 55;
    const slideTitle =
      slide.title.length > maxTitleLength
        ? slide.title.substring(0, maxTitleLength) + "..."
        : slide.title;

    contentSlide.addText(slideTitle, {
      x: 0.5,
      y: 0.1,
      w: 7.5,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: colors.titleText,
      valign: "middle",
      breakLine: false,
    });

    // Slide content
    if (slide.format === "bulletpoint") {
      const bulletPoints = slide.content.split("\n").filter(line => line.trim());
      const bulletData = bulletPoints.map((point) => ({
        text: point.replace(/^-\s*/, ""),
        options: {
          fontSize: 18,
          color: colors.text,
          bullet: { type: "number" as const },
          paraSpaceBefore: 12,
          paraSpaceAfter: 12,
        },
      }));

      contentSlide.addText(bulletData, {
        x: 0.7,
        y: 1.3,
        w: 8.6,
        h: 4.0,
        fontSize: 18,
        color: colors.text,
        lineSpacing: 24,
      });
    } else {
      // Paragraph format (concise or detailed)
      contentSlide.addText(slide.content, {
        x: 0.7,
        y: 1.3,
        w: 8.6,
        h: 4.0,
        fontSize: slide.format === "concise" ? 16 : 14,
        color: colors.text,
        align: "left",
        valign: "top",
      });
    }
  });

  // Summary/Conclusion Slide
  const summarySlide = pres.addSlide();
  summarySlide.background = { color: colors.background };

  summarySlide.addText("Thank You!", {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 1.0,
    fontSize: 44,
    bold: true,
    color: colors.accent,
    align: "center",
    valign: "middle",
  });

  summarySlide.addText("Generated with FRESHR", {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 0.5,
    fontSize: 16,
    color: colors.text,
    align: "center",
    italic: true,
  });

  // Generate and return buffer
  const buffer = await pres.write({ outputType: "nodebuffer" });
  return buffer as Buffer;
}

/**
 * Helper function to convert hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return [r, g, b];
}

/**
 * Generates a PDF file from presentation data
 */
export async function generatePDF(
  presentation: GeneratedPresentationData,
  theme: PresentationTheme = "professional",
): Promise<Buffer> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Get theme colors
  const colors = THEME_COLORS[theme];
  const [primaryR, primaryG, primaryB] = hexToRgb(colors.primary);
  const [textR, textG, textB] = hexToRgb(colors.text);
  const [titleTextR, titleTextG, titleTextB] = hexToRgb(colors.titleText);
  const [secondaryR, secondaryG, secondaryB] = hexToRgb(colors.secondary);
  const [accentR, accentG, accentB] = hexToRgb(colors.accent);

  // Helper function to add wrapped text
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ): number => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + lines.length * lineHeight;
  };

  // Title Page
  pdf.setFillColor(primaryR, primaryG, primaryB);
  pdf.rect(0, 0, pageWidth, 80, "F");

  pdf.setTextColor(titleTextR, titleTextG, titleTextB);
  pdf.setFontSize(32);
  pdf.setFont("helvetica", "bold");
  const titleY = 40;
  pdf.text(presentation.title, pageWidth / 2, titleY, {
    align: "center",
    maxWidth: contentWidth,
  });

  // Subtitle
  if (presentation.subtitle) {
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "normal");
    pdf.text(presentation.subtitle, pageWidth / 2, titleY + 15, {
      align: "center",
      maxWidth: contentWidth,
    });
  }

  // Metadata
  pdf.setFontSize(12);
  pdf.setTextColor(textR, textG, textB);
  const metadataText = `${presentation.slides.length} slides • ${presentation.estimatedDuration}`;
  pdf.text(metadataText, pageWidth / 2, 70, { align: "center" });

  // Reset text color for content
  pdf.setTextColor(textR, textG, textB);

  // Date and info
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.text(
    `Generated on ${new Date(presentation.createdAt).toLocaleDateString()}`,
    margin,
    100,
  );

  // Content Slides
  presentation.slides.forEach((slide, index) => {
    pdf.addPage();

    let yPosition = margin;

    // Slide number header
    pdf.setFillColor(primaryR, primaryG, primaryB);
    pdf.rect(0, 0, pageWidth, 15, "F");
    pdf.setTextColor(titleTextR, titleTextG, titleTextB);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Slide ${index + 1} of ${presentation.slides.length}`, margin, 10);

    yPosition = 25;

    // Slide title
    pdf.setTextColor(accentR, accentG, accentB);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    yPosition = addWrappedText(slide.title, margin, yPosition, contentWidth, 8);
    yPosition += 10;

    // Divider line
    pdf.setDrawColor(secondaryR, secondaryG, secondaryB);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Slide content
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(textR, textG, textB);

    if (slide.format === "bulletpoint") {
      const bulletPoints = slide.content.split("\n").filter(line => line.trim());
      bulletPoints.forEach((point, i) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFont("helvetica", "bold");
        pdf.text(`${i + 1}.`, margin, yPosition);

        pdf.setFont("helvetica", "normal");
        const bulletText = pdf.splitTextToSize(point.replace(/^-\s*/, ""), contentWidth - 10);
        pdf.text(bulletText, margin + 7, yPosition);

        yPosition += bulletText.length * 6 + 6;
      });
    } else {
      // Paragraph format
      const contentLines = pdf.splitTextToSize(slide.content, contentWidth);
      pdf.text(contentLines, margin, yPosition);
      yPosition += contentLines.length * 6;
    }
  });

  // Footer on all pages (except title page)
  const totalPages = pdf.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(secondaryR, secondaryG, secondaryB);
    pdf.text("Generated with FRESHR", pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
  }

  // Return buffer
  return Buffer.from(pdf.output("arraybuffer"));
}

/**
 * Gets the sanitized filename for a presentation
 */
export function getExportFilename(
  presentation: GeneratedPresentationData,
  format: "pptx" | "pdf",
): string {
  const sanitizedTitle = sanitizeFilename(presentation.title) || "presentation";
  return `${sanitizedTitle}.${format}`;
}
