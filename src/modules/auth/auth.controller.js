import { userModel } from '../../../database/models/user.model.js';
import { asyncErrorHandler } from '../../middleware/handleAsyncError.js';
import { AppError } from '../../utils/AppError.js';
import { sendEmail } from '../../emails/mailer.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { confirmEmailHTML } from '../../emails/confirmEmailHTML.js';

const signUp = asyncErrorHandler(async (req, res, next) => {
  let isEmailExist = await userModel.findOne({ email: req.body.email });
  if (isEmailExist) return next(new AppError(`Account is already exist`, 409));
  let isUsernameExist = await userModel.findOne({
    username: req.body.username,
  });
  if (isUsernameExist)
    return next(new AppError(`Username is already exist`, 409));
  let user = new userModel(req.body);
  await user.save();
  let token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
  let verifyToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
  sendEmail({
    username: user.username,
    receiverEmail: user.email,
    message: 'Verify your account',
    html: confirmEmailHTML(
      'Verify your account',
      `http://${process.env.BASE_URL + 'api/v1/auth/verify/' + verifyToken}`
    ),
  });
  res.status(201).json({ message: 'success', user, token });
});

const signIn = asyncErrorHandler(async (req, res, next) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppError(`Email does't exist , Please register first`, 404)
    );
  if (!bcrypt.compareSync(req.body.password, user.password))
    return next(new AppError(`wrong password`, 400));
  let token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
  res.status(201).json({ message: 'success', token });
});

const protectedRoutes = asyncErrorHandler(async (req, res, next) => {
  let { token } = req.headers;
  if (!token) return next(new AppError(`Please provide token`, 400));
  let decoded = jwt.verify(token, process.env.SECRET_KEY);
  let user = await userModel.findById(decoded.id);
  if (!user) return next(new AppError(`Invalid user`, 404));
  if (user.passwordChangedAt) {
    let changePasswordTime = parseInt(user.passwordChangedAt.getTime() / 1000);
    if (changePasswordTime > decoded.iat)
      return next(new AppError(`Invalid token`, 403));
  }
  req.user = user;
  next();
});

const allowedTo = (...roles) => {
  return asyncErrorHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError(`Unauthorized`, 401));
    next();
  });
};

const verifyEmail = asyncErrorHandler(async (req, res, next) => {
  const email = req.params.email;
  let decoded = jwt.verify(email, process.env.SECRET_KEY);
  if (decoded)
    await userModel.findOneAndUpdate({ _id: decoded.id }, { verified: true });
  res.status(201).json({ message: 'success' });
});

export { signUp, signIn, protectedRoutes, allowedTo, verifyEmail };
