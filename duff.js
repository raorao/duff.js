var duff = function(oldVal,newVal) {
  var _errors = []
  var EQUIVALENCY_ERROR = 'equivalencyError'
  var NO_KEY_ERROR = 'noKeyError'
  var TOO_MANY_KEYS_ERROR = 'tooManyKeysError'

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

  var _createAncestors = function(ancestors) {
    var result = ancestors.map(function(ancestor) {
      return "[" + _toString(ancestor) + "]"
    }).join('')

    return result === '' ? result : result + " "
  }

  var _createErrorMessage = function(oldVal,newVal,type) {
    switch(type) {
      case EQUIVALENCY_ERROR:
        return "to equal " + _toString(oldVal) + ". Instead, it was set to " + _toString(newVal) + "."
      break;
      case NO_KEY_ERROR:
        return "to have key " + _toString(oldVal) + ". No such key was found."
      break;
      case TOO_MANY_KEYS_ERROR:
        return "to not have key " + _toString(newVal) + "."
      break;
    }
  }

  var _createError = function(oldVal,newVal,type,ancestors) {
    return "Expected target object " + _createAncestors(ancestors) + _createErrorMessage(oldVal,newVal,type)
  }

  var _check = function(oldVal,newVal,ancestors,type,areEqual) {
    var result = areEqual()
    if(!result) { _errors.push( _createError(oldVal,newVal,type,ancestors) ) }
    return result
  }

  var _checkNaN = function(oldVal,newVal,ancestors) {
    return _check(oldVal,newVal, ancestors, EQUIVALENCY_ERROR, function() { return _isNaN(newVal) })
  }

  var _checkIfArrays = function(oldVal,newVal,ancestors) {
    return _check(oldVal,newVal, ancestors, EQUIVALENCY_ERROR, function() {
      return (oldVal instanceof Array) === (newVal instanceof Array)
    })
  }

  var _checkIsObject = function(oldVal,newVal,ancestors) {
    return _check(oldVal,newVal,ancestors, EQUIVALENCY_ERROR, function() { return _isObject(newVal) })
  }

  var _checkPrimitiveValues = function(oldVal,newVal,ancestors) {
    return _check(oldVal,newVal, ancestors, EQUIVALENCY_ERROR, function() { return oldVal === newVal })
  }

  var _checkObjectKeys = function(oldVal,newVal,ancestors) {
    var oldKeys = Object.keys(oldVal)
    var newKeys = Object.keys(newVal)
    var result = true

    oldKeys.forEach(function(oldKey) {
      var localResult = _check(oldKey,newVal,ancestors, NO_KEY_ERROR, function() { return newKeys.indexOf(oldKey) !== -1 })
      result = result ? localResult : false
    })

    newKeys.forEach(function(newKey) {
      var localResult = _check(oldVal,newKey,ancestors, TOO_MANY_KEYS_ERROR, function() { return oldKeys.indexOf(newKey) !== -1 })
      result = result ? localResult : false
    })

    return result
  }

  var _checkObjectValues = function(oldObj,newObj,ancestors) {
    var result = true
    for (key in oldObj) {
      var newAncestors = ancestors.concat([key])
      if(newObj[key] !== undefined) {
        var localResult = _duff(oldObj[key], newObj[key],newAncestors)
        result = result ? localResult : false
      }
    }

    return result
  }

  var _duff = function (oldVal, newVal, ancestors) {
    if(_isNaN(oldVal)) { return _checkNaN(oldVal,newVal,ancestors) };

    if(_isObject(oldVal)) {
      if( !_checkIsObject(oldVal,newVal,ancestors) ) { return false }
      var arrayCheck  = _checkIfArrays(oldVal,newVal,ancestors)
      var keysCheck   = _checkObjectKeys(oldVal,newVal,ancestors)
      var valuesCheck = _checkObjectValues(oldVal,newVal,ancestors)

      return (arrayCheck && keysCheck && valuesCheck)
    }

    return _checkPrimitiveValues(oldVal,newVal,ancestors)
  };

  return { errors: _errors, value: _duff(oldVal,newVal,[]) }
};



(function() {
  var assert = function(message,assertion) {
    (assert.counter === undefined) ? assert.counter = 1 : assert.counter++
    if ( !assertion() ) {
     throw( new Error("test failed: " + message) )
    }
  };
  var xassert = function(message) {
    console.log('The follow test has been marked as pending: ' + message)
  }
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
      var actual = duff(oldVal,newVal);

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
  });

  assert('handles nonequivalent strings', function() {
    var actual = duff('str', 'str1')
    return actual.value === false && actual.errors.length === 1
  });

  assert('handles nonequivalent integers', function() {
    var actual = duff(1, 2)
    return actual.value === false && actual.errors.length === 1
  });

  assert('handles nonequivalent floats', function() {
    var actual = duff(1.1, 1.2)
    return actual.value === false && actual.errors.length === 1
  });

  assert('handles a target array with too many keys', function() {
    var actual = duff([1],[1,2])
    return actual.value === false && actual.errors.length === 1
  });

  assert('handles a target array with too few keys', function() {
    var actual = duff([1,2],[1])
    return actual.value === false && actual.errors.length === 1
  });

  assert('handles a target array with muliple errors', function() {
    var actual = duff([1,2],[1,3,4])
    return actual.value === false && actual.errors.length === 2
  })

  assert('handles a target object with an excess key', function() {
    var actual = duff({a:1},{a:1,b:2})
    return actual.value === false && actual.errors.length === 1
  });

  assert('handles a target object missing a key', function() {
    var actual = duff({a:1,b:2},{a:1})
    return actual.value === false && actual.errors.length === 1
  });

  assert('handles a target object with muliple errors', function() {
    var actual = duff({a:1,b:2},{a:1,b:3,c:3})
    return actual.value === false && actual.errors.length === 2
  });

  assert('handles nested objects (integration-y)', function() {
    var originalObject =
      {
        widgetIds: ['1','2','3'],
        gadgets: [
          { name: 'bar', use: 'gadgeting' },
          { name: 'baz', use: 'ungadgeting'}
        ],
        type: 'foo'
      }

    var targetObject =
      {
        widgetIds: ['1','2','5','4'],
        gadgets: [
          { name: 'bar', use: 'gadgetizing' },
          { name: 'baz', use: 'ungadgeting', bar: [1,2,3] }
        ]
      }

    var expectedErrors =
      [
        'Expected target object to have key "type". No such key was found.',
        'Expected target object ["widgetIds"] to not have key "3".',
        'Expected target object ["widgetIds"]["2"] to equal "3". Instead, it was set to "5".',
        'Expected target object ["gadgets"]["0"]["use"] to equal "gadgeting". Instead, it was set to "gadgetizing".',
        'Expected target object ["gadgets"]["1"] to not have key "bar".'
      ].sort()

    var actual = duff(originalObject,targetObject)
    var doErrorsMatch = actual.errors.sort().every(function(actualError,index) {
      return actualError === expectedErrors[index]
    })

    return doErrorsMatch && actual.value === false
  })

  console.log(assert.counter + ' tests passed')
})();
