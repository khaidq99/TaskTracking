import { auth } from '../middleware/auth';
import { admin } from '../middleware/admin';
import _ from 'lodash';
import { Task, validateTask } from '../models/task';
import { Project } from '../models/project';
const express = require('express');
const router = express.Router();

router.get('/', auth, admin, async (req: any, res: any) => {
  const tasks = await Task
    .find()
    .populate('project', 'name')
    .populate('type', 'name')
    .populate('priority', 'name')
    .populate('status', 'name')
    .populate('assignee', '_id username name')
  res.send(tasks);
});

router.post('/', auth, async (req: any, res: any) => {
  const { error } = validateTask(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const project = await Project.findById(req.body.projectId);
  if (!project) return res.status(404).send('The project with the given ID was not found.');
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);

  if (!isDateInRange(startDate, project.startDate, project.endDate)) {
    return res.status(404).send('The start date must in range of project');
  }
  if (!isDateInRange(endDate, project.startDate, project.endDate)) {
    return res.status(404).send('The end date must in range of project');
  }

  // Check user permission to create task
  if (req.user.isAdmin === false) {
    if (!project.members.includes(req.user._id)) {
      return res.status(404).send('Unauthorize');
    }
  }

  let task = new Task({
    project: req.body.projectId,
    name: req.body.name,
    type: req.body.typeId,
    priority: req.body.priorityId,
    status: req.body.statusId,
    assignee: req.body.assigneeId,
    startDate: req.body.startDate,
    endDate: req.body.endDate
  });
  
  task = await task.save();
  
  res.send(task);
});

router.put('/:id', auth, async (req: any, res: any) => {
  const { error } = validateTask(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let task = await Task.findById(req.params.id);
  if (!task) return res.status(404).send('The task with the given ID was not found.');

  const project = await Project.findById(req.body.projectId);
  if (!project) return res.status(404).send('The project with the given ID was not found.');
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);

  if (!isDateInRange(startDate, project.startDate, project.endDate)) {
    return res.status(404).send('The start date must in range of project');
  }
  if (!isDateInRange(endDate, project.startDate, project.endDate)) {
    return res.status(404).send('The end date must in range of project');
  }

  // Check user permission to update task
  if (req.user.isAdmin === false) {
    if (!project.members.includes(req.user._id)) {
      return res.status(404).send('Unauthorize');
    }
  }
  
  // update
  task.project = req.body.projectId;
  task.name = req.body.name;
  task.type = req.body.typeId;
  task.priority = req.body.priorityId;
  task.status = req.body.statusId;
  task.assignee = req.body.assigneeId;
  task.startDate = req.body.startDate;
  task.endDate = req.body.endDate;
  
  task = await task.save();
  
  res.send(task);
});

router.delete('/:id', auth, async (req: any, res: any) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).send('The task with the given ID was not found.');

  // Check user permission to delete task
  if (req.user.isAdmin === false) {
    if (task.assignee.toString() !== req.user._id) {
      return res.status(404).send('Unauthorize');
    }
  }

  const result = await Task.deleteOne({ _id: req.params.id });

  res.send(result);
});

router.get('/:id', auth, admin, async (req: any, res:any) => {
  const task = await Task
    .findById(req.params.id)
    .populate('project', 'name')
    .populate('type', 'name')
    .populate('priority', 'name')
    .populate('status', 'name')
    .populate('assignee', '_id username name');

  if (!task) return res.status(404).send('The task with the given ID was not found.');

  res.send(task);
});

function isDateInRange(dateToCheck: Date, startDate: Date, endDate: Date): boolean {
  return dateToCheck >= startDate && dateToCheck <= endDate;
}

export { router as tasks };