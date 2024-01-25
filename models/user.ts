import mongoose, { ObjectId } from 'mongoose'
import jwt from 'jsonwebtoken'
import config from 'config'
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

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

export const generateAuthToken = function (_id: ObjectId, isAdmin: boolean) {
    const secret = config.get<string>('jwtPrivateKey');
    const token = jwt.sign({
        _id, isAdmin
      }, secret, { expiresIn: '86400s' });
    return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user:any) {
    const schema = {
        username: Joi.string().min(5).max(50).required(),
        password: Joi.string().min(5).max(255).required(),
        name: Joi.string().max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        birthday: Joi.date().required(),
        inviteId: Joi.objectId().optional()
    };

    return Joi.validate(user, schema);
}

function validateUpdateUser(user:any) {
    const schema = {
        name: Joi.string().max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        birthday: Joi.date().required(),
        status: Joi.string().required()
    };

    return Joi.validate(user, schema);
}

export {userSchema, User, validateUser, validateUpdateUser}