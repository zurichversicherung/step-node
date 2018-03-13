'use strict'
module.exports = function (app, agentContext) {
  const Controller = require('../controllers/controller')
  const controller = new Controller(agentContext)

  app.route('/token/:tokenId/reserve').get(controller.reserveToken)
  app.route('/token/:tokenId/release').get(controller.releaseToken)
  app.route('/token/:tokenId/process').post(controller.process)
}
