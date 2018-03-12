const minimist = require('minimist');
let args = minimist(process.argv.slice(2), {
    default: {
        f: "agentConf.json"
    },
});
console.log("[Agent] Using arguments "+args);

var agentConfFile = args.f;
console.log("[Agent] Reading agent configuration "+agentConfFile);
var fs = require("fs");
var content = fs.readFileSync(agentConfFile);
var agentConf = JSON.parse(content);


console.log("[Agent] Creating agent context and tokens");
const uuid = require('uuid/v4');
const _ = require("underscore");
var agent = {id:uuid()}
var agentContext = {tokens:[], tokenSessions:[], properties:agentConf.properties, controllerUrl : agentConf.gridHost};
_.each(agentConf.tokenGroups, function(tokenGroup) {
	var tokenConf = tokenGroup.tokenConf;
	var attributes = tokenConf.attributes;
	attributes['$agenttype'] = 'node';
	for(i=0;i<tokenGroup.capacity;i++) {
		var token = {id:uuid(),agentid:agent.id,attributes:attributes, selectionPatterns:{}};
		agentContext.tokens.push(token);
		agentContext.tokenSessions[token.id] = {};
	}
})

//console.log("Resulting tokenSessions: " + agentContext.tokenSessions);
//console.log("Resulting tokens: " + agentContext.tokens);


console.log("[Agent] Starting agent services");
var express = require('express'),
  app = express(),
  port = agentConf.agentPort || 3000,
  bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/routes');
routes(app, agentContext);

app.listen(port);

var os = require("os");
var agentServicesUrl = agentConf.agentUrl || "http://"+os.hostname()+":"+port;
console.log("[Agent] Registering agent as "+agentServicesUrl + " to grid " + agentConf.gridHost);


console.log("[Agent] Creating registration timer");
var registrationPeriod = agentConf.registrationPeriod || 5000;
const request = require('request');
setInterval(function () {
    request({uri:agentConf.gridHost+'/grid/register',
			 method: 'POST',
			 json: true,
			 body: {"agentRef":{"agentId":agent.id, "agentUrl":agentServicesUrl}, "tokens":agentContext.tokens}
			}, function(err, res, body) {
				if(err) {
					console.log(err);
				}
			});
}, registrationPeriod);

console.log('[Agent] Successfully started on: ' + port);
