module.exports.error = function(errno, name, err){
  if(err){
    err.name = name
    return err
  } 
  var error = new Error(name)
  error.errno = errno  // Assign a custom error errno
  return error
}




module.exports.fields = function(models){
	var Word = models.Word,
  Definition = models.Definition,
  Hyperlink = models.Hyperlink,
  Country = models.Country,
  Language = models.Language,
  Example = models.Example,
  WordCountry = models.WordCountry


	return {
		wordAttributes: ['id', 'lema', 'pos', 'gerund', 'participle', 'register', 'LanguageId'],
		countryAttributes: ['id', 'country'],
		languageAttributes: ['id', 'language'],
		true: [
			{ model : Word, as : 'Relatives'},
	    { model : Word, as : 'Synonyms' },
	    { model : Word, as : 'Antonyms' },
	    { model : Language },
	    { model : Country},
	    { model : Hyperlink},
	    { model : Definition, include : [Example]}
		],
		false: [
			{ model : Word, as : 'Relatives', attributes: ['id']},
		  { model : Word, as : 'Synonyms', attributes: ['id'] },
		  { model : Word, as : 'Antonyms', attributes: ['id'] },
		  { model : Language, attributes: ['id', 'language'] },
		  { model : Country, attributes: ['id', 'country'],
		  	include: [
		  		//{ model: WordCountry, attributes: ['frequency']},
		  	]
			},
			
		  { model : Hyperlink, attributes: ['id', 'hyperlink']},
		  { model : Definition, attributes: ['id', 'definition'], 
		  	include : [
		  		{ model : Example, attributes: ['id', 'example']}
		  	]
		  }
		]
	}
}