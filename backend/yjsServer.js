const WebSocket = require('ws')
const http = require('http')
const { setupWSConnection } = require('y-websocket/bin/utils')

const server = http.createServer()
const wss = new WebSocket.Server({ server })

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req)
})

const PORT = process.env.YJS_PORT || 1234
server.listen(PORT, () => {
  console.log(`Yjs WebSocket server running on port ${PORT}`)
})