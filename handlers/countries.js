var utils = require('./utils'),
    error = utils.error,
    Fields = utils.fields

module.exports.all = function(req, rep){
  var db_plugin = req.server.plugins['dictionary-rdbms'],
      models = db_plugin.models,
      Country = models.Country,
      fields = Fields(models)

  var query = { limit : req.query.limit }
  if(!req.query.extended){
    query.attributes = fields.countryAttributes 
  }

  Country.findAll(query)
  .then(function(result){
    rep({ result: result })  
  })
  .catch(function(err){
    rep(error(null, 'get.countries', err))
  })
}