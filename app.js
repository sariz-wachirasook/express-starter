const express = require('express');
const app = express();
const port = 8000;

const users = require('./api/v1/routes/users');

app.use(express.json());

app.use('/api/v1/users', users);

app.get('/', (req, res) => {
  res.send({
    '/api/v1/users': 'GET, POST',
    '/api/v1/users/:id': 'GET, PUT, DELETE',
    '/api/v1/users/export': 'GET',
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
