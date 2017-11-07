/*
   _kjservlet_sys_internal_.js

   Copyright 2013 Keijack

   This Source Code Form is subject to the terms of the GPL v.3.0. or Apache License v.2.0 (Need permission)  
   
   If a copy of the Permitted license was not distributed with this file, You can obtain one at following links.
   
   GPL: https://www.gnu.org/licenses/gpl.html
   
   Apache License: http://www.apache.org/licenses/LICENSE-2.0
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

var $MTSGlobal = (function() {
	var ThreadSafeZone = Java.type("org.keijack.kjservlet.MultiThreadSafeModel");
	return new ThreadSafeZone("$MultiThreadSafeGlobal");
})();
