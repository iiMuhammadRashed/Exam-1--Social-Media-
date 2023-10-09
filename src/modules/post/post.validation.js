import Joi from 'joi';

const createPostValidation = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  privacy: Joi.string().valid('public', 'private').required(),
});

const getPostValidation = Joi.object({
  postId: Joi.string().hex().length(24).required(),
});

const updatePostValidation = Joi.object({
  postId: Joi.string().hex().length(24).required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  privacy: Joi.string().valid('public', 'private').required(),
});

const deletePostValidation = Joi.object({
  postId: Joi.string().hex().length(24).required(),
});

const likePostValidation = Joi.object({
  postId: Joi.string().hex().length(24).required(),
});

const addCommentValidation = Joi.object({
  postId: Joi.string().hex().length(24).required(),
  comment: Joi.string().max(100).required(),
});

const deleteCommentValidation = Joi.object({
  postId: Joi.string().hex().length(24).required(),
  commentId: Joi.string().hex().length(24).required(),
});

const updateCommentValidation = Joi.object({
  postId: Joi.string().hex().length(24).required(),
  commentId: Joi.string().hex().length(24).required(),
  comment: Joi.string().max(100).required(),
});

export {
  createPostValidation,
  getPostValidation,
  updatePostValidation,
  deletePostValidation,
  likePostValidation,
  addCommentValidation,
  deleteCommentValidation,
  updateCommentValidation,
};
