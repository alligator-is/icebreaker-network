var isBrowser = require('is-in-browser').default;
module.exports = isBrowser?require("./browser.js"):require('./node.js')