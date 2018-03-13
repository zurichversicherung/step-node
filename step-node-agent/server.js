const minimist = require('minimist')
let args = minimist(process.argv.slice(2), {
  default: {
    f: 'agentConf.json'
  }
})
console.log('[Agent] Using arguments ' + args)

const agentConfFile = args.f
console.log('[Agent] Reading agent configuration ' + agentConfFile)
const fs = require('fs')
const content = fs.readFileSync(agentConfFile)
const agentConf = JSON.parse(content)

console.log('[Agent] Creating agent context and tokens')
const uuid = require('uuid/v4')
const _ = require('underscore')
const agent = {id: uuid()}
let agentContext = {tokens: [], tokenSessions: [], properties: agentConf.properties, controllerUrl: agentConf.gridHost}
_.each(agentConf.tokenGroups, function (tokenGroup) {
  const tokenConf = tokenGroup.tokenConf
  let attributes = tokenConf.attributes
  attributes['$agenttype'] = 'node'
  for (let i = 0; i < tokenGroup.capacity; i++) {
    const token = { id: uuid(), agentid: agent.id, attributes: attributes, selectionPatterns: {} }
    agentContext.tokens.push(token)
    agentContext.tokenSessions[token.id] = {}
  }
})

console.log('[Agent] Starting agent services')
const express = require('express')
const app = express()
const port = agentConf.agentPort || 3000
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const routes = require('./api/routes/routes')
routes(app, agentContext)

app.listen(port)

const os = require('os')
const agentServicesUrl = agentConf.agentUrl || 'http://' + os.hostname() + ':' + port
console.log('[Agent] Registering agent as ' + agentServicesUrl + ' to grid ' + agentConf.gridHost)

console.log('[Agent] Creating registration timer')
const registrationPeriod = agentConf.registrationPeriod || 5000
const request = require('request')
setInterval(function () {
  request({
    uri: agentConf.gridHost + '/grid/register',
    method: 'POST',
    json: true,
    body: { agentRef: { agentId: agent.id, agentUrl: agentServicesUrl }, tokens: agentContext.tokens }
  }, function (err, res, body) {
    if (err) {
      console.log(err)
    }
  })
}, registrationPeriod)

console.log('[Agent] Successfully started on: ' + port)
