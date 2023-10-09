import { Schema, Types, model } from 'mongoose';

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Types.ObjectId,
      ref: 'user',
    },
    comments: [
      {
        user: {
          type: Types.ObjectId,
          ref: 'user',
        },
        comment: {
          type: String,
          trim: true,
        },
      },
    ],
    commentsNumber: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: [
      {
        user: {
          type: Types.ObjectId,
          ref: 'user',
        },
      },
    ],
    likesNumber: {
      type: Number,
      default: 0,
      min: 0,
    },
    privacy: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
  },
  {
    timestamps: true,
  }
);

export const postModel = model('post', postSchema);
