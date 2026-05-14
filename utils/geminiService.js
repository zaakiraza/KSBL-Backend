import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateQuizWithGemini = async ({
  topicName,
  questionCount,
  complexityLevel,
  fileBuffer,
  url,
}) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are a quiz generator. Based on the provided content about "${topicName}", generate exactly ${questionCount} multiple choice questions with ${complexityLevel} complexity level.

IMPORTANT: Return ONLY a valid JSON array — no markdown, no code blocks, no extra text. Format must be exactly:
[
  {
    "questionText": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The exact text of the correct option"
  }
]`;

  const parts = [];

  if (fileBuffer) {
    parts.push({
      inlineData: {
        data: fileBuffer.toString("base64"),
        mimeType: "application/pdf",
      },
    });
  } else if (url) {
    parts.push({ text: `The content to base the quiz on is available at this URL: ${url}\n\n` });
  }

  parts.push({ text: prompt });

  const result = await model.generateContent(parts);
  const text = result.response.text();

  // Strip markdown code fences if Gemini wraps the response
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  return JSON.parse(cleaned);
};
