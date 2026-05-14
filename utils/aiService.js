const AI_BASE_URL = "http://172.16.76.170:8888";

export const generateQuiz = async ({ pdfBase64, questionCount, complexityLevel, topic }) => {
  const response = await fetch(`${AI_BASE_URL}/generate-quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pdfBase64, questionCount, complexityLevel, topic }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI server error (generate-quiz): ${response.status} ${text}`);
  }

  return response.json();
};

export const evaluateAnswers = async (questionsWithAnswers) => {
  const response = await fetch(`${AI_BASE_URL}/evaluate-answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(questionsWithAnswers),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI server error (evaluate-answers): ${response.status} ${text}`);
  }

  return response.json();
};
