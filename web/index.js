require('dotenv').config()

const { createServer } = require('./server')
const Otter = require('otterjs')
const { Link, Token, addInitialToken } = require('./models')

// Fail if no mongo uri was passed
if (!process.env.MONGO_URI) {
  console.error('`MONGO_URI` is not set')
  process.exit(1)
}

// Fail if no shrink key was passed
if (!process.env.SHRINK_KEY) {
  console.error('`SHRINK_KEY` is not set')
  process.exit(1)
}

;(async () => {
  // Setup Otter & register models
  let url = process.env.MONGO_URI
  await Otter.use(Otter.Plugins.MongoConnection, { url })
    .addModel(Link, Token)
    .start()
  
  // Setup Express server and listen on port 3000
  let app = createServer()
  await new Promise(resolve => app.listen(3000, resolve))
  
  // Create the initial token if needed
  await addInitialToken(process.env.INIT_TOKEN, true)
})()
