var utils = require('./utils'),
  error = utils.error,
  Fields = utils.fields

module.exports.language = function (req, rep) {
  var db_plugin = req.server.plugins['dictionary-rdbms'],
    models = db_plugin.models,
    Word = models.Word,
    Definition = models.Definition,
    Hyperlink = models.Hyperlink,
    Country = models.Country,
    Language = models.Language,
    Example = models.Example,
    fields = Fields(models)

  var query = {
    where: {}
  }
  query.where.language = req.query.language

  if (req.query.id) {
    query.where.id = req.query.id
  }

  query.limit = req.query.limit


  // query.

  Language.find(query)
    .then(function (result) {
      return Word.findAll({
        where: {
          languageId: result.id
        },
        attributes: (!req.query.extended) ? fields.wordAttributes : [],
        limit: req.query.limit,
        offset: req.query.offset,
        order: req.query.order,
        include: fields[req.query.extended]
      })
    })
    .then(function (result) {
      rep({
        result: result
      })
    })
    .catch(function (err) {
      rep({
        result: 'error'
      })
    })
}


module.exports.all = function (req, rep) {
  var db_plugin = req.server.plugins['dictionary-rdbms'],
    models = db_plugin.models,
    Language = models.Language,
    fields = Fields(models)

  var query = {
    limit: req.query.limit
  }
  if (!req.query.extended) {
    query.attributes = fields.languageAttributes
  }

  Language.findAll(query)
    .then(function (result) {
      rep({
        result: result
      })
    })
    .catch(function (err) {
      rep(error(null, 'get.language', err))
    })
}