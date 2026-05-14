import express from 'express';
import { authenticateToken } from '../middleware/authentication.js';
import { admin } from '../middleware/admin.js';
import { isTeacher } from '../middleware/teacher.js';
import { userController } from '../controllers/userController.js';

const userRouter = express.Router();
userRouter.get('/', authenticateToken, admin, userController.getAllUsers);
userRouter.post('/students', authenticateToken, isTeacher, userController.addStudent);
userRouter.get('/students', authenticateToken, isTeacher, userController.getMyStudents);

export default userRouter;
