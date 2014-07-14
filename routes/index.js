
var handlers = require('../handlers'),
    Joi = require('joi'),
    errorHandler = require('../errors'),
    /**
     * Hapi Routes : http://hapijs.com/api#serverrouteoptions
     * @type {Array}
     */
    routes = [
      {
        path: '/{p*}',
        method: '*',
        handler: handlers.notFound,
      },
      // {
      //   path: '/register',
      //   method: 'POST',
      //   config : {
      //     description: 'Register new user in KVDMS',
      //     handler: handlers.register,
      //     payload : {
      //       output : 'data',
      //       parse: true,
      //       allow: 'application/json',
      //       failAction: 'error', //default useless here but want to know it
      //     },
      //     validate : {
      //       failAction: errorHandler.validation,
      //       query: false,
      //       params: false,
      //       payload : {
      //         username: Joi.string().min(5).max(12).required(),
      //         password: Joi.string().min(8).regex(/^(?=(.*\d){2})(?=.*[a-zA-Z])(?=.*[!@#$%])[0-9a-zA-Z!@#$%]/).required(),
      //       }
      //     }
      //   }
      // },
      {
        path: "/",
        method: "PUT",
        config : {
          description: 'Add word into RDBMS',
          handler: handlers.add,
          payload : {
            output : 'data',
            parse: true,
            allow: 'application/json',
            failAction: 'error', //default useless here but want to know it
          },
          validate : {
            failAction: errorHandler.validation,
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
          description: 'update word into database',
          handler: handlers.update,
          payload : {
            output : 'data',
            parse: true,
            allow: 'application/json',
            failAction: 'error', //default useless here but want to know it
          },
          validate : {
            failAction: errorHandler.validation,
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
                  id: Joi.number().required(),
                  hyperlink : Joi.string().regex(
                    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
                  ).required()
                }).optional()
              )
            }
          }
        }
      },
      {
        path: "/",
        method: "GET",
        config : {
          description: 'Search into database',
          handler: handlers.query,
          validate : {
            failAction: errorHandler.validation,
            query: {
              limit: Joi.number().optional(),
              wordId: Joi.number().optional(),
              lema: Joi.string().optional(),
              pos: Joi.string().optional(),
              gerund: Joi.string().optional(),
              participle: Joi.string().optional(),
            }
          }
        }
      }]

module.exports = routes
