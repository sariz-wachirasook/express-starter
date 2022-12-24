const router = require('express').Router();
const { getAll, create, dataExport, getOne, update } = require('../controllers/users');
const errorHandler = require('../middleware/errorHandler');

router.get('/', getAll, errorHandler);
router.get('/export', dataExport, errorHandler);
router.post('/', create, errorHandler);
router.get('/:id', getOne, errorHandler);
router.patch('/:id', update, errorHandler);

module.exports = router;
