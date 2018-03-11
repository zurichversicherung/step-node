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

		//console.log("req params=" + JSON.stringify(req.params));
		//console.log("req body=" + JSON.stringify(req.body));

		exports.process_(tokenId, keywordName, argument, properties, function(payload) {
			res.json(payload);
		});
	}

	exports.process_ = async function(tokenId, keywordName, argument, properties, callback) {
		var outputBuilder = new OutputBuilder(callback);

		try {
			var fileDescPromise = exports.filemanager.getKeywordFile(agentContext.controllerUrl + "/grid/file/" + properties['$node.js.file.id'], keywordName);

			await fileDescPromise.then(function(result){
					exports.filemanager.persistKeywordFile(result.filename, result.data);
					exports.executeKeyword(keywordName, result.filename, tokenId, argument, outputBuilder, agentContext);
			}, function(err){
				console.log("error while attempting to run keyword " + keywordName + " :" + err);
			});

		} catch(e) {
			outputBuilder.fail(e);
		}
	};

	exports.executeKeyword = async function(keywordName, filename, tokenId, argument, outputBuilder, agentContext){

		console.log('requiring keyword file: ' + exports.filemanager.filepath + filename );
		var kwMod = require(exports.filemanager.filepath + filename);
		var keywordFunction = kwMod[keywordName];
		if(keywordFunction) {

			var session = agentContext.tokenSessions[tokenId];
			if(!session)
			session = {};

			console.log("executing keyword: " + keywordName);
			let result = await keywordFunction(argument, outputBuilder, session).catch(function(e){
				console.log("keyword execution failed: " + e);
				outputBuilder.fail(e);
			});

			console.log("keyword execution succeeded");
		} else {
			outputBuilder.fail("Unable to find keyword "+keywordName+" in "+keywordLibScript);
		}

	};

	return  exports;
}
