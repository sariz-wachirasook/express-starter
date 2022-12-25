const jwt = require('jsonwebtoken');
const { JWTSecret } = require('../configs/env');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send({ error: 'No authorization header provided' });

    const token = authHeader.split(' ')[1];
    const verified = jwt.verify(token, JWTSecret);

    req.user = verified;
    console.log(req.user);
    return next();
  } catch (error) {
    return res.status(401).send({ error: 'Invalid token' });
  }
};
