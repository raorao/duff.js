

var duff = function(oldVal,newVal) {

  var _isObject = function(val) {
    return val && typeof(val) === 'object'
  }

  var _isNaN = function(val) {
    return typeof(val) === 'number' && isNaN(val)
  }

  var _checkIfArrays = function(oldVal,newVal) {
    return (oldVal instanceof Array) === (newVal instanceof Array)
  }

  var _checkObjectKeys = function(oldVal,newVal) {
    var oldKeys = Object.keys(oldVal)
    var newKeys = Object.keys(newVal)
    if(oldKeys.length !== newKeys.length) { return false }
    oldKeys.forEach(function(oldKey,index) {
      if(!_check(oldKey, newKeys[index])) { return false }
    })

    return true
  }

  var _checkObjectValues = function(oldObj,newObj) {
    for (key in oldObj) {
      if(!_check(oldObj[key], newObj[key])) { return false }
    }

    return true
  }

  var _checkPrimitiveValues = function(oldVal,newVal) {
    return oldVal === newVal
  }

  var _check = function (oldVal, newVal) {
    if(_isNaN(oldVal)) { return _isNaN(newVal) };

    if(_isObject(oldVal)) {
      if(!_isObject(newVal) || !_checkIfArrays(oldVal,newVal) || !_checkObjectKeys(oldVal,newVal) ) { return false }

      return _checkObjectValues(oldVal,newVal)
    }

    return _checkPrimitiveValues(oldVal,newVal)
  };

  return _check(oldVal,newVal);
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
      var actual   = duff(oldVal,newVal)
      var expected = oldValIndex === newValIndex ? true : false
      var message  = "expected duff(" + oldVal + "," + newVal + ") to return " + expected
      assert(message,function() { return actual === expected })
    })
  })

  assert('duff handles nonequivalent strings', function() {
    return duff('str', 'str1') === false
  });

  assert('duff handles nonequivalent integers', function() {
    return duff(1, 2) === false
  });

  assert('duff handles nonequivalent floats', function() {
    return duff(1.1, 1.2) === false
  });

  assert('handles equivalent arrays', function() {
    return duff([1],[1])
  });

  assert('handles arrays of dufferent lengths', function() {
    return duff([1],[1,2]) === false && duff([1,2],[1]) === false
  });

  assert('handles arrays with all types of elements', function() {
    return duff(types,types)
  })

  assert('handles equivalent objects', function() {
    return duff({a: 1}, {a: 1})
  })

  assert('handles objects with distinct keys', function() {
    return duff({a: 1}, {a: 1, b: 2}) === false && duff({a: 1, b: 2}, {a: 1}) === false
  })

  assert('handles nested equivalent objects', function() {
    return duff({a: {b: 1}}, {a: {b: 1}})
  })

  assert('handles nested non-equivalent objects', function() {
    return duff({a: {b: 1}}, {a: {b: 2}}) == false
  })


  console.log(assert.counter + ' tests passed')
})();
