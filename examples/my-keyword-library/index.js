const runner = require('step-node-agent').runner({ keywords: 'keywords/keywords.js' })
const assert = require('assert')

;(async () => {
  await runner.run('Open_Chrome', {})
  const output = await runner.run('Google_Search', { search: 'djigger' })
  assert.equal(output.payload.result, 'OK')
  await runner.run('Google_Search', { search: 'denkbar step' })
  assert.equal(output.payload.result, 'OK')
})()
