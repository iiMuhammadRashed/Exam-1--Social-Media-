import express from 'express';
import * as adminController from './admin.controller.js';
import { validation } from '../../middleware/validation.js';
import {
  addUserValidation,
  deleteUserValidation,
  updateUserPasswordValidation,
  updateUserValidation,
} from './admin.validation.js';
import { allowedTo, protectedRoutes } from '../auth/auth.controller.js';

const adminRouter = express.Router();
adminRouter
  .route('/')
  .post(
    validation(addUserValidation),
    protectedRoutes,
    allowedTo('admin'),
    adminController.addUser
  )
  .get(protectedRoutes, allowedTo('admin'), adminController.getAllUsers);
adminRouter
  .route('/:id')
  .get(protectedRoutes, adminController.getUser)
  .put(
    validation(updateUserValidation),
    protectedRoutes,
    allowedTo('admin'),
    adminController.updateUser
  )
  .patch(
    validation(updateUserPasswordValidation),
    protectedRoutes,
    allowedTo('admin'),
    adminController.updateUserPassword
  )
  .delete(
    validation(deleteUserValidation),
    protectedRoutes,
    allowedTo('admin'),
    adminController.deleteUser
  );

export default adminRouter;
