const Joi = require("joi");
import * as mongoose from 'mongoose';

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

function validateTaskType(taskType: any) {
    const schema = {
        name: Joi.string().required(),
        color: Joi.string().required()
    };

    return Joi.validate(taskType, schema);
}

export { TaskType, validateTaskType }