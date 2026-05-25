const express = require('express')
const router = express.Router()
const { executeCode } = require('../services/codeExecutor')
const protect = require('../middlewares/authMiddleware')

router.post('/run', protect, async (req, res) => {
  try {
    const { code, language, roomId } = req.body

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' })
    }

    if (code.length > 10000) {
      return res.status(400).json({ message: 'Code too long' })
    }

    const result = await executeCode(code, language)
    res.status(200).json(result)

  } catch (err) {
    res.status(500).json({ message: 'Execution failed', error: err.message })
  }
})

module.exports = router