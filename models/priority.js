const Joi = require('joi');
const mongoose = require('mongoose');

const prioritySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    }
});

const Priority = mongoose.model('Priority', prioritySchema);

function validatePriority(priority) {
    const schema = {
        name: Joi.string().required(),
        order: Joi.number().min(0).required()
    };

    return Joi.validate(priority, schema);
}

exports.prioritySchema = prioritySchema;
exports.Priority = Priority;
exports.validate = validatePriority;