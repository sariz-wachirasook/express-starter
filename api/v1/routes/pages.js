const router = require('express').Router();
const {
  findMany,
  create,
  dataExport,
  findUnique,
  update,
  dataImport,
  delete: dele,
} = require('../controllers/pages');
const authMiddleware = require('../middleware/authMiddleware');
const errorHandler = require('../middleware/errorHandler');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', findMany, errorHandler);
router.post('/', authMiddleware, roleMiddleware('ADMINISTRATOR'), create, errorHandler);
router.post('/import', dataImport, errorHandler);
router.get('/export', dataExport, errorHandler);
router.get('/:slug', findUnique, errorHandler);
router.patch('/:slug', authMiddleware, roleMiddleware('ADMINISTRATOR'), update, errorHandler);
router.delete('/:slug', authMiddleware, roleMiddleware('ADMINISTRATOR'), dele, errorHandler);

module.exports = router;
