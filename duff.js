

var duff = function(oldVal,newVal,options) {
  var _returnErrors = false
  var _errors = []

  var _isObject = function(val) {
    return val && typeof(val) === 'object'
  }

  var _isNaN = function(val) {
    return typeof(val) === 'number' && isNaN(val)
  }

  var _toString = function(val) {
    if(val instanceof Array) { return 'an array' }
    if(_isObject(val)) { return 'an object'}
    if(val === '') { return 'an empty string' }
    if(typeof val === 'string' ) { return '"' + val + '"'}

    return val
  }

  var _createErrorMessage = function(oldVal,newVal,ancestors) {
    var ancestorsString = ancestors.map(function(ancestor) {
      return "[" + _toString(ancestor) + "]"
    }).join('')
    return "Expected target object " + ancestorsString + " to equal " + _toString(oldVal) + ". Instead, it was set to " + _toString(newVal) + "."
  }

  var _check = function(oldVal,newVal,ancestors,areEqual) {
    var result = areEqual()
    if(_returnErrors && !result) { _errors.push( _createErrorMessage(oldVal,newVal,ancestors) ) }
    return result
  }

  var _checkNaN = function(oldVal,newVal,ancestors) {
    return _check(oldVal,newVal, ancestors, function() { return _isNaN(newVal) })
  }

  var _checkIfArrays = function(oldVal,newVal,ancestors) {
    return _check(oldVal,newVal, ancestors, function() {
      return (oldVal instanceof Array) === (newVal instanceof Array)
    })
  }

  var _checkIsObject = function(oldVal,newVal,ancestors) {
    return _check(oldVal,newVal,ancestors,function() { return _isObject(newVal) })
  }

  var _checkPrimitiveValues = function(oldVal,newVal,ancestors) {
    return _check(oldVal,newVal, ancestors, function() { return oldVal === newVal })
  }

  var _checkObjectKeys = function(oldVal,newVal,ancestors) {
    var oldKeys = Object.keys(oldVal)
    var newKeys = Object.keys(newVal)
    if(oldKeys.length !== newKeys.length) {
      return _check(oldVal,newVal,ancestors,function() { return false})
    }
    oldKeys.forEach(function(oldKey,index) {
      if(!_duff(oldKey, newKeys[index],ancestors)) { return false }
    })

    return true
  }

  var _checkObjectValues = function(oldObj,newObj,ancestors) {
    var result = true
    for (key in oldObj) {
      var newAncestors = ancestors.concat([key])
      var localResult = _duff(oldObj[key], newObj[key],newAncestors)
      result = result ? localResult : false
    }

    return result
  }

  var _setOptions = function(options) {
    if(!options) { return }

    _returnErrors = options.errors || false
  }

  var _duff = function (oldVal, newVal, ancestors) {
    if(_isNaN(oldVal)) { return _checkNaN(oldVal,newVal,ancestors) };

    if(_isObject(oldVal)) {
      if( !_checkIsObject(oldVal,newVal,ancestors) || !_checkIfArrays(oldVal,newVal,ancestors) || !_checkObjectKeys(oldVal,newVal,ancestors) ) { return false }

      return _checkObjectValues(oldVal,newVal,ancestors)
    }

    return _checkPrimitiveValues(oldVal,newVal,ancestors)
  };


  _constructResult = function() {
    var result = _duff(oldVal,newVal,[])
    if (_returnErrors) {
      return { errors: _errors, value: result}
    } else {
      return result
    }
  }

  _setOptions(options)
  return _constructResult();
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
      var expected = oldValIndex === newValIndex
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

  // handles errors flag

  types.forEach(function(oldVal,oldValIndex) {
    types.forEach(function(newVal,newValIndex) {
      var actual = duff(oldVal,newVal, {errors: true});

      (function foo() {
        var expectedCount = oldValIndex === newValIndex ? 0 : 1
        var message = "expected duff(" + oldVal + "," + newVal + ") to have " + expectedCount + " errors."
        assert(message,function() { return actual.errors.length === expectedCount })
      })();

      (function foo() {
        var expectedValue = oldValIndex === newValIndex
        var message = "expected duff(" + oldVal + "," + newVal + ") to have value of " + expectedValue + "."
        assert(message,function() { return actual.value === expectedValue })
      })();
    })
  })



  console.log(assert.counter + ' tests passed')
})();
