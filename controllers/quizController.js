import Quiz from "../models/quiz.js";
import { generateQuizWithGemini } from "../utils/geminiService.js";
import { errorResponse, successResponse } from "../utils/responseHandler.js";

export const quizController = {
  createQuiz: async (req, res) => {
    try {
      const {
        classId,
        topicName,
        expiresAt,
        questionCount,
        marksType,
        equalMarksPerQuestion,
        complexityLevel,
        maxAttempts,
        url,
      } = req.body;

      if (!classId || !topicName || !expiresAt || !questionCount || !marksType || !complexityLevel)
        return errorResponse(
          res,
          "classId, topicName, expiresAt, questionCount, marksType and complexityLevel are required.",
          400
        );

      if (!req.file && !url)
        return errorResponse(res, "Either a PDF file or a url is required.", 400);

      const aiQuestions = await generateQuizWithGemini({
        topicName,
        questionCount: Number(questionCount),
        complexityLevel,
        fileBuffer: req.file?.buffer,
        url,
      });

      const questions = aiQuestions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: marksType === "equal" && equalMarksPerQuestion ? Number(equalMarksPerQuestion) : null,
      }));

      const quiz = await Quiz.create({
        teacherId: req.user.id,
        classId,
        topicName,
        expiresAt,
        questionCount: Number(questionCount),
        marksType,
        equalMarksPerQuestion: marksType === "equal" ? (Number(equalMarksPerQuestion) ?? null) : null,
        complexityLevel,
        maxAttempts: Number(maxAttempts) || 1,
        questions,
      });

      return successResponse(res, quiz, "Quiz created successfully");
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  setQuestionMarks: async (req, res) => {
    try {
      const quiz = await Quiz.findOne({ _id: req.params.id, teacherId: req.user.id });
      if (!quiz) return errorResponse(res, "Quiz not found.", 404);
      if (quiz.status === "published")
        return errorResponse(res, "Cannot edit marks on a published quiz.", 400);

      const { marks } = req.body; // [{ questionIndex, marks }]
      if (!Array.isArray(marks)) return errorResponse(res, "marks must be an array.", 400);

      marks.forEach(({ questionIndex, marks: m }) => {
        if (quiz.questions[questionIndex] !== undefined) {
          quiz.questions[questionIndex].marks = m;
        }
      });

      await quiz.save();
      return successResponse(res, quiz, "Marks updated successfully");
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  publishQuiz: async (req, res) => {
    try {
      const quiz = await Quiz.findOne({ _id: req.params.id, teacherId: req.user.id });
      if (!quiz) return errorResponse(res, "Quiz not found.", 404);
      if (quiz.status === "published")
        return errorResponse(res, "Quiz is already published.", 400);

      const unmarked = quiz.questions.some((q) => q.marks === null || q.marks === undefined);
      if (unmarked)
        return errorResponse(
          res,
          "All questions must have marks assigned before publishing.",
          400
        );

      quiz.status = "published";
      await quiz.save();
      return successResponse(res, quiz, "Quiz published successfully");
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  getTeacherQuizzes: async (req, res) => {
    try {
      const quizzes = await Quiz.find({ teacherId: req.user.id });
      return successResponse(res, quizzes, "Quizzes fetched successfully");
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  getQuizById: async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id);
      if (!quiz) return errorResponse(res, "Quiz not found.", 404);

      const isOwner =
        req.user.role === "teacher" && quiz.teacherId.toString() === req.user.id;

      if (!isOwner) {
        const sanitized = quiz.toObject();
        sanitized.questions = sanitized.questions.map(({ correctAnswer, ...rest }) => rest);
        return successResponse(res, sanitized, "Quiz fetched successfully");
      }

      return successResponse(res, quiz, "Quiz fetched successfully");
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },
};
