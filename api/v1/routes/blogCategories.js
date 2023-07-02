const router = require('express').Router()
const { findMany, create, findUnique, update, delete: dele } = require('../controllers/blogCategories')
const authMiddleware = require('../middleware/authMiddleware')
const errorHandler = require('../middleware/errorHandler')
const roleMiddleware = require('../middleware/roleMiddleware')

router.get('/', findMany, errorHandler)
router.post('/', authMiddleware, roleMiddleware('ADMINISTRATOR'), create, errorHandler)
router.get('/:slug', findUnique, errorHandler)
router.patch('/:slug', authMiddleware, roleMiddleware('ADMINISTRATOR'), update, errorHandler)
router.delete('/:slug', authMiddleware, roleMiddleware('ADMINISTRATOR'), dele, errorHandler)

module.exports = router
