const express = require('express');

const app = express();
const port = 8000;

const crons = require('./api/v1/crons/crons');

const authentication = require('./api/v1/routes/authentication');
const pages = require('./api/v1/routes/pages');
const users = require('./api/v1/routes/users');
const resetPassword = require('./api/v1/routes/resetPassword');

app.use(express.json());

app.use('/api/v1/auth', authentication);
app.use('/api/v1/pages', pages);
app.use('/api/v1/reset-password', resetPassword);
app.use('/api/v1/users', users);

app.get('/', (req, res) => {
  res.send({
    // auth
    '/api/v1/auth/login': 'POST',
    '/api/v1/auth/register': 'POST',
    '/api/v1/auth/refresh-token': 'POST',

    // pages
    '/api/v1/pages': 'GET, POST',
    '/api/v1/pages/import': 'POST',
    '/api/v1/pages/export': 'GET',
    '/api/v1/pages/:id': 'GET, PUT, DELETE',

    // users
    '/api/v1/users': 'GET, POST',
    '/api/v1/users/export': 'GET',
    '/api/v1/users/:id': 'GET, PUT',

    // reset password
    '/api/v1/users/reset-password': 'POST',
    '/api/v1/users/reset-password/:token': 'POST',
  });
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

// cron jobs
crons.run();
