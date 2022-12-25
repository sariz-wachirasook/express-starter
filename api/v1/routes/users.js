const router = require('express').Router();
const { getAll, create, dataExport, getOne, update } = require('../controllers/users');
const authMiddleware = require('../middleware/authMiddleware');
const errorHandler = require('../middleware/errorHandler');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware('ADMINISTRATOR'), getAll, errorHandler);
router.get('/export', authMiddleware, dataExport, errorHandler);
router.post('/', authMiddleware, create, errorHandler);
router.get('/:id', authMiddleware, getOne, errorHandler);
router.patch('/:id', authMiddleware, update, errorHandler);

module.exports = router;
