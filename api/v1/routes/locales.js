const router = require('express').Router();
const {
  findMany,
  create,
  findUnique,
  update,
} = require('../controllers/locales');
const authMiddleware = require('../middleware/authMiddleware');
const errorHandler = require('../middleware/errorHandler');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get(
  '/',
  authMiddleware,
  roleMiddleware('ADMINISTRATOR'),
  findMany,
  errorHandler
);
router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMINISTRATOR'),
  create,
  errorHandler
);
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMINISTRATOR'),
  findUnique,
  errorHandler
);
router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMINISTRATOR'),
  update,
  errorHandler
);
// router.delete('/:id', authMiddleware, roleMiddleware('USER'), requestSoftDelete, errorHandler);

module.exports = router;
