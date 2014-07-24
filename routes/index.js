var handlers = require('../handlers'),
  Joi = require('joi'),
  /**
   * Hapi Routes : http://hapijs.com/api#serverrouteoptions
   * @type {Array}
   */
  routes = [{
    path: '/',
    method: 'DELETE',
    config: {
      tags: ['dictionary-api'],
      description: 'Delete a Word by id',
      pre: [{
        method: handlers.delete,
        assign: 'word'
      }],
      handler: function (req, rep) {
        rep(req.pre.word)
      },
      payload: {
        output: 'data',
        parse: true,
        allow: 'application/json',
        failAction: 'error', //default useless here but want to know it
      },
      validate: {
        query: false,
        params: false,
        payload: {
          id: Joi.number().required().example('1')
        }
      }
    }
  }, {
    path: '/',
    method: 'PUT',
    config: {
      tags: ['dictionary-api'],
      description: 'Add word into RDBMS',
      handler: handlers.add,
      payload: {
        output: 'data',
        parse: true,
        allow: 'application/json',
        failAction: 'error', //default useless here but want to know it
      },
      validate: {

        query: false,
        params: false,
        payload: {
          'lema': Joi.string().required().example('dormir'),
          'pos': Joi.string().required().example('v'),
          'gerund': Joi.string().optional().regex(/^.*iendo|ando$/).example('durmiendo'),
          'participle': Joi.string().optional().example('dormido'),
          'countries': Joi.array().includes(
            Joi.object().keys({
              'country': Joi.string().min(1).max(20).required().example('Spain').default('Spain'),
              'frequency': Joi.number().min(0).max(100).integer().optional().example('10').default('0')
            }).required().example({
              country: 'Spain',
              frequency: 12
            })
          ).required().example(
            [{
              country: 'Spain',
              frequency: 12
            }, {
              country: 'Costa Rica',
              frequency: 2
            }]
          ),
          'register': Joi.boolean().default(true).example(true),
          'language': Joi.string().required().example('Spanish').default('Spanish'),
          'definitions': Joi.array().includes(
            Joi.object().keys({
              'definition': Joi.string().example('Vocablo de carácter y uso académico o literario'),
              'examples': Joi.array().includes(Joi.string().example('graduarse cum laude')).optional()
                .example(['graduarse cum laude', 'Abarroto mi maleta de ropa'])
            }).required().example({
              definition: 'first def',
              examples: ['graduarse cum laude', 'Abarroto mi maleta de ropa']
            })
          ).example(
            [{
              definition: 'first def',
              examples: ['graduarse cum laude', 'Abarroto mi maleta de ropa']
            }, {
              definition: 'second def',
              examples: ['graduarse cum laude', 'Abarroto mi maleta de ropa']
            }]
          ),
          'synonyms': Joi.array().includes(
            Joi.object().keys({
              'lema': Joi.string().required().example('adormecer'),
              'pos': Joi.string().required().example('vtr')
            }).required().example({
              lema: 'adormecer',
              pos: 'vtr'
            })
          ).optional().example(
            [{
              lema: 'adormecer',
              pos: 'vtr'
            }, {
              lema: 'hablar',
              pos: 'vtr'
            }]),
          'antonyms': Joi.array().includes(
            Joi.object().keys({
              'lema': Joi.string().required().example('despertarse'),
              'pos': Joi.string().required().example('vtr')
            }).required().example({
              lema: 'adormecer',
              pos: 'vtr'
            })
          ).optional().example(
            [{
              lema: 'adormecer',
              pos: 'vtr'
            }, {
              lema: 'hablar',
              pos: 'vtr'
            }]),
          'relatives': Joi.array().includes(
            Joi.object().keys({
              'lema': Joi.string().required().example('adormecer'),
              'pos': Joi.string().required().example('vtr')
            }).required().example({
              lema: 'adormecer',
              pos: 'vtr'
            })
          ).optional().example(
            [{
              lema: 'adormecer',
              pos: 'vtr'
            }, {
              lema: 'hablar',
              pos: 'vtr'
            }]),
          'hyperlinks': Joi.array().includes(Joi.string().regex(
            /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
          ).required().example('http://fr.wiktionary.org/wiki/nomenclatura')).optional().example(['http://fr.wiktionary.org/wiki/nomenclatura', 'http://google.fr'])
        }
      }
    }
  }, {
    path: '/',
    method: 'POST',
    config: {
      tags: ['dictionary-api'],
      description: 'update word into database',
      handler: handlers.update,
      payload: {
        output: 'data',
        parse: true,
        allow: 'application/json',
        failAction: 'error', //default useless here but want to know it
      },
      validate: {

        query: false,
        params: false,
        payload: {
          'wordId': Joi.number().required().example('1023'),
          'gerund': Joi.string().optional().example('durmiendo, hablando. It must end with "ando" or "iendo"'),
          'participle': Joi.string().optional().example('dormido'),
          'countries': Joi.array().includes(
            Joi.object().keys({
              'id': Joi.number().required().example(1),
              'frequency': Joi.number().min(0).max(100).integer().optional().example(10)
            }).required().example({
              id: 1,
              frequency: 12
            })
          ).optional().example(
            [{
              id: 8,
              frequency: 12
            }, {
              id: 10,
              frequency: 2
            }]
          ),
          'register': Joi.boolean().optional().example(true),
          'language': Joi.string().optional().example('Spanish'),
          'definitions': Joi.array().includes(
            Joi.object().keys({
              'id': Joi.number().required().example(1),
              'definition': Joi.string().required().example('Persona que cumple años'),
              'examples': Joi.array().includes(
                Joi.object().keys({
                  'id': Joi.number().required().example(2329),
                  'example': Joi.string().required().example('Es un artista cuyas obras han recibido grandes elogios')
                }).required()
              ).optional()
            }).required()
          ).optional(),
          'synonyms': Joi.array().includes(
            Joi.object().keys({
              'id': Joi.number().required().example(234),
              'lema': Joi.string().required().example('hablar'),
              'pos': Joi.string().required().example('vtr')
            }).required().example({
              id: 12,
              lema: 'adormecer',
              pos: 'vtr'
            })
          ).optional().example(
            [{
              id: 12,
              lema: 'adormecer',
              pos: 'vtr'
            }, {
              id: 13,
              lema: 'hablar',
              pos: 'vtr'
            }]),
          'antonyms': Joi.array().includes(
            Joi.object().keys({
              'id': Joi.number().required().example(234),
              'lema': Joi.string().required().example('hablar'),
              'pos': Joi.string().required().example('vtr')
            }).required().example({
              id: 12,
              lema: 'adormecer',
              pos: 'vtr'
            })
          ).optional().example(
            [{
              id: 12,
              lema: 'adormecer',
              pos: 'vtr'
            }, {
              id: 13,
              lema: 'hablar',
              pos: 'vtr'
            }]),
          'relatives': Joi.array().includes(
            Joi.object().keys({
              'id': Joi.number().required().example(234),
              'lema': Joi.string().required().example('hablar'),
              'pos': Joi.string().required().example('vtr')
            }).required().example({
              id: 12,
              lema: 'adormecer',
              pos: 'vtr'
            })
          ).optional().example(
            [{
              id: 12,
              lema: 'adormecer',
              pos: 'vtr'
            }, {
              id: 13,
              lema: 'hablar',
              pos: 'vtr'
            }]),
          'hyperlinks': Joi.array().includes(
            Joi.object().keys({
              id: Joi.number().required().example('1'),
              hyperlink: Joi.string().regex(
                /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
              ).required().example('http://puzzledge.eu')
            }).optional().example({
              id: 2,
              hyperlink: 'http://puzzledge.eu'
            })
          ).example([{
            id: 2,
            hyperlink: 'http://puzzledge.eu'
          }, {
            id: 3,
            hyperlink: 'http://google.fr'
          }])
        }
      }
    }
  }, {
    path: '/words',
    method: 'GET',
    config: {
      tags: ['dictionary-api'],
      description: 'Search into database',
      cache: {
        expiresIn: 60 * 60
      },
      pre: [{
        method: handlers.words.all,
        assign: 'words'
      }],
      handler: function (req, rep) {
        rep(req.pre.words)
      },
      validate: {

        query: {
          extended: Joi.boolean().optional().default(false).example(true),
          limit: Joi.number().optional().max(100).default(10).example('10'),
          offset: Joi.number().optional().example('101'),
          order: Joi.string().optional().example('id ASC').default('id ASC').regex(/.* (ASC|DESC)/),
        }
      }
    }
  }, {
    path: '/words/count',
    method: 'GET',
    config: {
      tags: ['dictionary-api'],
      description: 'Count Words',
      cache: {
        expiresIn: 60 * 60
      },
      pre: [{
        method: handlers.words.count,
        assign: 'words'
      }],
      handler: function (req, rep) {
        rep(req.pre.words)
      },
    }
  }, {
    path: '/language',
    method: 'GET',
    config: {
      tags: ['dictionary-api'],
      description: 'Search words by Language',
      pre: [{
        method: handlers.language.language,
        assign: 'language'
      }],
      handler: function (req, rep) {
        rep(req.pre.language)
      },
      validate: {

        query: {
          id: Joi.number().optional(),
          extended: Joi.boolean().optional().default(false).example(true),
          language: Joi.string().optional().example('Spanish').default('Spanish'),
          limit: Joi.number().min(1).max(100).optional().default(10).example('10'),
          offset: Joi.number().optional().example('101'),
          order: Joi.string().optional().example('id ASC').default('id ASC').regex(/.* (ASC|DESC)/)
        }
      }
    }
  }, {
    path: '/languages/{limit?}',
    method: 'GET',
    config: {
      tags: ['dictionary-api'],
      description: 'Search All Languages',
      pre: [{
        method: handlers.language.all,
        assign: 'language'
      }],
      handler: function (req, rep) {
        rep(req.pre.language)
      },
      validate: {
        query: {
          extended: Joi.boolean().optional().default(false).example(true),
          limit: Joi.number().min(1).max(100).optional().default(50).example('50')
        }
      }
    }
  }, {
    path: '/countries',
    method: 'GET',
    config: {
      tags: ['dictionary-api'],
      description: 'Search All Countries',
      pre: [{
        method: handlers.countries.all,
        assign: 'language'
      }],
      handler: function (req, rep) {
        rep(req.pre.language)
      },
      validate: {

        query: {
          extended: Joi.boolean().optional().default(false).example(true),
          limit: Joi.number().min(1).max(100).optional().default(50).example('50')
        }
      }
    }
  }, {
    path: '/countries/count',
    method: 'GET',
    config: {
      tags: ['dictionary-api'],
      description: 'Count Countries',
      pre: [{
        method: handlers.countries.count,
        assign: 'language'
      }],
      handler: function (req, rep) {
        rep(req.pre.language)
      },
    }
  }, {
    path: '/word',
    method: 'GET',
    config: {
      tags: ['dictionary-api'],
      description: 'Search a word by Id and/or lema and/or pos and/or gerund and/or participle, partial query are possible : like a%',
      pre: [{
        method: handlers.word.word,
        assign: 'word'
      }],
      handler: function (req, rep) {
        rep(req.pre.word)
      },
      validate: {
        query: {
          id: Joi.number().optional(),
          lema: Joi.string().optional().example('hablar or ha%'),
          pos: Joi.string().optional().example('v'),
          gerund: Joi.string().optional().example('hablando or %ando'),
          participle: Joi.string().optional().example('hablado'),
          limit: Joi.number().min(1).max(100).optional().default(10).example('10'),
          extended: Joi.boolean().optional().default(false).example(true),
        }
      }
    }
  }, {
    path: '/word/random',
    method: 'GET',
    config: {
      cache: {
        'expiresIn': 60 * 1,
      },
      tags: ['dictionary-api'],
      description: 'Random Word',
      pre: [{
        method: handlers.word.random,
        assign: 'word'
      }],
      handler: function (req, rep) {
        rep(req.pre.word)
      },
      validate: {
        query: {
          extended: Joi.boolean().optional().default(false).example(true),
        }
      }
    }
  }]

module.exports = routes