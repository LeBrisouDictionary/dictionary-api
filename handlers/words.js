var utils = require('./utils'),
    error = utils.error,
    Fields = utils.fields

module.exports.all = function (req, rep) {
  var db_plugin = req.server.plugins['dictionary-rdbms'],
      models = db_plugin.models,
      Word = models.Word,
      Definition = models.Definition,
      Hyperlink = models.Hyperlink,
      Country = models.Country,
      Language = models.Language,
      Example = models.Example,
      fields = Fields(models)


  req.query.include = fields[req.query.extended]
  if(!req.query.extended){
    req.query.attributes = fields.wordAttributes
  }


  Word.findAll(req.query)
    
    .done(function(err, result){{
      if(err){
        rep(error(null, 'get.words', err))
      }
      rep( { result: result })
    }
    })
}

module.exports.count = function (req, rep) {
  var db_plugin = req.server.plugins['dictionary-rdbms'],
      models = db_plugin.models,
      Word = models.Word
      
    Word.count()
    .done(function(err, result){{
      if(err){
        rep(error(null, 'get.words', err))
      }
      rep( { result: result })
    }
    })
}
