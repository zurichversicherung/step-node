module.exports = function FileManager(agentContext) {

	var exports = {};

	exports.getKeywordFile = function(controllerFileUrl, keywordName, tokenId, argument, outputBuilder, agentContext, callback) {
		console.log("Getting keyword file from gridHost : " + controllerFileUrl);
		const http = require('http');

		http.get(controllerFileUrl, (resp) => {
			let data = '';

			resp.on('data', (chunk) => {
				data += chunk;
			});

			resp.on('end', () => {
				callback(data, keywordName, argument, tokenId, agentContext, outputBuilder);
			});

		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
	};

	exports.persistKeywordFile = function(data, keywordName, argument, tokenId, agentContext, outputBuilder){
		var filename = "test.js";
		var filepath = "C:\\Dev\\node\\filemanager\\" + filename;

		var fs = require('fs');
		//console.log("Data= " + data);
		fs.writeFileSync(filepath, data, function(err) {
			if(err) {
				return console.log(err);
			}

			console.log("The file was saved!");
		});

		var kwMod = require(filepath);
		var keywordFunction = kwMod[keywordName];
		if(keywordFunction) {

			var session = agentContext.tokenSessions[tokenId];
			if(!session)
				session = {};
			console.log("invoking keyword : " + keywordFunction);

			console.log("{DEBUG2} " + agentContext.tokenSessions + " JSON= " + JSON.stringify(agentContext.tokenSessions) + " ; tokenId=" + tokenId);

		keywordFunction(argument, outputBuilder, session).catch(function(e){
					console.log("keyword execution failed: " + e);
				outputBuilder.fail(e);
			});
		} else {
			outputBuilder.fail("Unable to find keyword "+keywordName+" in "+keywordLibScript);
		}

	};

	return  exports;
}
