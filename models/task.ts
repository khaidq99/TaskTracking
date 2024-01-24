// const { projectSchema } = require('./project');
//import { taskTypeSchema } from './task-type';
//import { projectSchema } from './project';
// const { prioritySchema } = require('./priority');
// //const { statusSchema } = require('./status');

const Joi = require("joi");
import * as mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    // project: {
    //     type: projectSchema,
    //     required: true
    // },
    name: {
        type: String,
        required: true
    },
    // type: {
    //     type: taskTypeSchema,
    //     required: true
    // },
    // priority: {
    //     type: prioritySchema,
    //     required: true
    // },
    // status: {
    //     type: statusSchema,
    //     required: true
    // },
    // assignee: {
    //     type: userSchema,
    //     required: true
    // },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
});

const Task = mongoose.model('Task', taskSchema);

function validateTask(task: any) {
    const schema = {
        username: Joi.string().min(5).max(50).required(),
        password: Joi.string().min(5).max(255).required(),
        name: Joi.string().max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        birthday: Joi.date().required()
    };

    return Joi.validate(task, schema);
}

export { taskSchema, Task, validateTask };