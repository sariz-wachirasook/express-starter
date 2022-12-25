const router = require('express').Router();
const { register, login, refreshToken } = require('../controllers/authentication');
const errorHandler = require('../middleware/errorHandler');

router.post('/login', login, errorHandler);
router.post('/register', register, errorHandler);
router.post('/refresh-token', refreshToken, errorHandler);

module.exports = router;
