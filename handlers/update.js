/*jslint bitwise: true, continue: true, debug: true, devel: true, eqeq: true, evil: true, forin: true, indent: 2, maxerr: 50, maxlen: 250, node: true, nomen: true, plusplus: true, regexp: true, sloppy: true, sub: true, vars: true, es5: true */

var Promise = require('bluebird'),
  error = require('./utils').error

var update = function (req, rep) {
  var db_plugin = req.server.plugins['dictionary-rdbms'],
    S = db_plugin.db,
    models = db_plugin.models,
    p = req.payload,
    Word = models.Word,
    Definition = models.Definition,
    Hyperlink = models.Hyperlink,
    Country = models.Country,
    Language = models.Language,
    Example = models.Example


  S.transaction({
    isolationLevel: "REPEATABLE READ",
    autocommit: false
  }, function (t) {
    req.log(['dictionary-api', 'info', 'query'], 'Transaction begin Successfully')

    var tempDefinitionsObjects = []

    function zipObjectsValues(arrays, fields) {
      arrays = arrays.map(function (n) {
        return ['"' + n.lema + '"', '"' + n.pos + '"']
      })
      var s = arrays[0].map(function (_, i) {
        return arrays.map(function (array) {
          return array[i]
        })
      })

      var res = ''

      for (var i = 0; i < s.length; i++) {
        var e = s[i]
        res += fields[i] + ' IN (' + e + ') '
        res += (i < s.length - 1) ? ' AND ' : ''
      }
      return res
    }

    function checkIfEqualWord(array, word) {

      if (!(array instanceof Object)) {
        throw error(500, "add.checkIfEqualWord")
      }

      for (var i = 0; i < array.length; i++) {
        var entry = array[i].dataValues
        console.log('AAAAAAAAAAA', entry, word.dataValues, word.id, entry.id)
        if (entry.id === word.id) {
          return true
        }
      }
      return false
    }

    function MyCommit() {
      this.commit().error(function (err) {
        if (err) {
          req.log(['dictionary-api', 'error', 'query'], "Error Committing : ", err)
          rep(error(null, 'update.commit', err))

        }

      }).success(function () {
        req.log(['dictionary-api', 'info', 'query'], "Commit Successfull")
        p.success = true
        rep(p)
      })
    }

    function MyRollback(prev_err) {

      this.rollback().error(function (err) {
        req.log(['dictionary-api', 'error', 'query'], 'Error Rollback : ', err)
        throw error(null, 'update.rollback', err)
      }).success(function () {
        req.log(['dictionary-api', 'warn', 'query'], 'Rollback Success')
        req.log(['dictionary-api', 'warn', 'query'], prev_err)
        p.success = false
        p.rollback = true
        throw error(null, 'update.rollback', prev_err)
      })
    }



    function updateDefinitions() {
      if (p.definitions) {
        req.log(['dictionary-api', 'debug', 'query'], 'Updating Definitions')
        return Promise.resolve(p.definitions).each(function (definition) {
          return updateDefinition(definition)
        })

      } else {
        return Promise.resolve()
      }
    }

    function updateDefinition(definition) {
      return Definition.find({
          where: {
            id: definition.id
          }
        }, {
          lock: "UPDATE",
          transaction: t
        })
        .then(function (definitionObj) {
          if (definitionObj === null) {
            req.log(['dictionary-api', 'debug', 'query'], 'Definition ' + definition.id + ' not Found')
            throw error(20002, 'update.updateDefinition.notFound')
          }
          req.log(['dictionary-api', 'debug', 'query'], 'Definition ' + definitionObj.id + ' Found')

          return definitionObj.updateAttributes({
            definition: definition.definition
          }, {
            lock: "UPDATE",
            transaction: t
          })
        })
        .then(function (definitionObj) {
          return updateExamples(definition.examples)
        })
    }

    function updateExamples(examples) {
      if (examples) {
        req.log(['dictionary-api', 'debug', 'query'], 'Updating Examples')
        var promise = Promise.defer()
        return Promise.resolve(examples).each(function (example) {
          return Example.find({
              where: {
                id: example.id
              }
            })
            .then(function (exampleObj) {
              if (exampleObj === null) {
                req.log(['dictionary-api', 'debug', 'query'], 'Example ' + example.id + ' not Found')
                throw error(20006, 'update.updateExamples.notFound')
              }
              return exampleObj.updateAttributes({
                example: example.example
              }, {
                lock: "UPDATE",
                transaction: t
              })
            })
        })
      }
    }


    var updateCountries = function (wordObj) {
      if (p.countries) {
        return p.countries.reduce(function (next, country) {
          return next
            .then(function () {
              return Country.find({
                where: {
                  id: country.id
                }
              }, {
                transaction: t
              })
            })
            .then(function (countryObj) {
              if (countryObj === null) {
                throw error(20003, 'add.updateCountries.find.NotFound')
              }
              req.log(['dictionary-api', 'debug', 'query'], 'Country Found id : ' + countryObj.id)

              return wordObj.setCountries([countryObj], {
                frequency: country.frequency,
                lock: "UPDATE",
                transaction: t
              })
            })
            .then(function () {
              return wordObj
            })
        }, Promise.resolve())
      } else {
        return wordObj
      }
    }



    function updateHyperlinks(wordObj) {
      if (p.hyperlinks) {
        req.log(['dictionary-api', 'debug', 'query'], 'Updating Hyperlinks')
        return p.hyperlinks.reduce(function (next, hyperlink) {
          return next
            .then(function () {
              return Hyperlink.find({
                where: {
                  id: hyperlink.id,
                  wordId: wordObj.id
                }
              }, {
                transaction: t
              })
            })
            .then(function (hyperlinkObj) {
              if (hyperlinkObj === null) {
                throw error(20008, 'add.updateHyperlinks.find.NotFound')
              }
              req.log(['dictionary-api', 'debug', 'query'], 'Hyperlink Found id : ' + hyperlinkObj.id)

              return hyperlinkObj.updateAttributes({
                hyperlink: hyperlink
              }, {
                lock: "UPDATE",
                transaction: t
              })
            })
            .then(function () {
              return wordObj
            })
        }, Promise.resolve())
      } else {
        return wordObj
      }
    }


    function updateLanguage(wordObj) {
      if (p.language) {
        req.log(['dictionary-api', 'debug', 'query'], "Updating Language")
        return Language.find({
            where: {
              language: p.language
            }
          })
          .then(function (languageObj) {
            if (languageObj === null) {
              throw error(20001, 'update.updateLanguage.NotFound')
            }
            req.log(['dictionary-api', 'debug', 'query'], 'Language found id : ' + languageObj.id)
            return wordObj.setLanguage(languageObj, {
              transaction: t
            })
          })
          .then(function () {
            req.log(['dictionary-api', 'debug', 'query'], 'new language set on Word : ' + wordObj.id)
          })
      } else {
        return wordObj
      }
    }

    function findWord() {
      return Word.find({
          where: {
            id: p.wordId
          }
        })
        .then(function (wordObj) {
          if (wordObj === null) {
            throw error(20000, 'update.findWord')
          }
          return wordObj
        })
    }

    function updateWord(wordObj) {
      if (p.gerund && p.participle) {
        return wordObj.updateAttributes({
          gerund: p.gerund,
          participle: p.participle
        }, {
          transaction: t
        })
      } else if (p.gerund) {
        return wordObj.updateAttributes({
          gerund: p.gerund
        }, {
          transaction: t
        })
      } else if (p.participle) {
        return wordObj.updateAttributes({
          participle: p.participle
        }, {
          transaction: t
        })
      } else {
        return wordObj
      }
    }

    function updateSynonyms(wordObj) {
      if (p.synonyms) {
        req.log(['dictionary-api', 'debug', 'query'], 'Updating Synonyms')
        return Word.findAll({
            where: ["id IN (" + p.synonyms.map(function (n) {
              return n.id
            }).join(',') + ")"]
          }, {
            transaction: t
          })
          .then(function (synonymsObj) {
            //console.log(synonymsObj.map(function(n){ return n.values}))
            if (synonymsObj === null || synonymsObj.length !== p.synonyms.length) {
              throw error(20004, 'update.updateSynonyms.find.NotFound')
            }
            if (checkIfEqualWord(synonymsObj, wordObj)) {
              throw error(20050, 'update.Synonyms')
            }


            if (wordObj.hasSynonyms(synonymsObj)) {
              throw error(20057, 'update.Synonyms')
            }

            req.log(['dictionary-api', 'debug', 'query'], 'Synonym(s) Found')

            return wordObj.setSynonyms(synonymsObj, {
              lock: "UPDATE",
              transaction: t
            })
          })
          .then(function () {
            return wordObj
          })
      } else {
        return wordObj
      }
    }

    function updateAntonyms(wordObj) {
      if (p.antonyms) {
        req.log(['dictionary-api', 'debug', 'query'], 'Updating Antonyms')
        return Word.findAll({
            where: ["id IN (" + p.antonyms.map(function (n) {
              return n.id
            }).join(',') + ")"]
          }, {
            transaction: t
          })
          .then(function (antonymsObj) {
            //console.log(antonymsObj.map(function(n){ return n.values}))
            if (antonymsObj === null || antonymsObj.length !== p.antonyms.length) {
              throw error(20005, 'update.updateAntonyms.find.NotFound')
            }

            if (checkIfEqualWord(antonymsObj, wordObj)) {
              throw error(20051, 'update.Antonyms')
            }

            return wordObj.hasAntonyms(antonymsObj)
              .success(function (result) {
                console.log("result", result)
                if (result) {
                  throw error(20058, 'update.Antonyms')
                } else {
                  return wordObj.setAntonyms(antonymsObj, {
                    lock: "UPDATE",
                    transaction: t
                  })
                }
              })
          })
          .then(function () {
            return wordObj
          })
      } else {
        return wordObj
      }
    }

    function updateRelatives(wordObj) {
      if (p.relatives) {
        req.log(['dictionary-api', 'debug', 'query'], 'Updating Relatives')
        return Word.findAll({
            where: ["id IN (" + p.relatives.map(function (n) {
              return n.id
            }).join(',') + ")"]
          }, {
            transaction: t
          })
          .then(function (relativesObj) {
            //console.log(relativesObj.map(function(n){ return n.values}))
            if (relativesObj === null || relativesObj.length !== p.relatives.length) {
              throw error(20007, 'update.updateRelatives.find.NotFound')
            }

            if (checkIfEqualWord(relativesObj, wordObj)) {
              throw error(20052, 'update.Relatives')
            }
            req.log(['dictionary-api', 'debug', 'query'], 'Relatives(s) Found')

            if (wordObj.hasRelatives(relativesObj)) {
              throw error(20059, 'update.Relatives')
            }
            return wordObj.setRelatives(relativesObj, {
              lock: "UPDATE",
              transaction: t
            })
          })
          .then(function () {
            return wordObj
          })
      } else {
        return wordObj
      }
    }




    return findWord()
      .then(function (wordObj) {
        return updateWord(wordObj)
      })
      .then(function (wordObj) {
        return updateRelatives(wordObj)
      })
      .then(function (wordObj) {
        return updateAntonyms(wordObj)
      })
      .then(function (wordObj) {
        return updateSynonyms(wordObj)
      })
      .then(function (wordObj) {
        return updateLanguage(wordObj)
      })
      .then(function (wordObj) {
        return updateCountries(wordObj)
      })
      .then(function (wordObj) {
        return updateHyperlinks(wordObj)
      })
      .then(function () {
        return updateDefinitions()
      })
      .then(function () {
        MyCommit.call(t)
      }, function (err) {
        MyRollback.call(t, err)
      })
  })
}
module.exports = update