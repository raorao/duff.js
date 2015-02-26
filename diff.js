function check(oldVal, newVal) {
  return oldVal === newVal
}



assert = function(message,assertion) {
  if ( !assertion() ) {
   throw( new Error("test failed: " + message) )
  }
}

assert('check handles strings', function() {
  return check('str', 'str')
})

console.log('all tests passed')
