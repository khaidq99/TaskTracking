require('dotenv').config()
import config from 'config';
import { users } from './routes/users';
import { statuses } from './routes/statuses';
import { priorities } from './routes/priorities';
import { taskType } from './routes/task-type';
import { projects } from './routes/projects';
import { invites } from './routes/invites';
import { tasks } from './routes/tasks';
import { auth } from './routes/auth';

import mongoose from 'mongoose';
import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req: any, res: any) => {
  res.send('Hello World!!!!')
})

if (!config.get('jwtPrivateKey')) {
  console.error('FATAL ERROR: jwtPrivateKey is not defined.');
  process.exit(1);
}

mongoose.connect('mongodb://localhost/task-tracking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err: any) => console.error('Could not connect to MongoDB...'));

app.use('/api/users', users);
app.use('/api/statuses', statuses);
app.use('/api/priorities', priorities);
app.use('/api/task-type', taskType);
app.use('/api/projects', projects);
app.use('/api/invites', invites);
app.use('/api/tasks', tasks);

app.use('/api/auth', auth);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});