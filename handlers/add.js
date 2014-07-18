/*jsli
nt bitwise: true, continue: true, debug: true, devel: true, eqeq: true, evil: true, forin: true, indent: 2, maxerr: 50, maxlen: 250, node: true, nomen: true, plusplus: true, regexp: true, sloppy: true, sub: true, vars: true, es5: true */

var async = require('async'),
    Promise = require("bluebird"),
    Hapi = require('hapi')



/**
 * add complete entry into each database table
 * @param {[type]} req contains elems as JSON
 * @param {[type]} rep rep responds in JSON too
 *
 * @property {String} lema : word lema
 * @property {String} pos : 'part of speech' of the word
 * @property {Array} countries : word usage country list
 * @property {Boolean} registered : set word active or not
 * @property {Number} frequency : word frequency
 * @property {String} language : word language
 * @property {Object} definitions : contains definitions/examples Objects*  @property {Array} examples : contains the current definition examples
 *    @property {String} example : a definition example
 * @property {Array} hyperlinks : list of hyperlinks
 *  @property {String} hyperlink : an hyperlink
 *
 */
var add = function (req, rep) {
  var db_plugin = req.server.plugins['dictionary-rdbms']
  
  var S = db_plugin.db,
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
    autoCommit: false
  }, function(t) {
    req.log(['dictionary-api', 'info', 'add'],'Transaction begin Successfully')
    
    var tempDefinitionsObjects = []

    var word = Word.build({
      lema: p.lema,
      pos: p.pos,
      gerund: p.gerund,
      participle: p.participle,
      register: p.register,
    })

    function zipObjectsValues(arrays, fields) {
      arrays = arrays.map(function(n){
        return ['"'+n.lema+'"','"'+n.pos+'"']
      })
      var s = arrays[0].map(function(_,i){
          return arrays.map(function(array){return array[i]})
      })

      var res = ''

      for (var i = 0; i < s.length; i++) {
        var e = s[i]
        res += fields[i] + ' IN (' + e + ') '
        res += (i < s.length - 1 ) ? ' AND ' : ''
      }
      
      return res
    }

    function error(errno, name, err){
      if(err){
        err.name = name
        return err
      } 
      var error = new Error(name)
      error.errno = errno  // Assign a custom error errno
      return error
    }

    function MyCommit() {
      this.commit().error(function (err) {
        if (err) {
          req.log(['dictionary-api', 'error', 'add'],"Error Committing : ", err)
          rep(error(null, 'add.commit', err))
          
        }
        
      }).success(function(){
        req.log(['dictionary-api', 'info', 'add'],"Commit Successfull")
        p.success = true
        rep(p)
      })
    }

    function MyRollback(prev_err){
        this.rollback().error(function (err) {
            req.log(['dictionary-api', 'error', 'add'],'Error Rollback : ', err)
            rep(error(null, 'add.rollback', err))
            
        }).success(function(){
          req.log(['dictionary-api', 'warn', 'query'],'Rollback Success')
          req.log(['dictionary-api', 'warn', 'query'],prev_err)
          p.success = false
          p.rollback = true
          rep(error(null, 'sql', prev_err))
        })
    }

    function checkDuplicateId(array){
      
      if(!(array instanceof Object)){
        throw error(19999, "add.checkDuplicateId")
      }
      
      for (var i = 0 ; i < array.length ; i++) {
        var entry = array[i]
        
        if(entry.id === word.id){
          return true
        }
      }
      return false
    }


    var insertWord = function(){
      return word.save({lock: "UPDATE",transaction: t})    
    }    

    var setLanguageId = function(){
        
      return Promise.resolve().then(function(){
        return Language.find({ where: { language: p.language } }, { transaction: t })
        .then(function(languageObj){
          if(languageObj === null) {
            throw error(20001, 'add.setLanguageId')
          } else {
            req.log(['dictionary-api', 'debug', 'add'],'Language Found ' + languageObj.id)
            return word.setLanguage( languageObj, { lock: "UPDATE", transaction : t })
          }
        })
      })
    }

    var insertHyperlinks = function(){
      if(p.hyperlinks){
        req.log(['dictionary-api', 'debug', 'add'],'Inserting Hyperlinks')
        return Promise.resolve().then(function(){
          return Hyperlink.bulkCreate(
            p.hyperlinks.map(function(n){ return { hyperlink : n } }), 
            { validate : true, transaction : t })
        })
        .then(function(){
          req.log(['dictionary-api', 'debug', 'add'],'Hyperlinks inserted Successfully')
          return Hyperlink.findAll(
            { where: ["hyperlink IN (\"" + p.hyperlinks.join('","') + "\")"]},{ transaction : t })
        })
        .then(function(hyperlinks) {
          req.log(['dictionary-api', 'debug', 'add'],'Hyperlinks Found')
          return word.setHyperlinks(hyperlinks, {transaction : t})
        })
      }
      return Promise.resolve()
    }

    function insertRelatives(){
      if(p.relatives){
        req.log(['dictionary-api', 'debug', 'add'],'Inserting Relatives')
        return Word.findAll(
          { where: [zipObjectsValues(p.relatives, ['lema', 'pos'])]},
          { lock: "UPDATE",
            transaction: t
          })
          .then(function(relativesObj) {
            if(relativesObj.length === 0) {
              throw error(20016, 'add.Relatives')
            } else {
              req.log(['dictionary-api', 'debug', 'add'],'Relatives Found')
              return word.setRelatives(relativesObj,{transaction : t})
            }
          })
          .then(function(){
            req.log(['dictionary-api', 'debug', 'add'],'Relatives added to Word Successfully')
          })
      }
      return Promise.resolve()
    }



    function insertSynonyms(){
      if(p.synonyms){
        req.log(['dictionary-api', 'debug', 'add'],'Inserting Synonyms')
        return Word.findAll(
          { where: [zipObjectsValues(p.synonyms, ['lema', 'pos'])]},
          { lock: "UPDATE",
            transaction: t
          })
          .then(function(synonyms) {
            if(synonyms.length === 0) {
              throw error(20004, 'add.Synonyms')
            } else if(checkDuplicateId(synonyms)){
              throw error(20050, 'add.Synonyms')
            } else {
              req.log(['dictionary-api', 'debug', 'add'],'Synonyms Found')
              return word.setSynonyms(synonyms,{transaction : t})
            }
          })
          .then(function(){
            req.log(['dictionary-api', 'debug', 'add'],'Synonyms added to Word Successfully')
          })
      }
      return Promise.resolve()
    }

    function insertAntonyms(){
      if(p.antonyms){
        req.log(['dictionary-api', 'debug', 'add'],'Inserting antonyms')
        return Word.findAll(
          { where: [zipObjectsValues(p.antonyms, ['lema', 'pos'])]},
          { lock: "UPDATE",
            transaction: t
          })
          .then(function(antonyms) {
            if(antonyms.length === 0) {
              throw error(20005, 'add.Antonyms')
            } else if(checkDuplicateId(antonyms)){
              throw error(20051, 'add.Synonyms')
            } else {
              req.log(['dictionary-api', 'debug', 'add'],'antonyms Found')
              return word.setAntonyms(antonyms,{transaction : t})
            }
          })
          .then(function(){
            req.log(['dictionary-api', 'debug', 'add'],'Antonyms added to Word Successfully')
          })
      }
      return Promise.resolve()
    }      

    function insertDefinitions() {
      if(p.definitions){
        req.log(['dictionary-api', 'debug', 'add'],'Inserting Definitions')
        var promise = Promise.defer()
        async.each(p.definitions, function(definition, callback){
          promise = insertDefinition(definition)
            .then(function(){
              return setWordDefinitions()
            })
        })
        return promise
      }
      return Promise.resolve()
    }

    function insertDefinition(definition) {

      var uid = require('node-uuid').v4()

      var definitionObj = Definition.build({
        definition: definition.definition,
        uid: uid,
      })

      return definitionObj.save({lock:"UPDATE", transaction: t})
        .then(function(definitionObj){
          if(definitionObj === null){
            throw error(1, 'add.insertDefinition.null') //could be 20013
          }
          req.log(['dictionary-api', 'debug', 'add'],'Definition ' + definitionObj.id + ' Saved Successfully')
          tempDefinitionsObjects.push(definitionObj)
          return insertExamples(definitionObj, definition.examples)
        })
    }

    function insertExamples(definitionObj, examples) {
    if(examples){
      req.log(['dictionary-api', 'debug', 'add'],'Inserting Examples')
      return Example.bulkCreate( examples.map(function(n){ return {example:n}}), 
          {validate: true, transaction : t})
        .then(function(){
          req.log(['dictionary-api', 'debug', 'add'],'Examples Added Successfully', examples)
          return Example.findAll(
            { where: ["example IN (\"" + examples.join('","') + "\")"]},
            { transaction : t})
        })
        .then(function(examples){
          return definitionObj.setExamples(examples, {lock:"UPDATE", transaction : t})
        })
        .then(function(){
          req.log(['dictionary-api', 'debug', 'add'],'Examples added to Word Successfully')
        })
      }
      return Promise.resolve()
    }

    function setWordDefinitions(){
      if(tempDefinitionsObjects.length){
        return word.setDefinitions(tempDefinitionsObjects, {transaction: t})
      }
    }

    var insertCountries = function(){

      if(p.countries){
        return p.countries.reduce(function(next, country){
          return next
            .then(function(){
              return Country.find({ where : { country : country.country }}, { transaction : t})
            })
            .then(function(countryObj){
              if(countryObj === null){
                return Promise.reject(
                  error(20003, 'add.insertCountries.find.NotFound'))
              }
              req.log(['dictionary-api', 'debug', 'add'],'Country Found id : ' + countryObj.id)

              return word.addCountry(countryObj, { frequency : country.frequency, transaction : t})
            })
        }, Promise.resolve())
      } else {
        return Promise.resolve()
      }
    }   
    
    return insertWord()
    .then(function(){
      return setLanguageId()
    })
    .then(function(){
      return insertHyperlinks()
    })
    .then(function(){
      return insertRelatives()
    })
    .then(function(){
      return insertSynonyms()
    })
    .then(function(){
      return insertAntonyms()
    })
    .then(function(){
      return insertCountries()
    })
    .then(function(){
      return insertDefinitions()
    })
    .then(function(){
        MyCommit.call(t)
      },function(err){
        MyRollback.call(t, err)
    })
    
  })
}
module.exports = add