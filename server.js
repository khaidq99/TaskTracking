require('dotenv').config()
const config = require('config');
const users = require('./routes/users');
const statuses = require('./routes/statuses');
const mongoose = require('mongoose');
const express = require('express');
const auth = require('./routes/auth');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!!!!')
})

if (!config.get('jwtPrivateKey')) {
  console.error('FATAL ERROR: jwtPrivateKey is not defined.');
  process.exit(1);
}

mongoose.connect('mongodb://localhost/task-tracking')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

app.use('/api/users', users);
app.use('/api/statuses', statuses);

app.use('/api/auth', auth);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});