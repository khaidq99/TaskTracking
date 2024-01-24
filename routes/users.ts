const bcrypt = require('bcrypt');
import _ from 'lodash';
import { User, validateUser, generateAuthToken} from '../models/user';
import express from 'express';
import { ObjectId } from 'mongoose';
const router = express.Router();

// router.get('/me', auth, async (req, res) => {
//   const user = await User.findById(req.user._id).select('-password');
//   res.send(user);
// });

router.post('/', async (req, res) => {
    const { error } = validateUser(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ username: req.body.username });
    if (user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body, ['username', 'password', 'name', 'birthday', 'email']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = generateAuthToken(user._id as unknown as ObjectId, user.isAdmin);
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
    res.send(_.pick(user, ['_id', 'name', 'email']));
});

export { router as users };
