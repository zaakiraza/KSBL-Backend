import express from 'express';
import { authenticateToken } from '../middleware/authentication.js';
import { isStudent } from '../middleware/student.js';
import { isTeacher } from '../middleware/teacher.js';
import { attemptController } from '../controllers/attemptController.js';

const attemptRouter = express.Router();

attemptRouter.get('/available', authenticateToken, isStudent, attemptController.getAvailableQuizzes);
attemptRouter.post('/quiz/:id/attempt', authenticateToken, isStudent, attemptController.submitAttempt);
attemptRouter.get('/quiz/:id/attempts', authenticateToken, isStudent, attemptController.getMyAttempts);
attemptRouter.get('/quiz/:id/results', authenticateToken, isTeacher, attemptController.getQuizResults);

export default attemptRouter;
