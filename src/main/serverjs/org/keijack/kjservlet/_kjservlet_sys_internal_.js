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
			// internal components
			var path = filePath;
			if (path === "$db") {
				__kj_nashorn_engine__.eval(__kj_nashorn_inner_reader__.read("_kjservlet_db_plugin_.js"));
				return;
			} else if (path.startsWith("kjinner:")) {
				path = path.replace("kjinner:", "");
				__kj_nashorn_engine__.eval(__kj_nashorn_inner_reader__.read(path + ".js"));
				return;
			}

			while (path.indexOf(".") >= 0) {
				path = path.replace(".", "/");
			}

			if (path.startsWith("classpath:", $classpath)) {
				path = path.replace("classpath:", $classpath)
			} else {
				// relative path
				path = $classpath + path;
			}

			load(path + ".js");
		}
	}

	return fun;

})();

var $webapp = {};

var $websocket = {};

var $threadSafeZone = (function() {
	var ThreadSafeZone = Java.type("org.keijack.kjservlet.ThreadSafeZone");
	return new ThreadSafeZone;
})();
