module.exports = function FileManager(agentContext) {

	var exports = {};

	exports.filepath = "C:\\Dev\\node\\filemanager\\";

	exports.getKeywordFile = function(controllerFileUrl, keywordName, callback) {
		console.log("Getting keyword file from gridHost : " + controllerFileUrl);
		const http = require('http');

		http.get(controllerFileUrl, (resp) => {
			let data = '';

			resp.on('data', (chunk) => {
				data += chunk;
			});

			resp.on('end', () => {
				callback(data, keywordName);
			});

		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
	};

	exports.persistKeywordFile = function(data, keywordName){
		var fs = require('fs');
		//console.log("Data= " + data);
		fs.writeFileSync(exports.filepath + keywordName + ".js", data, function(err) {
			if(err) {
				return console.log(err);
			}

			console.log("The file was saved!");
		});
	};

	return  exports;
}
