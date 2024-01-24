import { auth } from '../middleware/auth';
import { admin } from '../middleware/admin';
import _ from 'lodash';
const { Priority, validatePriority } = require('../models/priority');
const express = require('express');
const router = express.Router();

router.get('/', auth, async (req: any, res: any) => {
  const priorities = await Priority.find({isHidden: false}).sort('order');
  res.send(priorities);
});

router.post('/', auth, async (req: any, res: any) => {
  const { error } = validatePriority(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let priority = new Priority(_.pick(req.body, ['name', 'order']));
  priority = await priority.save();
  
  res.send(priority);
});

router.put('/:id', async (req: any, res: any) => {
  const { error } = validatePriority(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const priority = await Priority.findByIdAndUpdate(req.params.id, 
    { name: req.body.name, order: req.body.order }, 
    { new: true }
  );

  if (!priority) return res.status(404).send('The priority with the given ID was not found.');
  
  res.send(priority);
});

router.delete('/:id', [auth], async (req: any, res: any) => {
  const priority = await Priority.findById(req.params.id);
  if (!priority) return res.status(404).send('The priority with the given ID was not found.');

  const result = await Priority.deleteOne({ _id: req.params.id });

  res.send(result);
});

router.get('/:id', async (req: any, res:any) => {
  const priority = await Priority.findById(req.params.id);

  if (!priority) return res.status(404).send('The priority with the given ID was not found.');

  res.send(priority);
});

router.put('/:id/hidden', async (req: any, res: any) => {
  let priority = await Priority.findById(req.params.id);
  if (!priority) return res.status(404).send('The priority with the given ID was not found.');

  priority.isHidden = true;
  priority = await priority.save();
  
  res.send({isHidden: true});
});

export { router as priorities };