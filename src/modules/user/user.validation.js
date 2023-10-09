import Joi from 'joi';

const updateUserPasswordValidation = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
  reNewPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});

const updateUserValidation = Joi.object({
  username: Joi.string().min(4).max(20),
  firstName: Joi.string().min(4).max(20),
  lastName: Joi.string().min(4).max(20),
  bio: Joi.string().min(10).max(100),
  email: Joi.string().email(),
  age: Joi.number().min(16).max(80),
  gender: Joi.string().valid('male', 'female', 'not specific'),
  coverImage: Joi.object().optional(),
  profileImage: Joi.object().optional(),
});

const sendForgetPasswordCodeValidation = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
  newPassword: Joi.string().required(),
  reNewPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});

export {
  updateUserPasswordValidation,
  updateUserValidation,
  sendForgetPasswordCodeValidation,
  resetPasswordValidation,
};
