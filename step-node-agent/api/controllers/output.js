module.exports = function OutputBuilder(callback) {

	var exports = {};

	exports.output = {attachments:[]};

	exports.send = function(payload, callback) {
		exports.output.payload = payload;
		if(callback) {
			callback(outputBuilder);
		}
	};

	exports.fail = function(e) {
		console.log(e);
		if(e instanceof Error) {
			exports.output.error = e.message;
		} else {
			exports.output.error = e;
		}
		if(callback) {
			callback(outputBuilder);
		}
	};

	exports.attach = function(attachment) {
		output.attachments.push(attachment);
	};

	return exports;
}
