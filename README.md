A JSON diff-ing tool that produces usable messages.


Usage
------------

(currently WIP)

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
        { name: 'baz', use: 'ungadgeting'}
      ]
    }

  check = duff(oldObj,newObj)

  check.errors ==
  [
    "Expected target object [widgetIds][2] to equal 3. Instead, it was set to 5.",
    "Expected target object [widgetIds] to have three elements. Instead, it had 4.",
    "Expected target object [gadgets][0][use] to equal 'gadgeting'. Instead, it was set to 'gadgetizing'.",
    "Expected target object to have key [type]."
  ]

```
