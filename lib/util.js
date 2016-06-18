  var URL = require('url')
  var os = require('os')
  var path = require('path')

  var util = module.exports = {
    isFunction: function (f) {
      return 'function' === typeof f
    },
    isString: function (s) {
      return typeof s === 'string'
    },
    isPlainObject: function (o) {
      return o && 'object' === typeof o && !Array.isArray(o)
    },
    isEmpty: function (obj) {
      if (obj == null) return true
      for (var key in obj)
        if (obj.hasOwnProperty(key)) return false
      return true
    },
    isWindows: function () {
      return os!=null?os.platform() === 'win32':false
    },
    parseUrl: function (s, d) {
      if (s.trim().indexOf('://') == -1) {
        s = d + '//' || 'tcp://' + s
      }
      var url = URL.parse(s, true, true)
      for (var k in url.query) {
        if (url.query[k] === 'true') {
          url.query[k] = true
        }
        if (url.query[k] === 'false') {
          url.query[k] = false

        }
      }

      var isWindows = util.isWindows;
      if (url.protocol === 'tcp+unix:' || url.protocol === 'ws+unix:') {
        if (isWindows()) {
          var p = path.parse(url.path).root;
          if (p !== '//./pipe/')
            url.path = path.join('\\\\.\\pipe', url.path);
        }
      }

      return url
    }
  }
