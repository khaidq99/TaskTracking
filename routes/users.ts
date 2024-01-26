const bcrypt = require('bcrypt');
import _ from 'lodash';
import { User, validateUser, generateAuthToken, validateUpdateUser } from '../models/user';
import { Project } from '../models/project';
import { Invite } from '../models/invite';
import express from 'express';
import { ObjectId } from 'mongoose';
import mongoose from 'mongoose';
import { auth } from '../middleware/auth';
import { admin } from '../middleware/admin';
import { Task } from '../models/task';
const Fawn = require('fawn');
const router = express.Router();

Fawn.init(mongoose);

router.get('/', auth, admin, async (req: any, res: any) => {
    const users = await User
        .find()
        .select("-password")
    res.send(users);
});

router.get('/:id', auth, admin, async (req: any, res: any) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('The user with the given ID was not found.');

    const projects = await Project.find({ members: mongoose.Types.ObjectId(req.params.id) });
    const tasks = await Task.find({ assignee: mongoose.Types.ObjectId(req.params.id) });

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
        })),
        tasks: tasks.map((task: any) => ({
            _id: task._id,
            name: task.name,
            startDate: task.startDate,
            endDate: task.endDate
        }))
    });
});

router.post('/', auth, async (req, res) => {
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

router.put('/:id', auth, admin, async (req: any, res: any) => {
    const { error } = validateUpdateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findByIdAndUpdate(req.params.id,
        { name: req.body.name, email: req.body.email, birthday: req.body.birthday, status: req.body.status },
        { new: true }
    );

    if (!user) return res.status(404).send('The user with the given ID was not found.');

    res.send(user);
});

router.delete('/:id', auth, admin, async (req: any, res: any) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('The user with the given ID was not found.');

    const result = await User.deleteOne({ _id: req.params.id });

    res.send(result);
});

router.get('/me/projects', auth, async (req: any, res: any) => {
    const user = await User.findById(req.user._id);

    const projects = await Project.find({ members: user._id });

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

router.get('/me/projects/:projectId', auth, async (req: any, res: any) => {
    let project = await Project
        .findById(req.params.projectId)
        .populate('members', 'username name status');

    console.log(project.members);

    if (!project) return res.status(404).send('The project with the given ID was not found.');

    const userInProject = project.members.find((member: any) => member.id === req.user._id)
    if (!userInProject) {
        return res.status(401).send('You are not allow to view detail this project.');
    }

    project.populate('members', 'username name status');

    const tasks = await Task
        .find({ project: project._id })
        .populate('type', 'name')
        .populate('priority', 'name')
        .populate('status', 'name')
        .populate('assignee', '_id username name')

    res.send({...project.toJSON(), tasks});
});

router.get('/me/tasks', auth, async (req: any, res: any) => {
    const user = await User.findById(req.user._id);

    const tasks = await Task
        .find({ assignee: user._id })
        .populate('type', 'name')
        .populate('priority', 'name')
        .populate('status', 'name');

    return res.json({
        _id: user._id,
        username: user.username,
        name: user.name,
        birthday: user.birthday,
        email: user.email,
        status: user.status,
        tasks: tasks.map((task: any) => ({
            _id: task._id,
            name: task.name,
            type: task.type,
            status: task.status,
            priority: task.priority,
            startDate: task.startDate,
            endDate: task.endDate
        }))
    });
});

// router.get('/me/projects/:projectId', auth, async (req: any, res: any) => {
//     let project = await Project
//         .findById(req.params.projectId)
//         .populate('members', 'username name status');

//     console.log(project.members);

//     if (!project) return res.status(404).send('The project was not found.');

//     const userInProject = project.members.find((member: any) => member.id === req.user._id)
//     if (!userInProject) {
//         return res.status(401).send('You are not allow to view detail this project.');
//     }

//     project.populate('members', 'username name status');

//     const tasks = await Task
//         .find({ project: project._id })
//         .populate('type', 'name')
//         .populate('priority', 'name')
//         .populate('status', 'name')
//         .populate('assignee', '_id username name')

//     res.send({...project.toJSON(), tasks});
// });

export { router as users };
