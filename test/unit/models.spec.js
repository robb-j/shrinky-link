const { Link, Token, addInitialToken } = require('../../web/models')
const { expect } = require('chai')
const Otter = require('otterjs')

describe('Link', function () {
  it('should exist', async function () {
    expect(Link).to.exist
  })
})

describe('Token', function () {
  it('should exist', async function () {
    expect(Token).to.exist
  })
})

describe('#addInitialToken', () => {
  beforeEach(async () => {
    await Otter.extend()
      .use(Otter.Plugins.MemoryConnection)
      .addModel(Link, Token)
      .start()
  })
  it('should add the token', async () => {
    await addInitialToken('my_secret')
    
    let token = await Token.findOne({ key: 'my_secret' })
    expect(token.key).to.equal('my_secret')
    expect(token.active).to.equal(true)
  })
  it('should not add the token if it exists', async () => {
    await Token.create({ key: 'my_secret' })
    await addInitialToken('my_secret')
    
    let tokens = await Token.count()
    expect(tokens).to.equal(1)
  })
})
