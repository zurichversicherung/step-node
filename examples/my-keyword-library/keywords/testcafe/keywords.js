exports.Google_Search = async function (input, output, session) {
  try {
    const createTestCafe = require('testcafe')
    const inputStore = require('./input-store')

    let testcafe = null

    createTestCafe('localhost', 1337, 1338)
      .then(tc => {
        testcafe = tc
        const runner = testcafe.createRunner()

        Object.keys(input).map(e => {
          inputStore[e] = input[e]
        })

        return runner
          .src('keywords/testcafe/example.js')
          .browsers(['chrome'])
          .run()
      })
      .then(failedCount => {
        console.log('Tests failed: ' + failedCount)
        testcafe.close()
      })
  } catch (e) {
    output.fail(e)
  }
}
