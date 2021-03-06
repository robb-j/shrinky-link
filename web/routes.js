const { Link, Token } = require('./models')
const Hashids = require('hashids')
const { MongoClient } = require('mongodb')

// Create a hasher to generate short ids
let hasher = new Hashids(process.env.SHRINK_KEY, 6)

// A route to redirect to the home route or fallback to the repo
exports.home = async function (req, res, next) {
  res.redirect(
    process.env.HOME_URL || 'https://github.com/robb-j/shrinky-link/'
  )
}

// A route to redirect traffic that matches a Link
exports.redirectTraffic = async function (req, res, next) {
  try {
    // Find the link
    let short = req.path.replace(/^\//, '')
    let link = await Link.findOne({ short, active: true })
    
    // Fail if not found
    if (!link) throw new Error('Short link not found :(')
    
    // Redirect to the link & end the connection
    res.redirect(link.long)
    res.end()
    
    // Update the link's uses
    await Link.update(link.id, {
      uses: link.uses + 1
    })
  } catch (error) {
    next(error)
  }
}

// A route to create a new link (requires a valid token)
exports.createLink = async function (req, res, next) {
  try {
    // Ensure a url was passed
    if (!req.body.url) throw new Error('No url passed')
    
    // Find their access token or fail
    let token = await Token.findOne({
      key: req.body.token || '', active: true
    })
    if (!token) throw new Error('Not Authorized')
    
    // Count the link to generate a unique id
    let count = await Link.count()
    
    // Store the new link
    let link = await Link.create({
      short: hasher.encode(count),
      long: req.body.url,
      creator: token.id
    })
    
    // If set, pass back a public url too
    if (process.env.PUBLIC_URL) {
      let base = process.env.PUBLIC_URL.replace(/\/$/, '')
      link.public = `${base}/${link.short}`
    }
    
    // Send back the new link
    res.send(link)
  } catch (error) {
    next({ error: error.message })
  }
}

// A route to test the health of the container
exports.health = async function (req, res, next) {
  try {
    let db = await MongoClient.connect(process.env.MONGO_URI, {
      autoReconnect: false,
      keepAlive: false,
      connectTimeoutMS: 3000,
      reconnectTries: 0
    })
    await db.close()
    res.send('healthy')
  } catch (error) {
    console.log(error)
    res.status(400).send(error.message)
  }
}
