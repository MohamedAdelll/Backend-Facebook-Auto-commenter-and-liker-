const Joi = require("joi");

const createValidation = Joi.object({
    full_name : Joi.string().required().min(3),
    user_name : Joi.string().required().min(1),
    password : Joi.string().required().min(1),
    email : Joi.string().email().required().min(8),
    profile_image : Joi.string()

});

const updateValidation = Joi.object({
    full_name : Joi.string().required().min(3),
    user_name : Joi.string().required().min(1)
});

const loginValidation = Joi.object({
    user_name : Joi.string().required().min(1),
    password : Joi.string().required().min(1)
});

const changePasswordValidation = Joi.object({
    password : Joi.string().required().min(1)
});

module.exports = {
    createValidation,
    loginValidation,
    updateValidation,
    changePasswordValidation,
};