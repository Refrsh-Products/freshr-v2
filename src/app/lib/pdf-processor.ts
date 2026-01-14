import { PdfReader } from "pdfreader";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const textItems: string[] = [];

    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        // End of file - resolve with combined text
        resolve(textItems.join(" "));
      } else if (item.text) {
        // Accumulate text items
        textItems.push(item.text);
      }
    });
  });
}

export function cleanExtractedText(text: string): string {
  return (
    text
      // Remove excessive whitespace
      .replace(/\s+/g, " ")
      // Remove page numbers and headers/footers (common patterns)
      .replace(/Page \d+ of \d+/gi, "")
      .replace(/^\d+$/gm, "")
      // Trim
      .trim()
  );
}

export async function processUploadedFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (file.type === "application/pdf") {
    const rawText = await extractTextFromPDF(buffer);
    return cleanExtractedText(rawText);
  } else if (file.type === "text/plain") {
    return buffer.toString("utf-8");
  } else {
    throw new Error("Unsupported file type. Please upload a PDF or text file.");
  }
}
