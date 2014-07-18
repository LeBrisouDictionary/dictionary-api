
var handlers = require('../handlers'),
    Joi = require('joi'),
    errorHandler = require('../errors'),
    /**
     * Hapi Routes : http://hapijs.com/api#serverrouteoptions
     * @type {Array}
     */
    routes = [
      {
        path: "/",
        method: "DELETE",
        config : {
          tags: ['dictionary-api'],
          description: 'Delete a Word by id',
          pre: [
            { method: handlers.delete, assign: 'word'}
          ],
          handler: function(req, rep){ rep(req.pre.word) },
          payload : {
            output : 'data',
            parse: true,
            allow: 'application/json',
            failAction: 'error', //default useless here but want to know it
          },
          validate: {
            query: false,
            params: false,
            payload : {
              id: Joi.number().required().example('1')
            }
          }
        }
      },
      {
        path: "/",
        method: "PUT",
        config : {
          tags: ['dictionary-api'],
          description: 'Add word into RDBMS',
          handler: handlers.add,
          payload : {
            output : 'data',
            parse: true,
            allow: 'application/json',
            failAction: 'error', //default useless here but want to know it
          },
          validate : {
            
            query: false,
            params: false,
            payload : {
              'lema' : Joi.string().required().example('desayuno'),
              'pos' : Joi.string().required(),
              'gerund': Joi.string().optional(),
              'participle': Joi.string().optional(),
              'countries': Joi.array().includes(
                Joi.object().keys({
                  'country' : Joi.string().min(1).max(20).required(),
                  'frequency': Joi.number().min(0).max(100).integer().optional()
                }).required()
              ).required(),
              'register': Joi.boolean(),
              'language': Joi.string().required(),
              'definitions': Joi.array().includes(
                Joi.object().keys(
                  {
                    'definition': Joi.string(),
                    'examples': Joi.array().includes(Joi.string()).optional()
                  }
                ).required()
              ),
              'synonyms': Joi.array().includes(
                Joi.object().keys(
                  {
                    'lema': Joi.string().required(),
                    'pos': Joi.string().required()
                  }
                ).required()
              ).optional(),
              'antonyms': Joi.array().includes(
                Joi.object().keys(
                  {
                    'lema': Joi.string().required(),
                    'pos': Joi.string().required()
                  }
                ).required()
              ).optional(),
              'relatives': Joi.array().includes(
                Joi.object().keys(
                  {
                    'lema': Joi.string().required(),
                    'pos': Joi.string().required()
                  }
                ).required()
              ).optional(),
              'hyperlinks': Joi.array().includes(Joi.string().regex(
                /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
              ).required()).optional()
            }
          }
        }
      },
      {
        path: "/",
        method: "POST",
        config : {
          tags: ['dictionary-api'],
          description: 'update word into database',
          handler: handlers.update,
          payload : {
            output : 'data',
            parse: true,
            allow: 'application/json',
            failAction: 'error', //default useless here but want to know it
          },
          validate : {
            
            query: false,
            params: false,
            payload : {
              'wordId': Joi.number().required(),
              'gerund': Joi.string().optional(),
              'participle': Joi.string().optional(),
              'countries': Joi.array().includes(
                Joi.object().keys({
                  'country' : Joi.string().min(3).max(32).required(),
                  'frequency': Joi.number().min(0).max(100).integer().optional()
                }).required()
              ).optional(),
              'register': Joi.boolean().optional(),
              'language': Joi.string().optional(),
              'definitions': Joi.array().includes(
                Joi.object().keys({
                    'id': Joi.number().required(),
                    'definition': Joi.string().required(),
                    'examples': Joi.array().includes(
                      Joi.object().keys({
                        'id': Joi.number().required(),
                        'example' : Joi.string().required()
                      }).required()
                    ).optional()
                }).required()
              ).optional(),
              'synonyms': Joi.array().includes(
                Joi.object().keys({
                    'id': Joi.number().required(),
                    'lema': Joi.string().required(),
                    'pos': Joi.string().required()
                  }).required()
              ).optional(),
              'antonyms': Joi.array().includes(
                Joi.object().keys({
                    'id': Joi.number().required(),
                    'lema': Joi.string().required(),
                    'pos': Joi.string().required()
                  }).required()
              ).optional(),
              'relatives': Joi.array().includes(
                Joi.object().keys(
                  {
                    'id': Joi.number().required(),
                    'lema': Joi.string().required(),
                    'pos': Joi.string().required()
                  }
                ).required()
              ).optional(),
              'hyperlinks': Joi.array().includes(
                Joi.object().keys({
                  id: Joi.number().required().example('1'),
                  hyperlink : Joi.string().regex(
                    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
                  ).required().example('http://puzzledge.eu')
                }).optional()
              )
            }
          }
        }
      },
      {
        path: "/words/{limit?}",
        method: "GET",
        config : {
          tags: ['dictionary-api'],
          description: 'Search into database',
          pre: [
            { method: handlers.words, assign: 'words'}
          ],
          handler: function(req, rep){ rep(req.pre.words) },
          validate : {
            
            query: {
              limit: Joi.number().optional().default(10).example('10'),
              offset: Joi.number().optional().example("101"),
              order: Joi.string().optional().example('id ASC').default('id ASC'),             
            }
          }
        }
      },
      {
        path: "/language",
        method: "GET",
        config : {
          tags: ['dictionary-api'],
          description: 'Search words by Language',
          pre: [
            { method: handlers.language.language, assign: 'language'}
          ],
          handler: function(req, rep){ rep(req.pre.language) },
          validate : {
            
            query: {
              id: Joi.number().optional(),
              language: Joi.string().optional().example('Spanish').default('Spanish'),
              limit: Joi.number().optional().default(10).example('10'),
              offset: Joi.number().optional().example("101"),
              order: Joi.string().optional().example('id ASC').default('id ASC')
            }
          }
        }
      },
      {
        path: "/languages/{limit?}",
        method: "GET",
        config : {
          tags: ['dictionary-api'],
          description: 'Search All Languages',
          pre: [
            { method: handlers.language.all, assign: 'language'}
          ],
          handler: function(req, rep){ rep(req.pre.language) },
          validate : {
            
            query: {
              limit: Joi.number().optional().default(50).example('50')
            }
          }
        }
      },
      {
        path: "/countries/{limit?}",
        method: "GET",
        config : {
          tags: ['dictionary-api'],
          description: 'Search All Countries',
          pre: [
            { method: handlers.countries.all, assign: 'language'}
          ],
          handler: function(req, rep){ rep(req.pre.language) },
          validate : {
            
            query: {
              limit: Joi.number().optional().default(50).example('50')
            }
          }
        }
      },
      {
        path: "/word",
        method: "GET",
        config : {
          tags: ['dictionary-api'],
          description: 'Search a word by Id and/or lema and/or pos and/or gerund and/or participle, partial query are possible : like a%',
          pre: [
            { method: handlers.word.word, assign: 'word'}
          ],
          handler: function(req, rep){ rep(req.pre.word) },
          validate : {
            query: {
              id: Joi.number().optional(),
              lema: Joi.string().optional().example('hablar or ha%'),
              pos: Joi.string().optional().example('v'),
              gerund: Joi.string().optional().example('hablando or %ando'),
              participle: Joi.string().optional().example('hablado'),
              limit: Joi.number().optional().default(10).example('10')
            }
          }
        }
      },
      {
        path: "/word/random",
        method: "GET",
        config : {
          cache : {
            'expiresIn': 60 * 1,
          },
          tags: ['dictionary-api'],
          description: 'Random Word',
          pre: [
            { method: handlers.word.random, assign: 'word'}
          ],
          handler: function(req, rep){ rep(req.pre.word) },
        }
      }]

module.exports = routes
