const Joi = require('joi');
const mongoose = require('mongoose');

const taskTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'active'
    },
    isHidden: {
        type: Boolean,
        default: false 
    }
});

const TaskType = mongoose.model('TaskType', taskTypeSchema);

function validateTaskType(taskType) {
    const schema = {
        name: Joi.string().required(),
        color: Joi.string().required()
    };

    return Joi.validate(taskType, schema);
}

exports.taskTypeSchema = taskTypeSchema;
exports.TaskType = TaskType;
exports.validate = validateTaskType;