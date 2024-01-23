const Joi = require('joi');
const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
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

const Status = mongoose.model('Status', statusSchema);

function validateStatus(status) {
    const schema = {
        name: Joi.string().required(),
        order: Joi.number().min(0).required()
    };

    return Joi.validate(status, schema);
}

exports.statusSchema = statusSchema;
exports.Status = Status;
exports.validate = validateStatus;