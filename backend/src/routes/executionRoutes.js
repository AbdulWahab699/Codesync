const express = require('express')
const router = express.Router()
const { executeCode } = require('../controllers/executionController')
const protect = require('../middlewares/authMiddleware')

router.post('/run', protect, executeCode)

module.exports = router