import express from 'express';
import * as authController from './auth.controller.js';
import { validation } from '../../middleware/validation.js';
import { signInValidation, signUpValidation } from './auth.validation.js';

const authRouter = express.Router();

authRouter.post('/signUp', validation(signUpValidation), authController.signUp);
authRouter.post('/signIn', validation(signInValidation), authController.signIn);
authRouter.get('/verify/:email', authController.verifyEmail);

export default authRouter;
