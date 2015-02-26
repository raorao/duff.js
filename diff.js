assert = function(message,assertion) {
  if ( !assertion() ) {
   throw( new Error("test failed: " + message) )
  }
}

assert('one should equal one', function() {
  return 1 == 1
})

console.log('all tests passed')
