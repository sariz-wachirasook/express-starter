const router = require('express').Router()
const { findMany, create, dataExport, findUnique, update, requestSoftDelete } = require('../controllers/users')
const authMiddleware = require('../middleware/authMiddleware')
const errorHandler = require('../middleware/errorHandler')
const roleMiddleware = require('../middleware/roleMiddleware')

router.get('/', authMiddleware, roleMiddleware('ADMINISTRATOR'), findMany, errorHandler)
router.get('/export', authMiddleware, roleMiddleware('ADMINISTRATOR'), dataExport, errorHandler)
router.post('/', authMiddleware, roleMiddleware('ADMINISTRATOR'), create, errorHandler)
router.get('/:id', authMiddleware, roleMiddleware('USER'), findUnique, errorHandler)
router.delete('/:id/delete', authMiddleware, roleMiddleware('USER'), requestSoftDelete, errorHandler)
router.patch('/:id', authMiddleware, roleMiddleware('USER'), update, errorHandler)

module.exports = router
