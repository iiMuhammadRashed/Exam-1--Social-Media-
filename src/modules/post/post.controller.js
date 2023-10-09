import { postModel } from '../../../database/models/post.model.js';
import { asyncErrorHandler } from '../../middleware/handleAsyncError.js';
import { ApiFeatures } from '../../utils/ApiFeatures.js';
import { AppError } from '../../utils/AppError.js';

const createPost = asyncErrorHandler(async (req, res, next) => {
  req.body.author = req.user._id;
  let post = new postModel(req.body);
  await post.save();
  res.status(201).json({ message: 'success', post });
});

const getAllPosts = asyncErrorHandler(async (req, res, next) => {
  let apiFeatures = new ApiFeatures(
    postModel
      .find({
        $or: [
          { privacy: 'public' },
          { privacy: 'private', author: req.user._id },
        ],
      })
      .populate([
        {
          path: 'author',
          select: 'username firstName lastName profileImage',
        },
        {
          path: 'comments.user',
          select: 'username firstName lastName profileImage',
        },
        {
          path: 'likes',
          select: 'username firstName lastName profileImage',
        },
      ]),
    req.query
  )
    .paginate()
    .sort();
  let posts = await apiFeatures.mongooseQuery;
  if (!posts.length) return next(new AppError(`No posts found`, 404));
  posts &&
    res
      .status(200)
      .json({ message: 'success', CurrentPage: apiFeatures.PAGE, posts });
});

const getUserPosts = asyncErrorHandler(async (req, res, next) => {
  let apiFeatures = new ApiFeatures(
    postModel
      .findOne({
        author: req.user._id,
      })
      .populate([
        {
          path: 'author',
          select: 'username firstName lastName profileImage',
        },
        {
          path: 'comments.user',
          select: 'username firstName lastName profileImage',
        },
        {
          path: 'likes',
          select: 'username firstName lastName profileImage',
        },
      ]),
    req.query
  )
    .paginate()
    .sort();
  let posts = await apiFeatures.mongooseQuery;
  if (!posts) return next(new AppError(`No posts found`, 404));
  posts &&
    res
      .status(200)
      .json({ message: 'success', CurrentPage: apiFeatures.PAGE, posts });
});

const getPost = asyncErrorHandler(async (req, res, next) => {
  let post = await postModel
    .findOne({
      _id: req.params.postId,
      $or: [
        { privacy: 'public' },
        { privacy: 'private', author: req.user._id },
      ],
    })
    .populate([
      {
        path: 'author',
        select: 'username firstName lastName profileImage',
      },
      {
        path: 'comments.user',
        select: 'username firstName lastName profileImage',
      },
      {
        path: 'likes',
        select: 'username firstName lastName profileImage',
      },
    ]);
  if (!post) return next(new AppError(`No posts found`, 404));
  post && res.status(200).json({ message: 'success', post });
});

const updatePost = asyncErrorHandler(async (req, res, next) => {
  let post = await postModel.findById(req.params.postId);
  if (!post) return next(new AppError(`No posts found`, 404));
  if (JSON.stringify(req.user._id) !== JSON.stringify(post.author))
    return next(new AppError(`You are not allowed to update this post`, 403));
  if (req.body.title) {
    if (post.title.toLowerCase() == req.body.title.toLowerCase())
      return next(new AppError(`New title match old title`, 400));
  }
  if (req.body.content) {
    if (post.content.toLowerCase() == req.body.content.toLowerCase())
      return next(new AppError(`New content match old content`, 400));
  }
  let updatedPost = await postModel.findByIdAndUpdate(
    req.params.postId,
    req.body,
    {
      new: true,
    }
  );
  updatedPost && res.status(200).json({ message: 'success', updatedPost });
  !updatedPost && next(new AppError(`failed`, 400));
});

const deletePost = asyncErrorHandler(async (req, res, next) => {
  let post = await postModel.findById(req.params.postId);
  if (!post) return next(new AppError(`No posts found`, 404));
  if (JSON.stringify(req.user._id) !== JSON.stringify(post.author))
    return next(new AppError(`You are not allowed to delete this post`, 403));
  let deletedPost = await postModel.findByIdAndDelete(req.params.postId);
  deletedPost && res.status(200).json({ message: 'success', deletedPost });
  !deletedPost && next(new AppError(`failed`, 400));
});

const likePost = asyncErrorHandler(async (req, res, next) => {
  let alreadyLiked = false;
  let post = await postModel.findOne({
    _id: req.params.postId,
    $or: [{ privacy: 'public' }, { privacy: 'private', author: req.user._id }],
  });
  if (!post) return next(new AppError(`No posts found`, 404));
  post.likes.map(async (el) => {
    if (JSON.stringify(el.user) === JSON.stringify(req.user._id)) {
      alreadyLiked = true;
    }
  });
  if (alreadyLiked) {
    let updatedPost = await postModel.findByIdAndUpdate(
      req.params.postId,
      {
        $pull: { likes: { user: req.user._id } },
        $inc: { likesNumber: -1 },
      },
      { new: true }
    );
    updatedPost &&
      res
        .status(200)
        .json({ message: 'success', status: 'unlike', updatedPost });
  } else {
    let updatedPost = await postModel.findByIdAndUpdate(
      req.params.postId,
      {
        $addToSet: { likes: { user: req.user._id } },
        $inc: { likesNumber: +1 },
      },
      { new: true }
    );
    updatedPost &&
      res.status(200).json({ message: 'success', status: 'like', updatedPost });
  }
});

const addComment = asyncErrorHandler(async (req, res, next) => {
  let post = await postModel.findOne({
    _id: req.params.postId,
    $or: [{ privacy: 'public' }, { privacy: 'private', author: req.user._id }],
  });
  if (!post) return next(new AppError(`No posts found`, 404));
  let comment = await postModel.findByIdAndUpdate(
    req.params.postId,
    {
      $push: { comments: { user: req.user._id, comment: req.body.comment } },
      $inc: { commentsNumber: +1 },
    },
    { new: true }
  );
  res.status(200).json({ message: 'success', comment });
});

const deleteComment = asyncErrorHandler(async (req, res, next) => {
  let post = await postModel.findOne({
    _id: req.params.postId,
    $or: [{ privacy: 'public' }, { privacy: 'private', author: req.user._id }],
    'comments._id': req.params.commentId,
    'comments.user': req.user._id,
  });
  if (!post) return next(new AppError(`comment or post not found`, 404));
  let comment = await postModel.findByIdAndUpdate(
    req.params.postId,
    {
      $pull: {
        comments: {
          $and: [{ user: req.user._id }, { _id: req.params.commentId }],
        },
      },
      $inc: { commentsNumber: -1 },
    },
    { new: true }
  );
  res.status(200).json({ message: 'success', comment });
});

const updateComment = asyncErrorHandler(async (req, res, next) => {
  let comment = await postModel.findOneAndUpdate(
    {
      _id: req.params.postId,
      $or: [
        { privacy: 'public' },
        { privacy: 'private', author: req.user._id },
      ],
      comments: {
        $elemMatch: { _id: req.params.commentId, user: req.user._id },
      },
    },
    {
      $set: {
        'comments.$.comment': req.body.comment,
      },
    },
    { new: true }
  );
  comment && res.status(200).json({ message: 'success', comment });
  !comment && next(new AppError(`comment or post not found`, 404));
});

export {
  createPost,
  getAllPosts,
  getUserPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  updateComment,
};
