A diff-ing tool that produces usable messages.

Usage
---------------

```javascript
  var Duff = require('duff.js')
  var result = Duff.duff(ORIGNAL_OBJECT,TARGET_OBJECT,OPTIONS)
  result.errors // array of error messages
  result.value  // boolean value specifying whether the passed-in objects are deeply equivalent.
```

Available Options:

* __ignoreOrder__: When set to ```true```, Duff will sort all arrays before comparing them.

Note: Only JSON-compliant objects are supported. Objects with circular references, custom objects, or functions will not necessary work with Duff.


Example
------------

```javascript
  var duff = require('duff.js').duff

  var oldObj =
    {
      widgetIds: ['1','2','3'],
      gadgets: [
        { name: 'bar', use: 'gadgeting' },
        { name: 'baz', use: 'ungadgeting'}
      ],
      type: 'foo'
    }

  var newObj =
    {
      widgetIds: ['1','2','5','4'],
      gadgets: [
        { name: 'bar', use: 'gadgetizing' },
        { name: 'baz', use: 'ungadgeting', bar: [1,2,3] }
      ]
    }

  var result = duff(oldObj,newObj)

  result.value // false

  result.errors
    // [
    //   'Expected target object to have key "type". No such key was found.',
    //   'Expected target object ["widgetIds"] to not have index 3.',
    //   'Expected target object ["widgetIds"]["2"] to equal "3". Instead, it was set to "5".',
    //   'Expected target object ["gadgets"]["0"]["use"] to equal "gadgeting". Instead, it was set to "gadgetizing".',
    //   'Expected target object ["gadgets"]["1"] to not have key "bar".'
    // ]
```
