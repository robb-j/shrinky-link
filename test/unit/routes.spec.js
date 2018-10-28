const { join } = require('path')
require('dotenv').config({ path: join(__dirname, '../.env') })

const { Link, Token } = require('../../web/models')
const { createServer } = require('../../web/server')

const { expect } = require('chai')
const supertest = require('supertest')
const Otter = require('otterjs')

let agent, token, link

beforeEach(async function () {
  // Setup a test server
  let app = createServer({ skipLogs: true })
  agent = supertest.agent(app)
  
  // Startup Otter
  await Otter.extend()
    .use(Otter.Plugins.MemoryConnection)
    .addModel(Link, Token)
    .start()
  
  // Create a token and link to test with
  token = await Token.create({ key: 'top_secret' })
  link = await Link.create({ short: 'abcdef', long: 'https://r.r0b.io' })
})

describe('#redirectTraffic', function () {
  it('should redirect', async function () {
    let res = await agent.get('/abcdef')
    expect(res.status).to.equal(302)
    expect(res.headers.location).to.equal('https://r.r0b.io')
  })
  it('should increment the link uses', async function () {
    await agent.get('/abcdef')
    await agent.get('/abcdef')
    await agent.get('/abcdef')
    
    let updatedLink = await Link.findOne(link.id)
    expect(updatedLink.uses).to.equal(3)
  })
  it('should ignore inactive links', async function () {
    await Link.create({
      short: 'ghijkl', long: 'https://t.r0b.io', active: false
    })
    
    let res = await agent.get('/ghijkl')
    expect(res.status).to.equal(400)
  })
})

describe('#createLink', function () {
  it('should succeed with http/200', async function () {
    let res = await agent.post('/')
      .send({ token: token.key, url: 'https://google.com' })
    expect(res.status).to.equal(200)
  })
  it('should create a link', async function () {
    await agent.post('/')
      .send({ token: token.key, url: 'https://google.com' })
  
    let link = await Link.findOne({ long: 'https://google.com' })
    expect(link).to.exist
    expect(link.uses).to.equal(0)
    expect(link.creator_id).to.equal(token.id)
  })
  it('should return the link', async function () {
    let res = await agent.post('/')
      .send({ token: token.key, url: 'https://google.com' })
  
    expect(res.body).to.exist
    expect(res.body.short).to.exist
    expect(res.body.long).to.equal('https://google.com')
    expect(res.body.uses).to.equal(0)
    expect(res.body.creator_id).to.equal(token.id)
  })
  it('should return json errors', async function () {
    let res = await agent.post('/')
      .send({ url: 'https://google.com' })
    expect(res.status).to.equal(400)
    expect(res.body).to.deep.equal({ error: 'Not Authorized' })
  })
  it('should ignore inactive tokens', async function () {
    await Token.create({ key: 'not_secret', active: false })
    let res = await agent.post('/')
      .send({ token: 'not_secret', url: 'https://google.com' })
    expect(res.status).to.equal(400)
    expect(res.body).to.deep.equal({ error: 'Not Authorized' })
  })
  it('should add `public` if PUBLIC_URL is set', async () => {
    let res = await agent.post('/')
      .send({ token: token.key, url: 'https://google.com' })
    expect(res.body.public).to.equal(`https://go.r0b.io/${res.body.short}`)
  })
})

describe('#home', function () {
  it('should redirect to HOME_URL', async function () {
    let res = await agent.get('/')
    expect(res.status).to.equal(302)
    expect(res.headers.location).to.equal('https://andrsn.uk/')
  })
})
