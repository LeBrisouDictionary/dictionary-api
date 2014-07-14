var internals = {}

exports.register = function (plugin, options, next) {

  var sequelize = plugin.servers[0].plugins['dictionary-rdbms']

  plugin.bind({
  	db : sequelize.db,
  	models: sequelize.models
  })

	plugin.events.once('start', function () {

	  plugin.route(require('./routes'))
	  
	})

  next()

},{
	before: 'dictionary-rdbms'
}

exports.register.attributes = {
	name: 'dictionary-api',
  version: '0.0.1',
  pkg: require('./package.json')
}
