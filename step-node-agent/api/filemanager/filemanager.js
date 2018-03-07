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
				callback(JSON.stringify(resp.headers), data, keywordName);
			});

		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
	};

	exports.parseName = function(headers){
		var contentDisposition = JSON.stringify(JSON.parse(headers)['content-disposition']);
		return contentDisposition.split("filename = ")[1].split(";")[0];
	};

	exports.persistKeywordFile = function(headers, data, keywordName){
		var fs = require('fs');
		var filename = exports.parseName(headers);

		fs.writeFileSync(exports.filepath + filename, data, function(err) {
			if(err) {
				return console.log(err);
			}

			console.log("The file was saved!");
		});

	};
	return  exports;
}
