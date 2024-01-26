import { auth } from '../middleware/auth';
import { admin } from '../middleware/admin';
import _ from 'lodash';
const { TaskType, validateTaskType } = require('../models/task-type');
const express = require('express');
const router = express.Router();

router.get('/', auth, admin, async (req: any, res: any) => {
  const listType = await TaskType.find({isHidden: false});
  res.send(listType);
});

router.post('/', auth, admin, async (req: any, res: any) => {
  const { error } = validateTaskType(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let type = new TaskType(_.pick(req.body, ['name', 'color']));
  type = await type.save();
  
  res.send(type);
});

router.put('/:id', auth, admin, async (req: any, res: any) => {
  const { error } = validateTaskType(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const type = await TaskType.findByIdAndUpdate(req.params.id, 
    { name: req.body.name, color: req.body.color }, 
    { new: true }
  );

  if (!type) return res.status(404).send('The task type with the given ID was not found.');
  
  res.send(type);
});

// router.delete('/:id', [auth], async (req: any, res: any) => {
//   const type = await TaskType.findById(req.params.id);
//   if (!type) return res.status(404).send('The task type with the given ID was not found.');

//   const result = await TaskType.deleteOne({ _id: req.params.id });

//   res.send(result);
// });

router.get('/:id', auth, admin, async (req: any, res:any) => {
  const type = await TaskType.findById(req.params.id);

  if (!type) return res.status(404).send('The task type with the given ID was not found.');

  res.send(type);
});

router.put('/:id/hidden', auth, admin, async (req: any, res: any) => {
  let type = await TaskType.findById(req.params.id);
  if (!type) return res.status(404).send('The task type with the given ID was not found.');

  type.isHidden = true;
  type = await type.save();
  
  res.send({isHidden: true});
});

export { router as taskType };