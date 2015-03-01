var duff = require('./duff.js').duff;

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
      (function foo() {
        var expectedCount = oldValIndex === newValIndex ? 0 : 1
        var message = "expected duff(" + oldVal + "," + newVal + ") to have " + expectedCount + " errors."
        assert(message,function() { return duff(oldVal,newVal).errors.length === expectedCount })
      })();

      (function foo() {
        var expectedValue = oldValIndex === newValIndex
        var message = "expected duff(" + oldVal + "," + newVal + ") to have value of " + expectedValue + "."
        assert(message,function() { return duff(oldVal,newVal).value === expectedValue })
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

  // handles ignoreOrder option

  assert('with ignoreOrder ignores array order', function() {
    var actual = duff([1,2],[2,1],{ignoreOrder: true})
    return actual.value === true && actual.errors.length === 0
  });

  assert('with ignoreOrder does not ignore array values', function() {
    var actual = duff([1,2],[3,1],{ignoreOrder: true})
    return actual.value === false && actual.errors.length === 1
  });

  assert('has no affect on objects', function() {
    var actual = duff({a: 1, b: [2,1]},{a: 2, b: [1,2]},{ignoreOrder: true})
    return actual.value === false && actual.errors.length === 1
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
        'Expected target object ["widgetIds"] to not have index 3.',
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
