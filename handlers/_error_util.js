module.exports = function(errno, name, err){
  if(err){
    err.name = name
    return err
  } 
  var error = new Error(name)
  error.errno = errno  // Assign a custom error errno
  return error
}