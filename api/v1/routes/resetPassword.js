const router = require('express').Router();
const {
  requestResetPassword,
  resetPassword,
} = require('../controllers/resetPassword');
const errorHandler = require('../middleware/errorHandler');

router.post('/', requestResetPassword, errorHandler);
router.post('/:token', resetPassword, errorHandler);

module.exports = router;
