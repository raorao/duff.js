function check(oldVal, newVal) {
  if(typeof(oldVal) === 'number' && isNaN(oldVal)) {
    return typeof(newVal) === 'number' && isNaN(newVal);
  };

  if(typeof(oldVal) === 'number' && !isFinite(oldVal)) {
    return typeof(newVal) === 'number' && !isFinite(newVal)
  }

  return oldVal === newVal
}



assert = function(message,assertion) {
  if ( !assertion() ) {
   throw( new Error("test failed: " + message) )
  }
}

assert('check handles strings', function() {
  return check('str', 'str')
})

assert('check handles strings', function() {
  return check('str', 'str1') === false
})

assert('check handles integers', function() {
  return check(1, 1)
})

assert('check handles integers', function() {
  return check(1, 2) === false
})

assert('check handles boolean values', function() {
  return check(true, true)
})

assert('check handles boolean values', function() {
  return check(true, false) === false
})

assert('check handles floats', function() {
  return check(1.1, 1.1)
})

assert('check handles floats', function() {
  return check(1.1, 1.2) === false
})

assert('check handles two null values', function() {
  return check(null,null)
})

assert('check handles two undefined values', function() {
  return check(undefined, undefined)
})

assert('check handles two NaN values', function() {
  return check(NaN, NaN)
})

assert('check handles two Infinity values', function() {
  return check(Infinity, Infinity)
})

assert('check handles two -Infinity values', function() {
  return check(-Infinity, -Infinity)
})







console.log('all tests passed')
