/*jslint bitwise: true, continue: true, debug: true, devel: true, eqeq: true, evil: true, forin: true, indent: 2, maxerr: 50, maxlen: 250, node: true, nomen: true, plusplus: true, regexp: true, sloppy: true, sub: true, vars: true, es5: true */

var errorHandler = {
  validation : function (source, error, next) {
    next(error)
  },
  craft : function (err, source) {
    err.source = source
    return err
  },
  sendError: function(err, rep){
    var Hapi = require('hapi'),
        mess = require('./codes')
   

    var error = Hapi.error.badRequest(mess[err.errno] || mess[19999])
    error.output.statusCode = err.errno    // Assign a custom error errno
    error.reformat()
    error.output.payload.source  = 'LeBrisou-Backend'
    error.output.payload.error = true
    rep(error)
  },
  create: function(errno, source){
    
    var mess = require('./codes'),
        err = new Error(mess[errno]|| mess[19999])

    err.errno = errno
    err.source = source
    err.error = true
    return err
  }
}

module.exports = errorHandler

