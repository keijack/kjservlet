/**
 * import a js file to current js file.
 */
var imports = (function() {
	var imported = [];

	var fun = function(filePath) {

		if (imported.indexOf(filePath) < 0) {
			imported.push(filePath);
			doImport(filePath);
		}

		// inner function
		function doImport(filePath) {
			var path = filePath;
			if (path === "$db") {
				__kj_nashorn_engine__.eval(__kj_nashorn_inner_reader__.read("_kjservlet_db_plugin_.js"), __kj_nashorn_req_ctx__);
				return;
			} else if (path.startsWith("kjinner:")) {
				path = path.replace("kjinner:", "");
				__kj_nashorn_engine__.eval(__kj_nashorn_inner_reader__.read(path + ".js"), __kj_nashorn_req_ctx__);
				return;
			}

			while (path.indexOf(".") >= 0) {
				path = path.replace(".", "/");
			}
			path = $appEnv.fileHome + path + $appEnv.fileSuffix;
			if (path.startsWith("classpath:", $classpath)) {
				path = path.replace("classpath:", $classpath)
			}

			load(path);
		}
	}

	return fun;

})();

var $event = (function() {

	var callbacks = {};

	var eventListeners = {};

	var randomStr = function() {
		return Math.random().toString().replace("0.", "");
	};

	var event = {
		"on" : function(evtName, callback) {
			if (typeof callback !== "function")
				return;
			var listenerKey = randomStr();
			callbacks[listenerKey] = callback;

			if (!eventListeners[evtName]) {
				eventListeners[evtName] = [];
			}
			eventListeners[evtName].push(listenerKey);
			var _super = this;
			return {
				"key" : listenerKey,
				"off" : function() {
					_super.off(this.key);
				}
			};
		},
		"off" : function(listener) {
			var key;
			if (typeof listener === "object")
				key = listener.key;
			else
				key = listener;
			delete callbacks[key];
		},
		"publish" : function(evtName, data) {
			var listenerKeys = eventListeners[evtName];
			if (!listenerKeys)
				return;
			for ( var keyIdx in listenerKeys) {
				var key = listenerKeys[keyIdx];
				var callback = callbacks[key];
				if (callback)
					callback(data);
			}
		}
	};

	return event;
})();