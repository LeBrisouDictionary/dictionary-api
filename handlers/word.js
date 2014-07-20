var utils = require('./utils'),
    error = utils.error,
    Fields = utils.fields

module.exports.word = function (req, rep) {
  var db_plugin = req.server.plugins['dictionary-rdbms'],
      models = db_plugin.models,
      Word = models.Word,
      Definition = models.Definition,
      Hyperlink = models.Hyperlink,
      Country = models.Country,
      Language = models.Language,
      Example = models.Example,
      fields = Fields(models)

  if(Object.keys(req.query).length === 2){
    return rep({result: null})
  }

  var limit = req.query.limit 
  delete req.query.limit

  var extended = req.query.extended 
  delete req.query.extended

  var query = {}
  query.where = Object.keys(req.query).map(function(value){
    return '`Words`.' + value + ' like "' + req.query[value] + '"'
  }).join(' AND ')

  
  query.include = fields[extended]
  if(!extended){
    query.attributes = fields.wordAttributes 
  }
  query.limit = limit

  Word.findAll(query)
  .then(function(result){
    rep( { result: result })
  })
  .catch(function(err){
    console.log(err)
    rep({result: 'error'})
  })
}

module.exports.random = function (req, rep) {
  var db_plugin = req.server.plugins['dictionary-rdbms'],
      models = db_plugin.models,
      Word = models.Word,
      Definition = models.Definition,
      Hyperlink = models.Hyperlink,
      Country = models.Country,
      Language = models.Language,
      Example = models.Example,
      fields = Fields(models)

  var query = {  }

  query.include = fields[req.query.extended]
  if(!req.query.extended){
    query.attributes = fields.wordAttributes 
  }

  return Word.count()
  .then(function(count){
    query.where = { id : Math.floor((Math.random() * count) + 1) }
    
    return Word.find(query)
  })
  .then(function(result){
    if(!req._isBailed && !req._isReplied) {
      rep( { result: result })
    }
  })
  .catch(function(err){
    req.server.log(['catch'],result instanceof Error)
    if(!req._isBailed && !req._isReplied) {
      rep(error(null, 'get.word', err))
    }
  })
}
