import { userModel } from '../../../database/models/user.model.js';
import { asyncErrorHandler } from '../../middleware/handleAsyncError.js';
import { AppError } from '../../utils/AppError.js';
import { ApiFeatures } from '../../utils/ApiFeatures.js';

const addUser = asyncErrorHandler(async (req, res, next) => {
  let isEmailExist = await userModel.findOne({ email: req.body.email });
  if (isEmailExist)
    return next(new AppError(`The email is already exist`, 409));
  let isUsernameExist = await userModel.findOne({
    username: req.body.username,
  });
  if (isUsernameExist)
    return next(new AppError(`The Username is already exist`, 409));
  let user = new userModel(req.body);
  await user.save();
  res.status(201).json({ message: 'success', user });
});

const getAllUsers = asyncErrorHandler(async (req, res, next) => {
  let apiFeatures = new ApiFeatures(userModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();
  let users = await apiFeatures.mongooseQuery;
  if (!users.length) return next(new AppError(`No users found`, 404));
  users &&
    res
      .status(200)
      .json({ message: 'success', CurrentPage: apiFeatures.PAGE, users });
});

const getUser = asyncErrorHandler(async (req, res, next) => {
  let { id } = req.params;
  let user = await userModel.findById(id);
  if (!user) return next(new AppError(`No user found`, 404));
  user && res.status(200).json({ message: 'success', user });
});

const updateUser = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  let user = await userModel.findById(id);
  if (!user) return next(new AppError(`No user found`, 404));
  if (req.body.username) {
    if (user.username == req.body.username.toLowerCase())
      return next(new AppError(`New username match old name`, 400));
    if (await userModel.findOne({ username: req.body.username.toLowerCase() }))
      return next(new AppError(`username is already exist`, 400));
  }
  let updatedUser = await userModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  updatedUser && res.status(200).json({ message: 'success', updatedUser });
  !updatedUser && next(new AppError(`failed`, 400));
});

const updateUserPassword = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  let user = await userModel.findByIdAndUpdate(
    id,
    { password: req.body.password, passwordChangedAt: Date.now() },
    {
      new: true,
    }
  );
  !user && next(new AppError(`No user found`, 404));
  user && res.status(200).json({ message: 'success', user });
});

const deleteUser = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  let user = await userModel.findByIdAndDelete(id);
  if (!user) return next(new AppError(`No user found`, 404));
  user && res.status(200).json({ message: 'success', user });
});

export {
  addUser,
  getAllUsers,
  getUser,
  updateUser,
  updateUserPassword,
  deleteUser,
};
