module.exports = function Controller(agentContext) {

	var exports = {};

	var FileManager = require('../filemanager/filemanager');
	var OutputBuilder = require('./output');
	exports.filemanager = new FileManager(agentContext);

	exports.reserveToken = function(req, res) {
		exports.reserveToken_(req.params.tokenId);
		res.json({});
	}

	exports.reserveToken_ = function(tokenId) {
		console.log("Reserving token: "+tokenId);
	};

	exports.releaseToken = function(req, res) {
		exports.releaseToken_(req.params.tokenId);
		res.json({});
	};

	exports.releaseToken_ = function(tokenId) {
		console.log("Releasing token: "+tokenId);
	};

	exports.process = function(req, res) {
		var tokenId = req.params.tokenId;
		var keywordName = req.body.function;
		var argument = req.body.argument;
		var properties = req.body.properties;
		exports.process_(tokenId, keywordName, argument, properties, function(output) {
			res.json(output);
		});
	}

	exports.process_ = function(tokenId, keywordName, argument, properties, callback) {
		console.log("Executing " + keywordName + " on token : "+tokenId + " with fullBody : " + JSON.stringify(properties));

		console.log("{DEBUG1} " + agentContext.tokenSessions + " JSON= " + JSON.stringify(agentContext.tokenSessions));

		var outputBuilder = new OutputBuilder();

		try {
			var keywordFunction;
			var keywordLibScripts = [];

			var keywords = agentContext.properties['keywords'];
			if(keywords) {
				var keywordsSplit = keywords.split(';');
				for(i=0;i<keywordsSplit.length;i++) {
					//keywordLibScripts.push(process.cwd()+"/"+keywordsSplit[i]);
					console.log("lib? " + keywordsSplit[i]);
				}
			}

			var keywordFile = exports.filemanager.getKeywordFile(agentContext.controllerUrl + "/grid/file/" + properties['$node.js.file.id'], keywordName, tokenId, argument, outputBuilder, agentContext, exports.filemanager.persistKeywordFile);

		} catch(e) {
			output.fail(e);
		}
	};

	return  exports;
}
