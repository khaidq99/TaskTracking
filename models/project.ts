import mongoose from 'mongoose';
import { User } from './user'
const Joi = require("joi");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  }]
});

const Project = mongoose.model('Project', projectSchema);

function validateProject(project: any) {
  const schema = {
    name: Joi.string().required(),
    slug: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required()
  };

  return Joi.validate(project, schema);
}

function validateAddMember(members: any) {
  const schema = {
    members: Joi.array().required()
  };

  return Joi.validate(members, schema);
}

export { Project, validateProject, validateAddMember }