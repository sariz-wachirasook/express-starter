const { forbidden } = require('../messages/systemMessages');

// role hierarchy
const roles = {
  ADMINISTRATOR: ['ADMINISTRATOR', 'MANAGER', 'USER'], // admin can access admin, manager, and user routes
  MANAGER: ['MANAGER', 'USER'], // manager can access manager and user routes
  EMPLOYEE: ['EMPLOYEE', 'USER'], // employee can access employee and user routes
  USER: ['USER'], // user can access user routes
};

function roleMiddleware(role) {
  return (req, res, next) => {
    const { user } = req;
    if (!user) return res.status(401).send({ message: 'Unauthorized' });
    if (roles[user.role].includes(role)) return next();
    return res.status(403).send({ message: forbidden });
  };
}

module.exports = roleMiddleware;
