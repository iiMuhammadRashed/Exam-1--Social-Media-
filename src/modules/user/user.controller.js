import { userModel } from '../../../database/models/user.model.js';
import { asyncErrorHandler } from '../../middleware/handleAsyncError.js';
import { AppError } from '../../utils/AppError.js';
import cloudinary from '../../utils/cloudinary.js';
import { sendEmail } from '../../emails/mailer.js';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { forgetPasswordHTML } from '../../emails/forgetPasswordHTML.js';
import { v4 as uuidv4 } from 'uuid';

const updateUser = asyncErrorHandler(async (req, res, next) => {
  const id = req.user._id;
  let user = await userModel.findById(id);
  if (!user) return next(new AppError(`No user found`, 404));
  if (req.body.username) {
    if (user.username == req.body.username.toLowerCase())
      return next(new AppError(`New username match old name`, 400));
    if (await userModel.findOne({ username: req.body.username.toLowerCase() }))
      return next(new AppError(`username is already exist`, 400));
  }
  if (req.body.bio) {
    if (user.bio == req.body.bio)
      return next(new AppError(`New bio match old bio`, 400));
  }
  if (req.body.email) {
    if (user.email == req.body.email.toLowerCase())
      return next(new AppError(`New email match old email`, 400));
    if (await userModel.findOne({ email: req.body.email.toLowerCase() }))
      return next(new AppError(`email is already exist`, 400));
  }

  if (req.files) {
    if (req.files.coverImage) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.coverImage[0].path,
        {
          folder: `Social Media Application/users/coverImages`,
          public_id: uuidv4(),
        },
        (err, res) => {
          if (err) return next(new AppError(err, 400));
        }
      );
      if (user.coverImage)
        await cloudinary.uploader.destroy(user.coverImage.public_id);
      req.body.coverImage = { secure_url, public_id };
    }
    if (req.files.profileImage) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.profileImage[0].path,
        {
          folder: `Social Media Application/users/profileImage`,
          public_id: uuidv4(),
        },
        (err, res) => {
          if (err) return next(new AppError(err, 400));
        }
      );
      if (user.profileImage)
        await cloudinary.uploader.destroy(user.profileImage.public_id);
      req.body.profileImage = { secure_url, public_id };
    }
  }
  let updatedUser = await userModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  updatedUser && res.status(200).json({ message: 'success', updatedUser });
  !updatedUser && next(new AppError(`failed`, 400));
});

const updateUserPassword = asyncErrorHandler(async (req, res, next) => {
  if (!bcrypt.compareSync(req.body.oldPassword, req.user.password))
    return next(new AppError(`wrong old password`, 400));
  if (req.body.oldPassword === req.body.newPassword)
    return next(new AppError(`new password cannot match old password`, 400));
  let user = await userModel.findByIdAndUpdate(
    req.user._id,
    { password: req.body.newPassword, passwordChangedAt: Date.now() },
    {
      new: true,
    }
  );
  !user && next(new AppError(`No user found`, 404));
  user && res.status(200).json({ message: 'success', user });
});

const sendForgetPasswordCode = asyncErrorHandler(async (req, res, next) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppError(`Email does't exist , Please register first`, 404)
    );
  let forgetPasswordCode = nanoid(6);
  user.forgetPasswordCode = forgetPasswordCode;
  await user.save();
  sendEmail({
    username: user.username,
    receiverEmail: user.email,
    html: forgetPasswordHTML(`${forgetPasswordCode}`),
  });
  user && res.status(200).json({ message: 'success' });
});

const resetPassword = asyncErrorHandler(async (req, res, next) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppError(`Email does't exist , Please register first`, 404)
    );
  if (user.forgetPasswordCode !== req.body.code) {
    return next(new AppError(`Invalid code`, 400));
  } else {
    let newCode = nanoid(6);
    let updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      {
        password: req.body.newPassword,
        passwordChangedAt: Date.now(),
        forgetPasswordCode: newCode,
      },
      {
        new: true,
      }
    );
    updatedUser && res.status(200).json({ message: 'success', updatedUser });
  }
});

export {
  updateUser,
  updateUserPassword,
  sendForgetPasswordCode,
  resetPassword,
};
