module.exports = function FileManager(agentContext) {

	var exports = {};

	//exports.filepath = process.cwd() + "/work/filemanager/";
	exports.filepath = "C:\\tmp\\";

	var fs = require('fs');
	if (!fs.existsSync(exports.filepath)){
	    fs.mkdirSync(exports.filepath);
	}

	exports.getKeywordFile = function(controllerFileUrl, keywordName, callback) {
		console.log("Getting keyword file from gridHost : " + controllerFileUrl);
		const http = require('http');

		return new Promise(function(resolve, reject) {

			http.get(controllerFileUrl, (resp) => {
				let data = '';
				resp.on('data', (chunk) => {
					data += chunk;
				});

				resp.on('end', () => {
					resolve({ 'data' : data, 'headers' : resp.headers });
				});

			}).on("error", (err) => {
				console.log("Error: " + err.message);
				reject(err);
			});

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
				console.log(err);
				return null;
			}

			console.log("The file is written!");
		});

	};
	return  exports;
}
