const { Link, Token } = require('../../web/models')
const { expect } = require('chai')

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
