import express from 'express';
import { authenticateToken } from '../middleware/authentication.js';
import { isTeacher } from '../middleware/teacher.js';
import { quizController } from '../controllers/quizController.js';

const quizRouter = express.Router();

quizRouter.post('/', authenticateToken, isTeacher, quizController.createQuiz);
quizRouter.put('/:id/marks', authenticateToken, isTeacher, quizController.setQuestionMarks);
quizRouter.put('/:id/publish', authenticateToken, isTeacher, quizController.publishQuiz);
quizRouter.get('/', authenticateToken, isTeacher, quizController.getTeacherQuizzes);
quizRouter.get('/:id', authenticateToken, quizController.getQuizById);

export default quizRouter;
