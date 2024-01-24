import mongoose, { ObjectId } from 'mongoose'
import jwt from 'jsonwebtoken'
import config from 'config'
const Joi = require('joi')

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
    const token = jwt.sign({ _id, isAdmin }, config.get('jwtPrivateKey'));
    return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user:any) {
    const schema = {
        username: Joi.string().min(5).max(50).required(),
        password: Joi.string().min(5).max(255).required(),
        name: Joi.string().max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        birthday: Joi.date().required()
    };

    return Joi.validate(user, schema);
}


export {userSchema, User, validateUser}