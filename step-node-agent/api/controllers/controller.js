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

	exports.process_ = async function(tokenId, keywordName, argument, properties, callback) {
		console.log("Executing " + keywordName + " on token : "+tokenId + " with fullBody : " + JSON.stringify(properties));

		var outputBuilder = new OutputBuilder();

		try {
			var keywordFunction;
			var keywordLibScripts = [];

			var keywords = agentContext.properties['keywords'];
			if(keywords) {
				var keywordsSplit = keywords.split(';');
				for(i=0;i<keywordsSplit.length;i++) {
					//keywordLibScripts.push(process.cwd()+"/"+keywordsSplit[i]);
				}
			}

			let keywordFile = await exports.filemanager.getKeywordFile(agentContext.controllerUrl + "/grid/file/" + properties['$node.js.file.id'], keywordName, exports.filemanager.persistKeywordFile);
					console.log("file written. executing kw :" + keywordName);
			let keywordExec = await exports.executeKeyword(keywordName, tokenId, argument, outputBuilder, agentContext);

		} catch(e) {
			output.fail(e);
		}
	};

	exports.executeKeyword = async function(keywordName,  tokenId, argument, outputBuilder, agentContext){

		var kwMod = require(exports.filemanager.filepath + keywordName + ".js");
		var keywordFunction = kwMod[keywordName];
		if(keywordFunction) {

			var session = agentContext.tokenSessions[tokenId];
			if(!session)
			session = {};
			console.log("invoking keyword : " + keywordFunction);

			console.log("{DEBUG2} " + agentContext.tokenSessions + " JSON= " + JSON.stringify(agentContext.tokenSessions) + " ; tokenId=" + tokenId);

			let result = await keywordFunction(argument, outputBuilder, session).catch(function(e){
				console.log("keyword execution failed: " + e);
				outputBuilder.fail(e);
			});
		} else {
			outputBuilder.fail("Unable to find keyword "+keywordName+" in "+keywordLibScript);
		}

	};

	return  exports;
}
