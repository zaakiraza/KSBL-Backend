const AI_BASE_URL = "http://127.0.0.1:8000";

const fetchQuizQuestions = async (quizId) => {
  const response = await fetch(`${AI_BASE_URL}/v1/quizzes/${quizId}/review-export`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI server error (review-export): ${response.status} ${text}`);
  }

  return response.json();
};

export const generateQuiz = async ({ teacherId, classId, title, fileBuffer, fileName, url }) => {
  const formData = new FormData();
  formData.append("teacherId", teacherId);
  formData.append("classId", classId);
  formData.append("title", title);

  if (fileBuffer) {
    const blob = new Blob([fileBuffer], { type: "application/pdf" });
    formData.append("file", blob, fileName || "document.pdf");
  } else if (url) {
    formData.append("url", url);
  }

  // Step 1 — ingest document
  const ingestResponse = await fetch(`${AI_BASE_URL}/v1/ingestions`, {
    method: "POST",
    body: formData,
  });

  if (!ingestResponse.ok) {
    const text = await ingestResponse.text();
    throw new Error(`AI server error (ingestions): ${ingestResponse.status} ${text}`);
  }

  // x-quiz-id may come as a response header or a body field
  let quizId = ingestResponse.headers.get("x-quiz-id");
  if (!quizId) {
    const body = await ingestResponse.json();
    quizId = body["x-quiz-id"] || body["quiz_id"] || body["id"];
  }

  if (!quizId) throw new Error("AI server did not return a quiz ID.");

  // Step 2 — fetch generated questions
  return fetchQuizQuestions(quizId);
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
