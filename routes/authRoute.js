import express from 'express';
import { authController } from '../controllers/authController.js';

const authRouter = express.Router();
authRouter.post('/register', authController.registerUser);
authRouter.post('/login', authController.loginUser);

export default authRouter;
