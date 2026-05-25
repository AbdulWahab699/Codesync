const Docker = require('dockerode')
const docker = new Docker()

const LANGUAGE_CONFIG = {
  javascript: {
    image: 'node:18-alpine',
    filename: 'code.js',
    cmd: (filename) => ['node', filename]
  },
  python: {
    image: 'python:3.11-alpine',
    filename: 'code.py',
    cmd: (filename) => ['python', filename]
  },
  cpp: {
    image: 'gcc:latest',
    filename: 'code.cpp',
    cmd: (filename) => ['sh', '-c', `g++ -o /tmp/out ${filename} && /tmp/out`]
  }
}

const executeCode = async (code, language) => {
  const config = LANGUAGE_CONFIG[language]

  if (!config) {
    throw new Error(`Unsupported language: ${language}`)
  }

  return new Promise(async (resolve, reject) => {
    try {
      // Pull image if not available
      await pullImageIfNeeded(config.image)

      const container = await docker.createContainer({
        Image: config.image,
        Cmd: config.cmd(`/tmp/${config.filename}`),
        HostConfig: {
          Memory: 50 * 1024 * 1024,      // 50MB memory limit
          CpuPeriod: 100000,
          CpuQuota: 50000,                // 50% CPU limit
          NetworkMode: 'none',            // No internet access
          AutoRemove: true               // Auto delete container after run
        },
        WorkingDir: '/tmp',
        Tty: false,
        AttachStdout: true,
        AttachStderr: true
      })

      // Write code into container
      await container.putArchive(
        createTarFromCode(code, config.filename),
        { path: '/tmp' }
      )

      // Start container
      await container.start()

      // Set timeout — kill after 5 seconds
      const timeout = setTimeout(async () => {
        try {
          await container.kill()
          resolve({ output: 'Error: Execution timed out (5s limit)', error: true })
        } catch (e) {}
      }, 5000)

      // Get output
      const logs = await container.logs({
        follow: true,
        stdout: true,
        stderr: true
      })

      let output = ''
      logs.on('data', (chunk) => {
        output += chunk.toString('utf8').slice(8) // strip docker header bytes
      })

      logs.on('end', () => {
        clearTimeout(timeout)
        resolve({ output: output.trim(), error: false })
      })

    } catch (err) {
      reject(err)
    }
  })
}

const pullImageIfNeeded = (image) => {
  return new Promise((resolve, reject) => {
    docker.pull(image, (err, stream) => {
      if (err) return resolve() // image might already exist locally
      docker.modem.followProgress(stream, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  })
}

const createTarFromCode = (code, filename) => {
  const tar = require('tar-stream')
  const pack = tar.pack()
  pack.entry({ name: filename }, code)
  pack.finalize()
  return pack
}

module.exports = { executeCode }