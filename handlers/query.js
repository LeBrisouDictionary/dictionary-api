/*jslint bitwise: true, continue: true, debug: true, devel: true, eqeq: true, evil: true, forin: true, indent: 2, maxerr: 50, maxlen: 250, node: true, nomen: true, plusplus: true, regexp: true, sloppy: true, sub: true, vars: true, es5: true */

var errorHandler = require('../errors'),
    Promise = require("bluebird")


var query = function (req, rep) {
  var S = this.db,
      models = this.models,
      p = req.query,
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
    req.log(['dictionary-api', 'info', 'query'],'Transaction begin Successfully')

    var tempDefinitionsObjects = []

    
    function zipObjectsValues(arrays, fields) {
      arrays = arrays.map(function(n){
        return ['"'+n.lema+'"','"'+n.pos+'"']
      })
      var s = arrays[0].map(function(_,i){
          return arrays.map(function(array){return array[i]})
      })

      var res = ''

      for (var i = 0 ;i < s.length; i++) {
        var e = s[i]
        res += fields[i] + ' IN (' + e + ') '
        res += (i < s.length - 1 ) ? ' AND ' : ''
      }
      console.log(res)
      return res
    }

    function MyCommit(responseBody) {
      this.commit().error(function (err) {
        if (err) {
          req.log(['dictionary-api', 'error', 'query'],"Error Committing : ", err)
          errorHandler.craft(err, 'add.commit')
          errorHandler.sendError(err, rep)
          next(err, p)
        }
        
      }).success(function(){
        req.log(['dictionary-api', 'info', 'query'],"Commit Successfull")
        responseBody.success = true
        rep(responseBody)
      })
    }

    function MyRollback(prev_err){
        this.rollback().error(function (err) {
            req.log(['dictionary-api', 'error', 'query'],'Error Rollback : ', err)
            errorHandler.craft(err, 'add.rollback')
            errorHandler.sendError(err, rep)          
        }).success(function(){
          req.log(['dictionary-api', 'warn', 'query'],'Rollback Success')
          req.log(['dictionary-api', 'warn', 'query'], prev_err)
          p.success = false
          p.rollback = true
          errorHandler.sendError(prev_err, rep)
        })
    }


    function getWords(){
      return Word.findAll({ limit : p.limit || 10 ,
        include : [
          { model : Word, as : 'Relatives'},
          { model : Word, as : 'Synonyms' },
          { model : Word, as : 'Antonyms' },
          { model : Language },
          { model : Country},
          { model : Hyperlink},
          { model : Definition, include : [Example]}
        ]} , 
        { transaction : t })
      .then(function(wordsObj){
        req.log(['dictionary-api', 'debug', 'query'],wordsObj)
          if(!wordsObj || wordsObj.length === 0){
            throw errorHandler.create(21002, 'query.getWords.NotFound')
          }
          return { results : wordsObj.map(function(n){ return n.values }),  success: true}
        })
    }

    function getWord(query){
      return Word.find({ where : query, 
        include : [
          { model : Word, as : 'Relatives' },
          { model : Word, as : 'Synonyms' },
          { model : Word, as : 'Antonyms' },
          { model : Language },
          { model : Country },
          { model : Hyperlink },
          { model : Definition, include : [Example] }
        ]} , 
        { transaction : t } )
        .then(function(wordObj){
          if(wordObj === null){
            throw errorHandler.create(20000, 'query.findWord')
          }
          return wordObj.values
        })
    }

    function parseQuery(){
      
      var Query = {}
      if(Object.keys(p).length === 0){
        return getWords()
      } else {       
        if(p.wordId){ Query.id = p.wordId }
        if(p.lema){ Query.lema = p.lema } 
        if(p.pos){ Query.pos = p.pos } 
        if(p.gerund){ Query.gerund = p.gerund } 
        if(p.participle){ Query.participle = p.participle } 
        if(p.register){ Query.register = p.register } 
        return getWord(Query)
      }

      throw errorHandler.create(21002, 'query.parseQuery')

    }    

    parseQuery()
      .then(function(responseBody){
          MyCommit.call(t, responseBody)
        },function(err){
          MyRollback.call(t, err)
      })
  })
}
module.exports = query