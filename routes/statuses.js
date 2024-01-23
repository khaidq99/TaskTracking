const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const _ = require('lodash');
const {Status, validate} = require('../models/status');
const express = require('express');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const listStatus = await Status.find({isHidden: false}).sort('order');
  res.send(listStatus);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let status = new Status(_.pick(req.body, ['name', 'order']));
  status = await status.save();
  
  res.send(status);
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const status = await Status.findByIdAndUpdate(req.params.id, 
    { name: req.body.name, order: req.body.order }, 
    { new: true }
  );

  if (!status) return res.status(404).send('The status with the given ID was not found.');
  
  res.send(status);
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const status = await Status.findByIdAndRemove(req.params.id);

  if (!status) return res.status(404).send('The status with the given ID was not found.');

  res.send(status);
});

router.get('/:id', async (req, res) => {
  const status = await Status.findById(req.params.id);

  if (!status) return res.status(404).send('The status with the given ID was not found.');

  res.send(status);
});

module.exports = router;