import { LoDashStatic } from "lodash";
const Joi = require('joi')
const bcrypt = require('bcrypt');
const _: LoDashStatic = require('lodash');
const express = require('express');
const router = express.Router();
import { User, generateAuthToken } from '../models/user'
import { ObjectId } from "mongoose";

router.post('/', async (req: any, res: any) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(400).send('Invalid username or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid username or password.');

  if (user.status === 'inactive') return res.status(401).send('User is not active.');

  const token = generateAuthToken(user._id as unknown as ObjectId, user.isAdmin);
  res.send(token);
});

function validate(req: any) {
  const schema = {
    username: Joi.string().min(5).max(50).required(),
        password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(req, schema);
}

export { router as auth };
