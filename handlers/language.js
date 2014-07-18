module.exports.language = function (req, rep) {
  var db_plugin = req.server.plugins['dictionary-rdbms'],
      models = db_plugin.models,
      Word = models.Word,
      Definition = models.Definition,
      Hyperlink = models.Hyperlink,
      Country = models.Country,
      Language = models.Language,
      Example = models.Example

  var query = { where : {}}
  query.where.language = req.query.language
  
  if(req.query.id){
    query.where.id = req.query.id
  }

  query.limit = req.query.limit
  
  
  // query.

  Language.find(query)
  .then(function(result){
    return Word.findAll({where : {languageId: result.id }, 
      limit : req.query.limit,
      offset: req.query.offset,
      order: req.query.order,
      include : [
      { model : Word, as : 'Relatives'},
      { model : Word, as : 'Synonyms' },
      { model : Word, as : 'Antonyms' },
      { model : Language },
      { model : Country},
      { model : Hyperlink},
      { model : Definition, include : [Example]},
    ]})
  })
  .then(function(result){
    rep({ result: result })  
  })
  .catch(function(err){
    rep({result: 'error'})
  })
}


module.exports.all = function(req, rep){
  var db_plugin = req.server.plugins['dictionary-rdbms'],
      models = db_plugin.models,
      Language = models.Language


  Language.findAll({limit : req.query.limit})
    .then(function(result){
      rep({ result: result })  
    })
    .catch(function(err){
    rep({result: 'error'})
  })
}