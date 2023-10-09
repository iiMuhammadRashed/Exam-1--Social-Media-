import Joi from 'joi';

const addUserValidation = Joi.object({
  username: Joi.string().min(4).max(20).required(),
  firstName: Joi.string().min(4).max(20).required(),
  lastName: Joi.string().min(4).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  rePassword: Joi.string().valid(Joi.ref('password')).required(),
  age: Joi.number().min(16).max(80).required(),
  gender: Joi.string().valid('male', 'female', 'not specific').required(),
  role: Joi.string().valid('user', 'admin'),
});

const updateUserValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
  username: Joi.string().min(4).max(20),
  firstName: Joi.string().min(4).max(20),
  lastName: Joi.string().min(4).max(20),
  email: Joi.string().email(),
  age: Joi.number().min(16).max(80),
  gender: Joi.string().valid('male', 'female', 'not specific'),
  role: Joi.string().valid('user', 'admin'),
});

const updateUserPasswordValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
  password: Joi.string().required(),
  rePassword: Joi.string().valid(Joi.ref('password')).required(),
});

const deleteUserValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export {
  addUserValidation,
  updateUserValidation,
  updateUserPasswordValidation,
  deleteUserValidation,
};
