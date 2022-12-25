const express = require('express');

const app = express();
const port = 8000;

const users = require('./api/v1/routes/users');
const authentication = require('./api/v1/routes/authentication');

app.use(express.json());

app.use('/api/v1/auth', authentication);
app.use('/api/v1/users', users);

app.get('/', (req, res) => {
  res.send({
    '/api/v1/auth/login': 'POST',
    '/api/v1/auth/register': 'POST',

    '/api/v1/users': 'GET, POST',
    '/api/v1/users/export': 'GET',
    '/api/v1/users/:id': 'GET, PUT, DELETE',
  });
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
