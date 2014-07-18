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

  Word.find({ where : {id : req.payload.id },
    include : [
      { model : Word, as : 'Relatives'},
      { model : Word, as : 'Synonyms' },
      { model : Word, as : 'Antonyms' },
      { model : Language },
      { model : Country},
      { model : Hyperlink},
      { model : Definition, include : [Example]}
    ]  
  })
  .then(function(word){
    if(!word){
      rep({result: 'no such id'})
    } else {
      return word.destroy()  
    }
  })
  .then(function(result){

    rep( { result: "success"})
  })
  .catch(function(err){
    console.log(err)
    rep({result: 'error'})
  })
}

