const axios = require('axios')

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute'

const LANGUAGE_CONFIG = {
  javascript: {
    language: 'javascript',
    version: '18.15.0'
  },
  python: {
    language: 'python',
    version: '3.10.0'
  },
  cpp: {
    language: 'c++',
    version: '10.2.0'
  }
}

exports.executeCode = async (req, res) => {
  const { code, language } = req.body

  if (!code || !language) {
    return res.status(400).json({ message: 'Code and language are required' })
  }

  if (code.length > 10000) {
    return res.status(400).json({ message: 'Code too long' })
  }

  const config = LANGUAGE_CONFIG[language]
  if (!config) {
    return res.status(400).json({ message: `Unsupported language: ${language}` })
  }

  try {
    const response = await axios.post(PISTON_URL, {
      language: config.language,
      version: config.version,
      files: [
        {
          name: 'main',
          content: code
        }
      ]
    })

    const { run } = response.data

    res.status(200).json({
      output: run.stdout || '',
      error: run.stderr || '',
      exitCode: run.code
    })

  } catch (err) {
    res.status(500).json({
      message: 'Execution failed',
      error: err.message
    })
  }
}