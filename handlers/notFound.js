
module.exports = function (req, rep) {

  var Hapi = require('hapi')



  if (['get', 'post', 'put', 'delete'].indexOf(req.method) < 0) {
    req.log(['dictionary-api', 'error', 'query'],req.id + ' - ' + req.method + ' : Forbidden Http Method'
    )
    
    rep(Hapi.error.badRequest(req.method + ' : Forbidden Http Method'))

  } else {

	  req.log(['dictionary-api', 'error', 'query'],req.id + ' - Requested path not found : ' + req.path)
	  
	  rep(Hapi.error.notFound('Path not Found : ' + req.path))  	
  }

}
