const Otter = require('otterjs')

/** A url being short-linked to */
exports.Link = class Link extends Otter.Types.Model {
  static attributes () {
    return {
      short: { type: String },
      long: { type: String },
      uses: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
      creator: { hasOne: 'Token' }
    }
  }
}

/** A token used to create new links */
exports.Token = class Token extends Otter.Types.Model {
  static attributes () {
    return {
      key: { type: String },
      active: { type: Boolean, default: true },
      links: { hasMany: 'Link via creator' }
    }
  }
}

exports.addInitialToken = async function (key, log = false) {
  // Stop if no key is passed
  if (!key) return
  
  // Stop if the token already exists
  if (await exports.Token.count({ key }) > 0) return
  
  // If unique, create the token
  await exports.Token.create({ key })
  if (log) console.info(`Created initial token using 'INIT_TOKEN'`)
}
