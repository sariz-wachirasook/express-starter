const express = require('express');
const router = express.Router();
const { getAll, create, dataExport } = require('../controllers/users');
const errorHandler = require('../middleware/errorHandler');

router.get('/', getAll, errorHandler);
router.post('/', create, errorHandler);
router.get('/export', dataExport, errorHandler);

module.exports = router;
