function checkIfArrays(oldVal,newVal) {
  return (oldVal instanceof Array) === (newVal instanceof Array)
}

function isObject(val) {
  return val && typeof(val) === 'object'
}

function checkKeys(oldVal,newVal) {
  var oldKeys = Object.keys(oldVal)
  var newKeys = Object.keys(newVal)
  if(oldKeys.length !== newKeys.length) { return false }
  oldKeys.forEach(function(oldKey,index) {
    if(!check(oldKey, newKeys[index])) { return false }
  })

  return true
}

function check(oldVal, newVal) {
  if(typeof(oldVal) === 'number' && isNaN(oldVal)) {
    return typeof(newVal) === 'number' && isNaN(newVal);
  };

  if(isObject(oldVal)) {
    if(!isObject(newVal) || !checkIfArrays(oldVal,newVal) || !checkKeys(oldVal,newVal) ) { return false }

    for (key in oldVal) {
      if(!check(oldVal[key], newVal[key])) { return false }
    }
    return true
  }

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

  assert('handles equivalent arrays', function() {
    return check([1],[1])
  });

  assert('handles arrays of different lengths', function() {
    return check([1],[1,2]) === false && check([1,2],[1]) === false
  });

  assert('handles arrays with all types of elements', function() {
    return check(types,types)
  })

  assert('handles equivalent objects', function() {
    return check({a: 1}, {a: 1})
  })

  assert('handles objects with distinct keys', function() {
    return check({a: 1}, {a: 1, b: 2}) === false && check({a: 1, b: 2}, {a: 1}) === false
  })

  assert('handles nested equivalent objects', function() {
    return check({a: {b: 1}}, {a: {b: 1}})
  })

  assert('handles nested non-equivalent objects', function() {
    return check({a: {b: 1}}, {a: {b: 2}}) == false
  })

  console.log(assert.counter + ' tests passed')
})();
