import mongoose from 'mongoose';
import { taskSchema } from './task'
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
    type: userSchema
  }],
  tasks: [{ 
    type: taskSchema
  }],
});

const Project = mongoose.model('Project', projectSchema);

function validateProject(project: any) {
  const schema = {
    title: Joi.string().min(5).max(50).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).required(),
    dailyRentalRate: Joi.number().min(0).required()
  };

  return Joi.validate(project, schema);
}

//export { projectSchema, Project, validateProject }