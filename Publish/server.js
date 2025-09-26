const express = require('express')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const nextApp = next({ dev, hostname, port })
const handle = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
  const server = express()

  // Respect X-Forwarded-* headers when behind IIS/reverse proxy
  server.set('trust proxy', true)

  // Let Next.js handle all requests
  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
    .on('error', (err) => {
      console.error(err)
      process.exit(1)
    })
})



