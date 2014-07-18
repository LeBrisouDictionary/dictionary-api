module.exports.word = function (req, rep) {
  var db_plugin = req.server.plugins['dictionary-rdbms'],
      models = db_plugin.models,
      Word = models.Word,
      Definition = models.Definition,
      Hyperlink = models.Hyperlink,
      Country = models.Country,
      Language = models.Language,
      Example = models.Example


  if(Object.keys(req.query).length === 1){
    return rep({result: null})
  }

  var limit = req.query.limit 
  delete req.query.limit

  var query = Object.keys(req.query).map(function(value){
    if(value === 'limit') return
    return '`Words`.' + value + ' like "' + req.query[value] + '"'
  }).join(' AND ')

  console.log(query)
  
  Word.findAll({ where : query,
    limit: limit,
    include : [
      { model : Word, as : 'Relatives'},
      { model : Word, as : 'Synonyms' },
      { model : Word, as : 'Antonyms' },
      { model : Language },
      { model : Country},
      { model : Hyperlink},
      { model : Definition, include : [Example]}
    ]})
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
      Example = models.Example

  return Word.count()
  .then(function(count){
    return Word.find({ where : {id : Math.floor((Math.random() * count) + 1)},
      include : [
        { model : Word, as : 'Relatives'},
        { model : Word, as : 'Synonyms' },
        { model : Word, as : 'Antonyms' },
        { model : Language },
        { model : Country},
        { model : Hyperlink},
        { model : Definition, include : [Example]}
      ]})
  })
  .then(function(result){
    if(!req._isBailed && !req._isReplied) {
      rep( { result: result })
    }
  })
  .catch(function(err){
    req.server.log(['catch'],result instanceof Error)
    if(!req._isBailed && !req._isReplied) {
      rep({result: 'error'})
    }
  })
}
