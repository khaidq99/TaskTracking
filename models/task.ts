const Joi = require("joi");
import * as mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaskType"
    },
    priority: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Priority"
    },
    status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status"
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
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
        projectId: Joi.objectId().required(),
        name: Joi.string().required(),
        typeId: Joi.objectId().required(),
        priorityId: Joi.objectId().required(),
        statusId: Joi.objectId().required(),
        assigneeId: Joi.objectId().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required()
    };

    return Joi.validate(task, schema);
}

export { Task, validateTask };