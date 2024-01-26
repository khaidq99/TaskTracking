import { auth } from '../middleware/auth';
import { admin } from '../middleware/admin';
import _ from 'lodash';
const { Status, validate } = require('../models/status');
const express = require('express');
const router = express.Router();

router.get('/', auth, admin, async (req: any, res: any) => {
  const listStatus = await Status.find({isHidden: false}).sort('order');
  res.send(listStatus);
});

router.post('/', auth, admin, async (req: any, res: any) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let status = new Status(_.pick(req.body, ['name', 'order']));
  status = await status.save();
  
  res.send(status);
});

router.put('/:id', auth, admin, async (req: any, res: any) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const status = await Status.findByIdAndUpdate(req.params.id, 
    { name: req.body.name, order: req.body.order }, 
    { new: true }
  );

  if (!status) return res.status(404).send('The status with the given ID was not found.');
  
  res.send(status);
});

router.delete('/:id', auth, admin, async (req: any, res: any) => {
  const status = await Status.findById(req.params.id);
  if (!status) return res.status(404).send('The status with the given ID was not found.');

  const result = await Status.deleteOne({ _id: req.params.id });

  res.send(result);
});

router.get('/:id', auth, admin, async (req: any, res:any) => {
  const status = await Status.findById(req.params.id);

  if (!status) return res.status(404).send('The status with the given ID was not found.');

  res.send(status);
});

router.put('/:id/hidden', auth, admin, async (req: any, res: any) => {
  let status = await Status.findById(req.params.id);
  if (!status) return res.status(404).send('The status with the given ID was not found.');

  status.isHidden = true;
  status = await status.save();
  
  res.send({isHidden: true});
});

export { router as statuses };