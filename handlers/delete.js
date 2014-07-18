var error = require('./_error_util')

module.exports = function(req, rep){
  var db_plugin = req.server.plugins['dictionary-rdbms'],
      models = db_plugin.models,
      Word = models.Word,
      Definition = models.Definition,
      Hyperlink = models.Hyperlink,
      Country = models.Country,
      Language = models.Language,
      Example = models.Example


  if(!Object.keys(req.payload).length){
    return rep({result: null})
  }

  Word.find({ where : {id : req.payload.id }})
  .then(function(result){
    if(!result){
    } else {
      result.setCountries([])
    }
    return result
  })
  .then(function(result){
    if(!result) return
    result.setHyperlinks([])
    return result
  })
  .then(function(result){
    if(!result) return
    result.setHyperlinks([])
    return result
  })
  .then(function(result){
    if(!result) return
    result.setSynonyms([])
    return result
  })
  .then(function(result){
    if(!result) return
    result.setAntonyms([])
    return result
  })
  .then(function(result){
    if(!result) return
    result.setRelatives([])
    return result
  })
  .then(function(result){
    if(!result) return
    result.setDefinitions([])
    return result
  })
  .then(function(result){
    if(!result) return
    result.destroy()
    return result
  })
  .then(function(result){
    if(!result){
      rep({result: 'no such id'})
    } else {
      rep({ result: "success"})   
    }
  })
  .catch(function(err){
    rep(error(null, 'delete.word', err))
  })
}

