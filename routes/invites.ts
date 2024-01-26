import { auth } from '../middleware/auth';
import { admin } from '../middleware/admin';
import _ from 'lodash';
import { Project } from '../models/project';
const { Invite, validateInvite } = require('../models/invite');
const express = require('express');
const router = express.Router();

router.get('/', auth, admin, async (req: any, res: any) => {
  const invites = await Invite
    .find();
  res.send(invites);
});

router.post('/', auth, admin, async (req: any, res: any) => {
  const { error } = validateInvite(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const projectEntity = await Project.findById(req.body.project);
  if (!projectEntity) return res.status(404).send('The project with the given ID was not found.');

  let invite = new Invite(_.pick(req.body, ['project']));
  invite.available = true;
  invite = await invite.save();
  
  res.send(invite);
});

export { router as invites };