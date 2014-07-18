module.exports = function (req, rep) {
  var db_plugin = req.server.plugins['dictionary-rdbms'],
      models = db_plugin.models,
      Word = models.Word,
      Definition = models.Definition,
      Hyperlink = models.Hyperlink,
      Country = models.Country,
      Language = models.Language,
      Example = models.Example

  req.query.include = [
        { model : Word, as : 'Relatives'},
        { model : Word, as : 'Synonyms' },
        { model : Word, as : 'Antonyms' },
        { model : Language },
        { model : Country},
        { model : Hyperlink},
        { model : Definition, include : [Example]}
      ]

    
   Word.findAll(req.query)
    
    .done(function(err, result){{
      if(err){
        rep({result: 'error'})
      }
      rep( { result: result })
    }
    })
}
