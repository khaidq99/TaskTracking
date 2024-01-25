import mongoose from 'mongoose';
import { Project } from './project'
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi)

const inviteSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Project
  },
  available: {
    type: Boolean,
    default: false
  }
});

const Invite = mongoose.model('Invite', inviteSchema);

function validateInvite(invite: any) {
  const schema = {
    project: Joi.objectId().required()
  };

  return Joi.validate(invite, schema);
}

export { Invite, validateInvite }