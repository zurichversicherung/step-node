module.exports = function FileManager(agentContext) {

	var exports = {};

	const fs = require('fs');
	const shell = require('shelljs');
	const http = require('http');
	const unzip = require('unzip2');
	//exports.filepath = process.cwd() + "/work/filemanager/";
	exports.filepath = agentContext.properties['filemanagerPath'] + "/work/";

	shell.rm('-rf', exports.filepath);
	fs.mkdirSync(exports.filepath);

	var filemanagerMap = {};

	exports.loadOrGetKeywordFile = function(controllerUrl, fileId, fileVersionId) {

		return new Promise(function(resolve, reject) {

			var filePath = exports.filepath + fileId +"/"+ fileVersionId;
			var fileName = '';

			if (!fs.existsSync(filePath)) {
				console.log("[FileManager] filepath doesn't exist: " + filePath);
				shell.mkdir('-p', filePath);
				console.log("[FileManager] filepath created.");

				console.log("[FileManager] Requesting file transfer from: " + controllerUrl + fileId);
				var filenamePromise = getKeywordFile(controllerUrl + fileId, filePath);

				filenamePromise.then(function(result){
					console.log("[FileManager] Transfered file " + result + " from "+ controllerUrl + fileId);
					filemanagerMap[fileId] = { 'name' : result, 'fileVersionId' : fileVersionId };
					resolve(filePath + '/' + result);
				}, function(err){
					console.log("Error :" + err);
					reject(err);
				});

			} else {
				if(filemanagerMap[fileId] &&  filemanagerMap[fileId]['name']){
					console.log("[FileManager] Entry found for fileId " + fileId + ": " + fileName +"="+ filemanagerMap[fileId]['name']);
					fileName = filemanagerMap[fileId]['name'];

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

	function getKeywordFile(controllerFileUrl, targetDir) {
		return new Promise(function(resolve, reject) {
			http.get(controllerFileUrl, (resp) => {
				var filename = parseName(resp.headers);
				var filepath = targetDir+"/"+filename;
				if(isDir(resp.headers)) {
					resp.pipe(unzip.Extract({ path: filepath })).on('close', ()=>resolve(filename));
				} else {
					var myFile = fs.createWriteStream(filepath);
					resp.pipe(myFile).on('finish', ()=>resolve(filename));
				}
			}).on("error", (err) => {
				console.log("Error: " + err.message);
				reject(err);
			});
		});
	};

	function parseName(headers){
		var contentDisposition = JSON.stringify(headers['content-disposition']);
		return contentDisposition.split("filename = ")[1].split(";")[0];
	};
	
	function isDir(headers){
		var contentDisposition = JSON.stringify(headers['content-disposition']);
		return contentDisposition.split("type = ")[1].split(";")[0].startsWith('dir');
	};
	return  exports;
}
