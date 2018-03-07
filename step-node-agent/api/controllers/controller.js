module.exports = function Controller(agentContext) {

	var exports = {};

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

		var outputBuilder = {attachments:[]};
		var output = {
			send: function(payload) {
				outputBuilder.payload = payload;
				if(callback) {
					callback(outputBuilder);
				}
			},
			fail: function(e) {
				console.log(e);
				if(e instanceof Error) {
					outputBuilder.error = e.message;
				} else {
					outputBuilder.error = e;
				}
				if(callback) {
					callback(outputBuilder);
				}
			},
			attach: function(attachment) {
				outputBuilder.attachments.push(attachment);
			}
		};

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

			var keywordFile = exports.getKeywordFile(agentContext.controllerUrl + "/grid/file/" + properties['$node.js.file.id'], keywordName, tokenId, argument, output, exports.persistKeywordFile);

		} catch(e) {
			output.fail(e);
		}
	};


		exports.getKeywordFile = function(controllerFileUrl, keywordName, tokenId, argument, output, callback) {
			console.log("Getting keyword file from gridHost : " + controllerFileUrl);
			const http = require('http');

			http.get(controllerFileUrl, (resp) => {
			let data = '';

	  	resp.on('data', (chunk) => {
	    	data += chunk;
	  	});

	    resp.on('end', () => {
				callback(data, keywordName, tokenId, output);
	  	});

			}).on("error", (err) => {
	  		console.log("Error: " + err.message);
				});
		};

		exports.persistKeywordFile = function(data, keywordName, argument, tokenId, output){
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
				keywordFunction(argument, output, session).catch(function(e){
					output.fail(e);
				});
			} else {
				output.fail("Unable to find keyword "+keywordName+" in "+keywordLibScript);
			}

		};


	return  exports;
}
