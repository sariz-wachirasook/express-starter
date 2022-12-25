const router = require('express').Router();
const { register, login } = require('../controllers/authentication');
const errorHandler = require('../middleware/errorHandler');

router.post('/login', login, errorHandler);
router.post('/register', register, errorHandler);

module.exports = router;
