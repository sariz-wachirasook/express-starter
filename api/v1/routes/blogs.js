const router = require('express').Router();
const upload = require('../configs/multer');
const sharp = require('../configs/sharp');
const {
  findMany,
  create,
  dataExport,
  findUnique,
  update,
  delete: dele,
  hasResource,
  uploadBanner,
  uploadThumbnail,
} = require('../controllers/blogs');
const authMiddleware = require('../middleware/authMiddleware');
const errorHandler = require('../middleware/errorHandler');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', findMany, errorHandler);
router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMINISTRATOR'),
  create,
  errorHandler
);
router.get('/export', dataExport, errorHandler);
router.get('/:slug', findUnique, errorHandler);
router.patch(
  '/:slug',
  authMiddleware,
  roleMiddleware('ADMINISTRATOR'),
  update,
  errorHandler
);
router.delete(
  '/:slug',
  authMiddleware,
  roleMiddleware('ADMINISTRATOR'),
  dele,
  errorHandler
);

router.post(
  '/:slug/upload-banner',
  authMiddleware,
  roleMiddleware('ADMINISTRATOR'),
  hasResource,
  upload.single('file'),
  sharp,
  uploadBanner,
  errorHandler
);

router.post(
  '/:slug/upload-thumbnail',
  authMiddleware,
  roleMiddleware('ADMINISTRATOR'),
  hasResource,
  upload.single('file'),
  sharp,
  uploadThumbnail,
  errorHandler
);

module.exports = router;
