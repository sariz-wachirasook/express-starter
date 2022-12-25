const roles = ['ADMINISTRATOR', 'USER'];

function roleMiddleware(role) {
  return (req, res, next) => {
    if (req.user && req.user.role && roles.includes(req.user.role)) {
      if (req.user.role === role) {
        next();
      } else {
        res.status(401).send({ error: 'Unauthorized' });
      }
    } else {
      res.status(401).send({ error: 'Unauthorized' });
    }
  };
}

module.exports = roleMiddleware;
