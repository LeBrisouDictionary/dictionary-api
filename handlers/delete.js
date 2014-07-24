var error = require('./utils').error

module.exports = function (req, rep) {
  var db_plugin = req.server.plugins['dictionary-rdbms'],
    models = db_plugin.models,
    Word = models.Word,
    Definition = models.Definition,
    Hyperlink = models.Hyperlink,
    Country = models.Country,
    Language = models.Language,
    Example = models.Example


  if (!Object.keys(req.payload).length) {
    return rep({
      result: null
    })
  }

  console.log('AAAAAAA', req.payload)

  Word.find({
    where: {
      id: req.payload.id
    }
  })
    .then(function (result) {
      if (!result) return
      result.setCountries([])
      return result
    })
    .then(function (result) {
      if (!result) return
      result.setHyperlinks([])
      return result
    })
    .then(function (result) {
      if (!result) return
      result.setHyperlinks([])
      return result
    })
    .then(function (result) {
      if (!result) return
      result.setSynonyms([])
      return result
    })
    .then(function (result) {
      if (!result) return
      result.setAntonyms([])
      return result
    })
    .then(function (result) {
      if (!result) return
      result.setRelatives([])
      return result
    })
    .then(function (result) {
      if (!result) return
      result.setDefinitions([])
      return result
    })
    .then(function (result) {
      if (!result) return
      result.destroy()
      return result
    })
    .then(function (result) {
      if (!result) {
        throw error(20009, 'Delete.Word')
      } else {
        rep({
          result: "success"
        })
      }
    })
    .catch(function (err) {
      rep(error(null, 'delete.word', err))
    })
}