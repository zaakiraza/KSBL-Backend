import Quiz from "../models/quiz.js";
import QuizAttempt from "../models/quizAttempt.js";
import User from "../models/user.js";
import { evaluateAnswers } from "../utils/aiService.js";
import { errorResponse, successResponse } from "../utils/responseHandler.js";

export const attemptController = {
  getAvailableQuizzes: async (req, res) => {
    try {
      const student = await User.findById(req.user.id);
      if (!student || !student.teacherId)
        return errorResponse(res, "Student is not linked to a teacher.", 400);

      const now = new Date();
      const quizzes = await Quiz.find({
        teacherId: student.teacherId,
        status: "published",
        expiresAt: { $gt: now },
      });

      const sanitized = quizzes.map((quiz) => {
        const q = quiz.toObject();
        q.questions = q.questions.map(({ correctAnswer, ...rest }) => rest);
        return q;
      });

      return successResponse(res, sanitized, "Available quizzes fetched successfully");
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  submitAttempt: async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id);
      if (!quiz) return errorResponse(res, "Quiz not found.", 404);
      if (quiz.status !== "published") return errorResponse(res, "Quiz is not available.", 400);
      if (new Date() > quiz.expiresAt) return errorResponse(res, "Quiz has expired.", 400);

      const existingAttempts = await QuizAttempt.countDocuments({
        quizId: quiz._id,
        studentId: req.user.id,
      });
      if (existingAttempts >= quiz.maxAttempts)
        return errorResponse(res, `Maximum attempts (${quiz.maxAttempts}) reached.`, 400);

      const { answers } = req.body; // [{ questionIndex, selectedAnswer }]
      if (!Array.isArray(answers) || answers.length !== quiz.questions.length)
        return errorResponse(res, "Answers must be provided for all questions.", 400);

      // Build payload for AI evaluation: include correctAnswer, marks, selectedOption
      const questionsWithAnswers = quiz.questions.map((q, i) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        selectedOption: answers[i]?.selectedAnswer ?? null,
      }));

      const aiResult = await evaluateAnswers(questionsWithAnswers);

      // aiResult: [{ obtainedMarks, remarks }] — one entry per question
      const totalScore = aiResult.reduce((sum, r) => sum + (r.obtainedMarks || 0), 0);
      const remarks = aiResult
        .map((r) => r.remarks)
        .filter(Boolean)
        .join("; ");

      const attempt = await QuizAttempt.create({
        quizId: quiz._id,
        studentId: req.user.id,
        attemptNumber: existingAttempts + 1,
        answers,
        score: totalScore,
        remarks,
      });

      return successResponse(res, attempt, "Attempt submitted successfully");
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  getMyAttempts: async (req, res) => {
    try {
      const attempts = await QuizAttempt.find({
        quizId: req.params.id,
        studentId: req.user.id,
      }).sort({ attemptNumber: 1 });
      return successResponse(res, attempts, "Attempts fetched successfully");
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  getQuizResults: async (req, res) => {
    try {
      const quiz = await Quiz.findOne({ _id: req.params.id, teacherId: req.user.id });
      if (!quiz) return errorResponse(res, "Quiz not found.", 404);

      const attempts = await QuizAttempt.find({ quizId: quiz._id })
        .populate("studentId", "name email")
        .sort({ createdAt: -1 });

      return successResponse(res, attempts, "Results fetched successfully");
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },
};
