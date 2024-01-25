const bcrypt = require('bcrypt');
import _ from 'lodash';
import { User, validateUser, generateAuthToken, validateUpdateUser } from '../models/user';
import { Project } from '../models/project';
import { Invite } from '../models/invite';
import express from 'express';
import { ObjectId } from 'mongoose';
import mongoose from 'mongoose';
const Fawn = require('fawn');
const router = express.Router();

Fawn.init(mongoose);

// router.get('/me', auth, async (req, res) => {
//   const user = await User.findById(req.user._id).select('-password');
//   res.send(user);
// });

router.get('/', async (req: any, res: any) => {
    const users = await User
        .find()
        .select("-password")
    res.send(users);
});

router.get('/:id', async (req: any, res: any) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('The user with the given ID was not found.');

    console.log(1);

    const projects = await Project.find({ members: mongoose.Types.ObjectId(req.params.id) });

    console.log(2);
    return res.json({
        _id: user._id,
        username: user.username,
        name: user.name,
        birthday: user.birthday,
        email: user.email,
        status: user.status,
        projects: projects.map((project: any) => ({
            _id: project._id,
            name: project.name,
            slug: project.slug,
            start_date: project.start_date,
            end_date: project.end_date
        }))
    });
});

router.post('/', async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ username: req.body.username });
    if (user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body, ['username', 'password', 'name', 'birthday', 'email']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const inviteId = req.body.inviteId;

    if (inviteId) {
        let invite = await Invite.findById(inviteId);
        if (!invite) return res.status(404).send('The invite with the given ID was not found.');

        if (invite.available === false) return res.status(404).send('The invite was in used');

        let projectEntity = await Project.findById(invite.project);
        if (!projectEntity) return res.status(404).send('The project does not exist');

        try {
            new Fawn.Task()
                .save('users', user)
                .update('projects', { _id: invite.project }, {
                    $push: { "members": user._id }
                })
                .update('invites', { _id: invite._id }, {
                    $set: { available: false }
                })
                .run();

        } catch (ex) {
            res.status(500).send('Something failed.');
        }
    } else {
        await user.save();
    }

    const token = generateAuthToken(user._id as unknown as ObjectId, user.isAdmin);
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});

router.put('/:id', async (req: any, res: any) => {
    const { error } = validateUpdateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findByIdAndUpdate(req.params.id,
        { name: req.body.name, email: req.body.email, birthday: req.body.birthday, status: req.body.status },
        { new: true }
    );

    if (!user) return res.status(404).send('The user with the given ID was not found.');

    res.send(user);
});

router.delete('/:id', async (req: any, res: any) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('The user with the given ID was not found.');

    const result = await User.deleteOne({ _id: req.params.id });

    res.send(result);
});

export { router as users };
