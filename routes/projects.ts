import { auth } from '../middleware/auth';
import { admin } from '../middleware/admin';
import _ from 'lodash';
import { ObjectId } from 'mongoose';
import mongoose from 'mongoose';
const { Project, validateProject, validateAddMember } = require('../models/project');
const { Task } = require('../models/task');
const express = require('express');

const router = express.Router();

router.get('/', auth, admin, async (req: any, res: any) => {
  const projects = await Project
    .find()
    .populate('members', 'username name status')

  const response =  await Promise.all(
    projects.map(async (project:any)=> {
      const tasks = await Task
        .find({ project: mongoose.Types.ObjectId(project._id) })
        .populate('status', 'name')
        .select("name, status")
      
      return {...project.toJSON(), tasks};
    })
  )

  res.send(response);
});

router.post('/', auth, admin, async (req: any, res: any) => {
  const { error } = validateProject(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let project = new Project(_.pick(req.body, ['name', 'slug', 'startDate', 'endDate']));
  project.members = [];
  project = await project.save();
  
  res.send(project);
});

router.put('/:id', auth, admin, async (req: any, res: any) => {
  const { error } = validateProject(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const project = await Project.findByIdAndUpdate(req.params.id, 
    { name: req.body.name, slug: req.body.slug, startDate: req.body.startDate, endDate: req.body.endDate, }, 
    { new: true }
  );

  if (!project) return res.status(404).send('The project with the given ID was not found.');
  
  res.send(project);
});

router.delete('/:id', auth, admin, async (req: any, res: any) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).send('The project with the given ID was not found.');

  const result = await Project.deleteOne({ _id: req.params.id });

  res.send(result);
});

router.get('/:id', auth, admin, async (req: any, res:any) => {
  const project = await Project
    .findById(req.params.id)
    .populate('members', 'username name status');

  if (!project) return res.status(404).send('The project with the given ID was not found.');

  const tasks = await Task
    .find({ project: mongoose.Types.ObjectId(project._id) })
    .populate('project', 'name')
    .populate('type', 'name')
    .populate('priority', 'name')
    .populate('status', 'name')
    .populate('assignee', '_id username name')

  res.send({...project.toJSON(), tasks});
});

router.put('/:id/add-member', auth, admin, async (req: any, res: any) => {
  const { error } = validateAddMember(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let project = await Project.findById(req.params.id);
  if (!project) return res.status(404).send('The project with the given ID was not found.');

  project.members.push(...req.body.members);

  project = await project.save();
  
  res.send(project);
});

router.put('/:id/remove-member', auth, admin, async (req: any, res: any) => {
  const { error } = validateAddMember(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let project = await Project.findById(req.params.id);
  if (!project) return res.status(404).send('The project with the given ID was not found.');

  const memberIdsToRemove = req.body.members;
  project.members = project.members.filter((memberId: ObjectId) => !memberIdsToRemove.includes(memberId.toString()));
  project = await project.save();
  
  res.send(project);
});

export { router as projects };