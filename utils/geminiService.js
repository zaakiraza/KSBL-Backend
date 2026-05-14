import OpenAI from "openai";

export const generateQuizWithGemini = async ({
  topicName,
  questionCount,
  complexityLevel,
  fileBuffer,
  url,
}) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `You are a quiz generator. Based on the provided content about "${topicName}", generate exactly ${questionCount} multiple choice questions with ${complexityLevel} complexity level.

IMPORTANT: Return ONLY a valid JSON array — no markdown, no code blocks, no extra text. Format must be exactly:
[
  {
    "questionText": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The exact text of the correct option"
  }
]`;

  const messages = [{ role: "user", content: [] }];

  if (fileBuffer) {
    // Upload the PDF file first, then reference it
    const file = await openai.files.create({
      file: new File([fileBuffer], "document.pdf", { type: "application/pdf" }),
      purpose: "assistants",
    });

    messages[0].content.push({
      type: "text",
      text: `The quiz should be based on the uploaded PDF (file ID: ${file.id}).\n\n${prompt}`,
    });
  } else if (url) {
    messages[0].content.push({
      type: "text",
      text: `The quiz should be based on the content from this URL: ${url}\n\n${prompt}`,
    });
  } else {
    messages[0].content.push({ type: "text", text: prompt });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
  });

  const text = response.choices[0].message.content;

  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  return JSON.parse(cleaned);
};
