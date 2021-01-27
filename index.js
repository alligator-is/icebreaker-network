var isBrowser = require('is-browser')
module.exports = isBrowser?require("./browser.js"):require('./node.js')