const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TIMEOUT = 5000; // 5 seconds
const TEMP_DIR = path.join(__dirname, '../../temp').replace(/\\/g, '/');

// Create temp dir if not exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const getDockerCommand = (language, code) => {
  const escapedCode = code.replace(/"/g, '\\"').replace(/\n/g, '\\n')
  const commands = {
    javascript: `docker run --rm --memory=50m --cpus=0.5 --network none node:18-alpine node -e "${escapedCode}"`,
    python: `docker run --rm --memory=50m --cpus=0.5 --network none python:3.11-alpine python -c "${escapedCode}"`,
    cpp: `docker run --rm --memory=50m --cpus=0.5 --network none gcc:latest sh -c "echo '${escapedCode}' > /tmp/code.cpp && g++ /tmp/code.cpp -o /tmp/out && /tmp/out"`
  }
  return commands[language]
}


exports.executeCode = async (req, res) => {
  const { code, language, roomId } = req.body;

  // Generate unique filename
  const extensions = { javascript: 'js', python: 'py', cpp: 'cpp' };
  const filename = `${uuidv4()}.${extensions[language]}`;
  const filepath = path.join(TEMP_DIR, filename);

  try {
    // Write code to temp file
    fs.writeFileSync(filepath, code);

    const dockerCommand = getDockerCommand(language, filename);

    // Execute in Docker
    const process = exec(dockerCommand, { timeout: TIMEOUT });

    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
      output += data;
    });

    process.stderr.on('data', (data) => {
      errorOutput += data;
    });

    process.on('close', (code) => {
      // Cleanup temp file
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

      if (code === null) {
        return res.status(200).json({
          output: '',
          error: 'Execution timed out after 5 seconds',
          timedOut: true
        });
      }

      res.status(200).json({
        output,
        error: errorOutput,
        exitCode: code
      });
    });

  } catch (err) {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    res.status(500).json({ message: 'Execution failed', error: err.message });
  }
};