import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface GeneratedQuiz {
  title: string;
  questions: GeneratedQuestion[];
}

export async function generateQuizFromContent(
  content: string,
  numberOfQuestions: number = 5,
  difficulty: "easy" | "medium" | "hard" = "medium"
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

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that creates educational quizzes. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const responseText = response.choices[0]?.message?.content?.trim() || "";

  try {
    // Remove any potential markdown code blocks
    const cleanedResponse = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const quiz = JSON.parse(cleanedResponse) as GeneratedQuiz;
    return quiz;
  } catch (error) {
    console.error("Failed to parse quiz response:", responseText);
    throw new Error("Failed to generate quiz. Please try again.");
  }
}

// Presentation Generation Types and Functions

export interface SlideContent {
  title: string;
  bulletPoints: string[];
  speakerNotes?: string;
}

export interface GeneratedPresentation {
  title: string;
  subtitle?: string;
  slides: SlideContent[];
  estimatedDuration: string;
}

export async function generatePresentationOutline(
  content: string,
  numberOfSlides: number = 10,
  style: "professional" | "academic" | "casual" = "professional"
): Promise<GeneratedPresentation> {
  const stylePrompt = {
    professional:
      "formal and business-appropriate language, suitable for corporate presentations",
    academic:
      "scholarly tone with emphasis on key concepts and evidence-based points",
    casual:
      "friendly and conversational tone, easy to understand for general audiences",
  };

  const prompt = `You are an expert presentation designer. Based on the following content, create a presentation outline with approximately ${numberOfSlides} slides.

Content:
${content}

Requirements:
1. Use ${stylePrompt[style]}
2. Create a logical flow from introduction to conclusion
3. Each slide should have a clear title and 3-5 concise bullet points
4. Include speaker notes for each slide to guide the presenter
5. Start with a title slide and end with a summary/conclusion slide
6. Make bullet points concise but informative
7. Ensure the presentation tells a cohesive story

Respond in the following JSON format only (no markdown, no code blocks):
{
  "title": "Main presentation title",
  "subtitle": "Optional subtitle or tagline",
  "slides": [
    {
      "title": "Slide title",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"],
      "speakerNotes": "Notes for the presenter about this slide"
    }
  ],
  "estimatedDuration": "X minutes"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that creates professional presentation outlines. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const responseText = response.choices[0]?.message?.content?.trim() || "";

  try {
    const cleanedResponse = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const presentation = JSON.parse(cleanedResponse) as GeneratedPresentation;
    return presentation;
  } catch (error) {
    console.error("Failed to parse presentation response:", responseText);
    throw new Error("Failed to generate presentation. Please try again.");
  }
}

export { openai };
