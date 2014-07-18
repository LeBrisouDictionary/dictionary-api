var internals = {}

exports.register = function (plugin, options, next) {
  // var Bcrypt = require('bcrypt')

  // // plugin.dependency('dictionary-rdbms')

  // // plugin.register(require('hapi-auth-basic'), function(err) {
  // //   if (err){
  // //     console.log(err)
  // //   }
  // // })

  // // var users = {
  // //     test: {
  // //         user: 'test'
  // //     },
  // //     erol: {
  // //         user: 'erol'
  // //     }
  // // }

  // // var validate = function (username, password, callback) {

  // //     Bcrypt.compare(password, passwords[username], function (err, isValid) {
  // //       if(err){
  // //         log.error(err)
  // //       }
  // //       callback(null, isValid, users[username])
  // //     })
  // // }
  // // //must be called before adding routes
  // // plugin.auth.scheme({ strategies: ['basic'] } , validate)
  // // plugin.auth.strategy('basic', 'basic', { validateFunc: validate }, true)
    
  
	plugin.route(require('./routes'))

	next()



}

exports.register.attributes = {
	name: 'dictionary-api',
  version: '0.0.1',
  pkg: require('./package.json')
}
