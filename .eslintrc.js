// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2017
  },
  env: {
    node: true
  },
  extends: 'standard',
  
  // Custom Rules
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    
    
    /* Rob's tweaks */
    'no-unused-vars': 'warn',
    'no-trailing-spaces': [ 'error', { 'skipBlankLines': true } ]
  },
  
  // Custom globals ... don't use globals
  "globals": {
  }
}
