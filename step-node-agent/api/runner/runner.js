module.exports = function (properties) {
  const tokenId = 'local'

  const agentContext = {tokens: [], tokenSessions: {}, properties: properties}
  agentContext.tokenSessions[tokenId] = {}

  const Controller = require('../controllers/controller')
  const controller = new Controller(agentContext)

  const api = {}

  api.run = function (keywordName, input) {
    return new Promise(resolve => {
      controller.process_(tokenId, keywordName, input, function (output) { resolve(output) })
    })
  }

  return api
}
