import express from 'express';
import * as postController from './post.controller.js';
import { validation } from '../../middleware/validation.js';
import { allowedTo, protectedRoutes } from '../auth/auth.controller.js';

const postRouter = express.Router();

postRouter.post(
  '/createPost',
  protectedRoutes,
  allowedTo('admin', 'user'),
  postController.createPost
);

postRouter.get(
  '/getAllPosts',
  protectedRoutes,
  allowedTo('admin', 'user'),
  postController.getAllPosts
);

postRouter.get(
  '/getUserPosts',
  protectedRoutes,
  allowedTo('admin', 'user'),
  postController.getUserPosts
);

postRouter.get(
  '/getPost/:postId',
  protectedRoutes,
  allowedTo('admin', 'user'),
  postController.getPost
);

postRouter.patch(
  '/updatePost/:postId',
  protectedRoutes,
  allowedTo('admin', 'user'),
  postController.updatePost
);

postRouter.delete(
  '/deletePost/:postId',
  protectedRoutes,
  allowedTo('admin', 'user'),
  postController.deletePost
);

postRouter.patch(
  '/likePost/:postId',
  protectedRoutes,
  allowedTo('admin', 'user'),
  postController.likePost
);

postRouter.patch(
  '/addComment/:postId',
  protectedRoutes,
  allowedTo('admin', 'user'),
  postController.addComment
);

postRouter.patch(
  '/deleteComment/:postId/:commentId',
  protectedRoutes,
  allowedTo('admin', 'user'),
  postController.deleteComment
);

postRouter.patch(
  '/updateComment/:postId/:commentId',
  protectedRoutes,
  allowedTo('admin', 'user'),
  postController.updateComment
);

export default postRouter;
