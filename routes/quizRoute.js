import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/authentication.js';
import { isTeacher } from '../middleware/teacher.js';
import { quizController } from '../controllers/quizController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed.'));
  },
});

const quizRouter = express.Router();

quizRouter.post('/', authenticateToken, isTeacher, upload.single('file'), quizController.createQuiz);
quizRouter.put('/:id/marks', authenticateToken, isTeacher, quizController.setQuestionMarks);
quizRouter.put('/:id/publish', authenticateToken, isTeacher, quizController.publishQuiz);
quizRouter.get('/', authenticateToken, isTeacher, quizController.getTeacherQuizzes);
quizRouter.get('/:id', authenticateToken, quizController.getQuizById);

export default quizRouter;
