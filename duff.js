var duff = function(oldVal,newVal,maybeOptions) {
  var _ignoreOrder = maybeOptions && maybeOptions.ignoreOrder
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
        var isArray = newVal instanceof Array
        var key     = isArray ? parseInt(oldVal) : oldVal
        var qualifier = isArray ? 'index' : 'key'
        return "to have " + qualifier + " "  + _toString(key) + ". No such " + qualifier + " was found."
      break;
      case TOO_MANY_KEYS_ERROR:
        var isArray = oldVal instanceof Array
        var key     = isArray ? parseInt(newVal) : newVal
        var qualifier = isArray ? 'index' : 'key'
        return "to not have " + qualifier + " " + _toString(key) + "."
      break;
    }
  }

  var _createError = function(oldVal,newVal,type,ancestors) {
    return "Expected target object " + _createAncestors(ancestors) + _createErrorMessage(oldVal,newVal,type)
  }

  var _maybeSort = function(object) {
    return _ignoreOrder && (object instanceof Array) ? object.sort() : object
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
    var maybeSortedOldObj = _maybeSort(oldObj);
    var maybeSortedNewObj = _maybeSort(newObj);

    for (key in maybeSortedOldObj) {
      var newAncestors = ancestors.concat([key])
      if(maybeSortedNewObj[key] !== undefined) {
        var localResult = _duff(maybeSortedOldObj[key], maybeSortedNewObj[key],newAncestors)
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

var Duff = {duff: duff}

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
  module.exports  = Duff;
};