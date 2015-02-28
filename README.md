A JSON diff-ing tool that produces usable messages.


Usage
------------

```javascript
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

  check = duff(oldObj,newObj)

  check.value // false

  check.errors
    // [
    //   'Expected target object to have key "type". No such key was found.',
    //   'Expected target object ["widgetIds"] to not have index 3.',
    //   'Expected target object ["widgetIds"]["2"] to equal "3". Instead, it was set to "5".',
    //   'Expected target object ["gadgets"]["0"]["use"] to equal "gadgeting". Instead, it was set to "gadgetizing".',
    //   'Expected target object ["gadgets"]["1"] to not have key "bar".'
    // ]
```

```duff``` also supports an third argument options. A key of ```ignoreOrder``` set to ```false``` will ignore array element ordering.