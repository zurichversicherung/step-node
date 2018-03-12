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
		console.log("[Controller] Reserving token: "+tokenId);
	};

	exports.releaseToken = function(req, res) {
		exports.releaseToken_(req.params.tokenId);
		res.json({});
	};

	exports.releaseToken_ = function(tokenId) {
		console.log("[Controller] Releasing token: "+tokenId);
	};

	exports.process = function(req, res) {
		var tokenId = req.params.tokenId;
		var keywordName = req.body.function;
		var argument = req.body.argument;
		var properties = req.body.properties;

		//console.log("req params=" + JSON.stringify(req.params));
		//console.log("req body=" + JSON.stringify(req.body));

		exports.process_(tokenId, keywordName, argument, properties, function(payload) {
			res.json(payload);
		});
	}

	exports.process_ = function(tokenId, keywordName, argument, properties, callback) {
		var outputBuilder = new OutputBuilder(callback);

		try {
			var filepathPromise = exports.filemanager.loadOrGetKeywordFile(agentContext.controllerUrl + "/grid/file/", properties['$node.js.file.id'], properties['$node.js.file.version'], keywordName);

			filepathPromise.then(function(result){
				var keywordFile;
				if(result.endsWith('.js')) {
					keywordFile = result;
				} else {
					keywordFile = result + "/keywords/keywords.js"
				}
				
				console.log("[Controller] Executing keyword " + keywordName + " using filepath " + keywordFile);
				exports.executeKeyword(keywordName, keywordFile, tokenId, argument, outputBuilder, agentContext);
			}, function(err){
				console.log("[Controller] Error while attempting to run keyword " + keywordName + " :" + err);
			});

		} catch(e) {
			outputBuilder.fail(e);
		}
	};

	exports.executeKeyword = async function(keywordName, filepath, tokenId, argument, outputBuilder, agentContext){

		console.log('[Controller] Requiring keyword file: ' + filepath);
		var kwMod = require(filepath);
		var keywordFunction = kwMod[keywordName];
		if(keywordFunction) {

			var session = agentContext.tokenSessions[tokenId];
			if(!session)
			session = {};

			console.log("[Controller] Executing keyword: " + keywordName);
			let result = await keywordFunction(argument, outputBuilder, session).catch(function(e){
				console.log("[Controller] Keyword execution failed: " + e);
				outputBuilder.fail(e);
			});

			console.log("[Controller] Keyword execution succeeded");
		} else {
			outputBuilder.fail("Unable to find keyword "+keywordName+" in "+keywordLibScript);
		}

	};

	return  exports;
}
