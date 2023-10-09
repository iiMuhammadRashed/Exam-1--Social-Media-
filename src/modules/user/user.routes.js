import express from 'express';
import * as userController from './user.controller.js';
import { validation } from '../../middleware/validation.js';
import { allowedTo, protectedRoutes } from '../auth/auth.controller.js';
import { allowedTypes, multerCloudinary } from '../../utils/multerCloud.js';
import {
  resetPasswordValidation,
  sendForgetPasswordCodeValidation,
  updateUserPasswordValidation,
  updateUserValidation,
} from './user.validation.js';

const userRouter = express.Router();

userRouter.patch(
  '/updateUser',
  multerCloudinary(allowedTypes.image).fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
  ]),
  validation(updateUserValidation),
  protectedRoutes,
  allowedTo('admin', 'user'),
  userController.updateUser
);
userRouter.patch(
  '/updateUserPassword',
  validation(updateUserPasswordValidation),
  protectedRoutes,
  allowedTo('admin', 'user'),
  userController.updateUserPassword
);

userRouter.patch(
  '/sendForgetPasswordCode',
  validation(sendForgetPasswordCodeValidation),
  userController.sendForgetPasswordCode
);
userRouter.patch(
  '/resetPassword',
  validation(resetPasswordValidation),
  userController.resetPassword
);

export default userRouter;
