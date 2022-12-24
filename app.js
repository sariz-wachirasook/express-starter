const express = require('express');
const app = express();
const port = 8000;

const users = require('./api/v1/routes/users');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/v1/users', users);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
