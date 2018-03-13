const runner = require('step-node-agent').runner({keywords: 'keywords/testcafe/keywords.js'});

(async () => {
  await runner.run('Google_Search', { 'url': 'https://www.google.ch/', 'search': 'denkbar' })
})()
