function check(oldVal, newVal) {
  if(typeof(oldVal) === 'number' && isNaN(oldVal)) {
    return typeof(newVal) === 'number' && isNaN(newVal);
  };

  return oldVal === newVal
};





(function() {
  var assert = function(message,assertion) {
    (assert.counter === undefined) ? assert.counter = 1 : assert.counter++
    if ( !assertion() ) {
     throw( new Error("test failed: " + message) )
    }
  };
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
    NaN,
    {},
    [],
    ''
  ]

  types.forEach(function(oldVal,oldValIndex) {
    types.forEach(function(newVal,newValIndex) {
      var actual   = check(oldVal,newVal)
      var expected = oldValIndex === newValIndex ? true : false
      var message  = "expected check(" + oldVal + "," + newVal + ") to return " + expected
      assert(message,function() { return actual === expected })
    })
  })

  assert('check handles nonequivalent strings', function() {
    return check('str', 'str1') === false
  });

  assert('check handles nonequivalent integers', function() {
    return check(1, 2) === false
  });

  assert('check handles nonequivalent floats', function() {
    return check(1.1, 1.2) === false
  });

  console.log(assert.counter + ' tests passed')
})()

