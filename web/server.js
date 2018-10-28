const path = require('path')
const fs = require('fs')

const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')

const routes = require('./routes')

exports.createServer = function (args = {}) {
  let app = express()
  
  // Trust a reverse-proxy connection
  app.set('trust proxy', 1)
  
  // Parse json bodies
  app.use(bodyParser.json())
  
  // Setup logs
  if (!args.skipLogs) {
    let logPath = path.join(__dirname, '../logs/access.log')
    let logStream = fs.createWriteStream(logPath, {flags: 'a'})
    app.use(morgan('combined', { stream: logStream }))
  }
  
  // Home route
  app.get('/', routes.home)
  
  // Health route
  app.get('/health', routes.health)
  
  // Creation endpoint
  app.post('/', routes.createLink)
  
  // Redirect endpoint
  app.get('/*', routes.redirectTraffic)
  
  // Add an error handler
  app.use((err, req, res, next) => {
    res.status(400)
    if (err instanceof Error) res.send(err.message)
    else if (typeof err === 'string') res.send(err)
    else if (typeof err === 'object') res.send(err)
    else res.send('Something went wrong')
  })
  
  return app
}
