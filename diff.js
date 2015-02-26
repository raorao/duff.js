function check(oldVal, newVal) {
  if(typeof(oldVal) === 'number' && isNaN(oldVal)) {
    return typeof(newVal) === 'number' && isNaN(newVal);
  };

  return oldVal === newVal
}



assert = function(message,assertion) {
  (assert.counter === undefined) ? assert.counter = 1 : assert.counter++
  if ( !assertion() ) {
   throw( new Error("test failed: " + message) )
  }
}

assert('check handles strings', function() {
  return check('str', 'str1') === false
})

assert('check handles integers', function() {
  return check(1, 2) === false
})

assert('check handles boolean values', function() {
  return check(true, false) === false
})

assert('check handles floats', function() {
  return check(1.1, 1.2) === false
})

assertAllTypes = function() {
  var types = [
    0,
    1,
    1.1,
    true,
    false,
    null,
    undefined,
    Infinity,
    -Infinity,
    NaN
  ]

  types.forEach(function(oldVal,oldValIndex) {
    types.forEach(function(newVal,newValIndex) {
      var actual   = check(oldVal,newVal)
      var expected = oldValIndex === newValIndex ? true : false
      var message  = "expected check(" + oldVal + "," + newVal + ") to return " + expected
      assert(message,function() { return actual === expected })
    })
  })
}

assertAllTypes()




console.log(assert.counter + ' tests passed')
