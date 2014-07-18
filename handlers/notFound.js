var error = require('./_error_util')

module.exports = function (req, rep) {

  var Hapi = require('hapi')

  if (['get', 'post', 'put', 'delete'].indexOf(req.method) < 0) {
    rep(Hapi.error.badRequest(req.method + ' : Forbidden Http Method'))
  } else {  
	  rep(Hapi.error.notFound('Path not Found : ' + req.path))  	
  }

}
