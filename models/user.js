const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    name: {
        type: String,
        required: true,
        maxlength: 50
    },
    birthday: Date,
    email: String,
    status: {
        type: String,
        default: 'active'
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
    return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = {
        username: Joi.string().min(5).max(50).required(),
        password: Joi.string().min(5).max(255).required(),
        name: Joi.string().max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        birthday: Joi.date().required()
    };

    return Joi.validate(user, schema);
}

exports.userSchema = userSchema;
exports.User = User;
exports.validate = validateUser;