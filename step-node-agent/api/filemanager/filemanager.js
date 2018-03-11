let ___filemanagerMap = {};

module.exports = function FileManager(agentContext) {

	var exports = {};

	var shell = require('shelljs');

	//exports.filepath = process.cwd() + "/work/filemanager/";
	exports.filepath = agentContext.properties['filemanagerPath'];

	var fs = require('fs');
	if (!fs.existsSync(exports.filepath)){
		console.log("[FileManager] Root filemanager folder doesn't exist, attempting to create: " + exports.filepath);
		fs.mkdirSync(exports.filepath);
		console.log("[FileManager] Root filemanager folder created.");
	}

	exports.loadOrGetKeywordFile = function(controllerUrl, fileId, fileVersionId) {

		return new Promise(function(resolve, reject) {

			var filePath = exports.filepath + fileId +"/"+ fileVersionId;
			var fileName = '';


			if (!fs.existsSync(filePath)) {
				console.log("[FileManager] filepath doesn't exist: " + filePath);
				shell.mkdir('-p', filePath);
				console.log("[FileManager] filepath created.");

				console.log("[FileManager] Requesting file transfer from: " + controllerUrl + fileId);
				var filenamePromise = exports.getKeywordFile(controllerUrl + fileId);

				filenamePromise.then(function(result){

					console.log(" HELLOOOOOOOOOOOOOOOOOOOOOOOOOOO " + result.filename);

					___filemanagerMap[fileId] = { 'name' : result.filename, 'fileVersionId' : fileVersionId };

					console.log(" HELLLAAAA " +  ___filemanagerMap[fileId]);

					exports.persistKeywordFile(filePath + "/" + result.filename, result.filename, result.data);

					resolve(filePath + '/' + result.filename);

				}, function(err){
					console.log("Error :" + err);
					reject(err);
				});

			} else {
				if(___filemanagerMap[fileId] &&  ___filemanagerMap[fileId]['name']){
					console.log("[FileManager] Entry found for fileId " + fileId + ": " + filename +"="+ ___filemanagerMap[fileId]['name']);
					fileName = ___filemanagerMap[fileId]['name'];

					if(!fs.existsSync(filePath + "/" + fileName)){
						console.log("Entry exists but no file found: " + filePath + "/" + fileName);
						reject(err);
					}

					resolve(filePath + '/' + fileName);
				}else{
					console.log("[FileManager] Entry doesn't exist for file");
					reject(err);
				}

			}
		});

	};

	exports.getKeywordFile = function(controllerFileUrl) {
		return new Promise(function(resolve, reject) {

			console.log("Getting keyword file from gridHost : " + controllerFileUrl);
			const http = require('http');


			http.get(controllerFileUrl, (resp) => {
				let data = '';
				resp.on('data', (chunk) => {
					data += chunk;
				});

				resp.on('end', () => {
					var filename = exports.parseName(resp.headers);
					resolve({ 'data' : data, 'filename' :  filename});
					//console.log("[FileManager] Returning keyword file, filename=" + filename + " ; data=" + data);
				});

			}).on("error", (err) => {
				console.log("Error: " + err.message);
				reject(err);
			});

		});
	};

	exports.parseName = function(headers){
		var contentDisposition = JSON.stringify(headers['content-disposition']);
		return contentDisposition.split("filename = ")[1].split(";")[0];
	};

	exports.persistKeywordFile = function(path, filename, data){
		var fs = require('fs');

		console.log("[FileManager] Persisting keyword file " + filename + " into " + path);
		fs.writeFileSync(path, data, function(err) {
			if(err) {
				console.log(err);
				return null;
			}

			console.log("The file is written!");
		});

	};
	return  exports;
}
