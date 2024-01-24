
const Joi = require("joi");
import mongoose from 'mongoose';

const prioritySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    isHidden: {
        type: Boolean,
        default: false 
    }
});

const Priority = mongoose.model('Priority', prioritySchema);

function validatePriority(priority: any) {
    const schema = {
        name: Joi.string().required(),
        order: Joi.number().min(0).required()
    };

    return Joi.validate(priority, schema);
}

export { Priority, validatePriority }