import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeneratedQuiz, GeneratedPresentation } from "./openai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateQuizFromContent(
  content: string,
  numberOfQuestions: number = 5,
  difficulty: "easy" | "medium" | "hard" = "medium",
): Promise<GeneratedQuiz> {
  const difficultyPrompt = {
    easy: "simple and straightforward questions suitable for beginners",
    medium: "moderately challenging questions that test understanding",
    hard: "complex questions that require deep understanding and critical thinking",
  };

  const prompt = `You are an expert quiz creator. Based on the following content, generate a quiz with exactly ${numberOfQuestions} multiple-choice questions.

Content:
${content}

Requirements:
1. Create ${difficultyPrompt[difficulty]}
2. Each question should have exactly 4 options (A, B, C, D)
3. Only one option should be correct
4. Provide a brief explanation for the correct answer
5. Questions should cover different aspects of the content
6. Make sure questions are clear and unambiguous

Respond in the following JSON format only (no markdown, no code blocks):
{
  "title": "Quiz title based on the content",
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Important: correctAnswer should be the index (0-3) of the correct option.`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();

  const cleanedResponse = responseText
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return JSON.parse(cleanedResponse) as GeneratedQuiz;
}

export async function generatePresentationOutline(
  content: string,
  numberOfSlides: number = 10,
  style: "professional" | "academic" | "casual" = "professional",
  format: "concise" | "detailed" | "bulletpoint" = "bulletpoint",
): Promise<GeneratedPresentation> {
  const stylePrompt = {
    professional: "formal and business-appropriate language, suitable for corporate presentations",
    academic: "scholarly tone with emphasis on key concepts and evidence-based points",
    casual: "friendly and conversational tone, easy to understand for general audiences",
  };

  const formatInstruction = {
    bulletpoint: "3-5 concise bullet points covering main topics in one sentence each. Format as bullet points separated by newlines with '- ' prefix.",
    concise: "a short paragraph (50-100 words) that is to-the-point, clear, and informative",
    detailed: "a longer paragraph (150-200 words) with more details and well-structured information",
  };

  const prompt = `You are an expert presentation designer. Based on the following content, create a presentation with approximately ${numberOfSlides} slides.

Content:
${content}

Requirements:
1. Use ${stylePrompt[style]}
2. Create a logical flow from introduction to conclusion
3. Each slide should have a clear, concise title (one-liner)
4. Each slide content should be: ${formatInstruction[format]}
5. Ensure the presentation tells a cohesive story
6. Keep titles short to fit on one line

Respond in the following JSON format only (no markdown, no code blocks):
{
  "title": "Main presentation title",
  "subtitle": "Optional subtitle or tagline",
  "slides": [
    {
      "title": "Slide title",
      "content": "Slide content based on format",
      "format": "${format}"
    }
  ],
  "estimatedDuration": "X minutes"
}`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();

  const cleanedResponse = responseText
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return JSON.parse(cleanedResponse) as GeneratedPresentation;
}
