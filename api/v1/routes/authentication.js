const router = require('express').Router();
const { login } = require('../controllers/authentication');
const errorHandler = require('../middleware/errorHandler');

router.post('/login', login, errorHandler);
router.post('/register', login, errorHandler);

module.exports = router;
