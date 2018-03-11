module.exports = function FileManager(agentContext) {

	var exports = {};

	var fs = require('fs');
	var shell = require('shelljs');
	//exports.filepath = process.cwd() + "/work/filemanager/";
	exports.filepath = agentContext.properties['filemanagerPath'] + "/work/";

	shell.rm('-rf', exports.filepath);
	fs.mkdirSync(exports.filepath);

	exports.filemanagerMap = {};

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

					exports.filemanagerMap[fileId] = { 'name' : result.filename, 'fileVersionId' : fileVersionId };
					console.log("[FileManager] Persisting file : " +result.filename + " to " + filePath);
					exports.persistKeywordFile(filePath + "/" + result.filename, result.filename, result.data);
					resolve(filePath + '/' + result.filename);

				}, function(err){
					console.log("Error :" + err);
					reject(err);
				});

			} else {
				if(exports.filemanagerMap[fileId] &&  exports.filemanagerMap[fileId]['name']){
					console.log("[FileManager] Entry found for fileId " + fileId + ": " + fileName +"="+ exports.filemanagerMap[fileId]['name']);
					fileName = exports.filemanagerMap[fileId]['name'];

					if(!fs.existsSync(filePath + "/" + fileName)){
						//console.log("Entry exists but no file found: " + filePath + "/" + fileName);
						reject("Entry exists but no file found: " + filePath + "/" + fileName);
					}

					resolve(filePath + '/' + fileName);
				}else{
					//console.log();
					reject("[FileManager] Entry doesn't exist for file");
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
