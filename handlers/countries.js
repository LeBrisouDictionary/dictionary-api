
module.exports.all = function(req, rep){
  var db_plugin = req.server.plugins['dictionary-rdbms'],
      models = db_plugin.models,
      Country = models.Country


  Country.findAll({limit : req.query.limit})
    .then(function(result){
      rep({ result: result })  
    })
    .catch(function(err){
    rep({result: 'error'})
  })
}