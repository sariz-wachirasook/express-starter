const jwt = require('jsonwebtoken');
const { JWTSecret } = require('../configs/env');
const { invalidToken, noAuthHeader } = require('../messages/systemMessages');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send({ error: noAuthHeader });

    const token = authHeader.split(' ')[1];
    const verified = jwt.verify(token, JWTSecret);

    req.user = verified;

    return next();
  } catch (error) {
    return res.status(401).send({ error: invalidToken });
  }
};
