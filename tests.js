const testContext = require.context('./test', true, /.*\.js$/)
testContext.keys().forEach(testContext)
