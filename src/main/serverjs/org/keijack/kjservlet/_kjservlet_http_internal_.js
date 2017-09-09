(function() {
	var appEnvDefaultConf = {
		fileHome : "classpath:",
		fileSuffix : ".js",
		controller : {
			encoding : "utf8",
			pkg : "",
			suffix : "",
			parameterJSONFriendly : true,
		},
		view : {
			resolver : "jsp",
			prefix : "",
			suffix : ".jsp",
		}
	};

	_kj_util_.json.extand($appEnv, appEnvDefaultConf);
	$appEnv.res = {
		"_starts_" : [],
		"_ends_" : [],
		"_includes_" : [],
		"_equals_" : [],
		"matches" : function(path) {
			if (!path || typeof path != "string")
				return false;
			path = path.replaceAll("//", "/");
			for (var i = 0; i < this._starts_.length; i++) {
				if (path.startsWith(this._starts_[i]))
					return true;
			}
			for (var i = 0; i < this._ends_.length; i++) {
				if (path.endsWith(this._ends_[i]))
					return true;
			}
			for (var i = 0; i < this._includes_.length; i++) {
				if (path.indexOf(this._includes_[i]) >= 0)
					return true;
			}
			for (var i = 0; i < this._equals_.length; i++) {
				if (path == this._equals_[i])
					return true;
			}
		}
	};
	if ($appEnv.resources) {
		var resPatterns = _kj_util_.array.getArray($appEnv.resources);
		for (var i = 0; i < resPatterns.length; i++) {
			var pattern = resPatterns[i];
			if (!pattern || typeof pattern != "string")
				continue;
			if (pattern.startsWith("*") && pattern.endsWith("*")) {
				$appEnv.res._includes_.push(pattern.replaceAll("*", "").replaceAll("//", "/"));
			} else if (pattern.startsWith("*")) {
				$appEnv.res._ends_.push(pattern.replaceAll("*", "").replaceAll("//", "/"));
			} else if (pattern.endsWith("*")) {
				$appEnv.res._starts_.push(pattern.replaceAll("*", "").replaceAll("//", "/"));
			} else {
				$appEnv.res._equlas_.push(pattern.replaceAll("*", "").replaceAll("//", "/"));
			}
		}
	}

})();

var $renderer = (function() {
	return {
		render : function(contentType, content, headers) {
			return {
				"_content_type" : contentType,
				"data" : content,
				"headers" : headers
			};
		},
		text : function(text, headers) {
			return {
				"_content_type" : "text/plain",
				"data" : text,
				"headers" : headers
			};
		},
		html : function(data, headers) {
			return {
				"_content_type" : "text/html",
				"data" : data,
				"headers" : headers
			};
		},
		json : function(data, headers) {
			return {
				"_content_type" : "application/json",
				"data" : data,
				"headers" : headers
			};
		},
		bytes : function(data, headers) {
			return {
				"_content_type" : "bytes",
				"data" : data,
				"headers" : headers
			};
		},
		redirect : function(url, headers) {
			return {
				"_content_type" : "redirect",
				"data" : url,
				"headers" : headers
			};
		},
		forward : function(url, data, headers) {
			return {
				"_content_type" : "forward",
				"url" : url,
				"data" : data,
				"headers" : headers
			};
		},
		error : function(code, message) {
			return {
				"_content_type" : "error",
				"code" : code,
				"message" : message
			};
		},
		view : function(addr, data, headers) {
			var url = $appEnv.view.prefix + addr + $appEnv.view.suffix;
			if (typeof $appEnv.view.resolver == "function") {
				try {
					if (data) {
						data.toJava = function() {
							return _kj_util_.json.toJava(this);
						};
					}
					return $appEnv.view.resolver(url, data, headers);
				} catch (err) {
					return this.error(500, err);
				}
			} else if ($appEnv.view.resolver == "jsp") {
				return this.forward(url, data, headers);
			} else if ($appEnv.view.resolver == "freemarker") {
				try {
					imports("kjinner:_kjservlet_http_freemarker_plugin_");

					var template = _kj_freemarker_conf_.getTemplate(url);
					var stringWriter = new java.io.StringWriter();
					var javaMap = _kj_util_.json.toJava(data);
					template.process(javaMap, stringWriter);
					var html = stringWriter.toString();
					return this.html(html, headers);
				} catch (err) {
					return this.error(500, err);
				}
			} else if ($appEnv.view.resolver == "velocity") {
				try {
					imports("kjinner:_kjservlet_http_velocity_plugin_");
					var template = _kj_velocity_engine_.getTemplate(url);
					var context = new org.apache.velocity.VelocityContext();
					for ( var name in data) {
						var val = _kj_util_.json.toJava(data[name]);
						context.put(name, val);
					}
					var stringWriter = new java.io.StringWriter();
					template.merge(context, stringWriter);
					var html = stringWriter.toString();
					return this.html(html, headers);
				} catch (err) {
					return this.error(500, err);
				}
			} else {
				return this.error(404, "Cannot find resolver [" + $appEnv.view.resolver + "]");
			}
		}
	};
})();

var _kj_dispatch_and_run_ = (function() {

	"use strict";

	// the java type used in this function
	var JavaByteArray = Java.type("byte[]");
	var JavaString = Java.type("java.lang.String");
	var JavaSimpleScriptContext = Java.type("javax.script.SimpleScriptContext");
	var JavaScriptContext = Java.type("javax.script.ScriptContext");
	var JavaFileReader = Java.type("java.io.FileReader");
	var JavaFile = Java.type("java.io.File");
	var JavaFileInputStream = Java.type("java.io.FileInputStream")

	/**
	 * default configurations
	 */
	var httpConf = {
		encoding : $appEnv.controller.encoding,
		parameterJSONFriendly : $appEnv.controller.parameterJSONFriendly,
		pkg : $appEnv.controller.pkg,
		suffix : $appEnv.controller.suffix,
	};

	var getCtxUri = function(request) {
		var ctx = request.getContextPath();
		if (ctx === "/")
			return request.getRequestURI();
		else
			return request.getRequestURI().replace(ctx, "");
	}

	var fun = function(request, response) {
		var ctxUri = getCtxUri(request);
		if ($appEnv.res.matches(ctxUri)) {
			// static files
			try {
				var resPath = request.getServletContext().getRealPath(ctxUri);
				var fin = new JavaFileInputStream(new JavaFile(resPath));
				var byteRead = 0;
				var buff = new JavaByteArray(1024);
				while ((byteRead = fin.read(buff)) > 0) {
					response.getOutputStream().write(buff, 0, byteRead);
				}
				fin.close();
			} catch (err) {
				response.sendError(500, err);
			}
			return;
		}
		var req = wrapRequest(request);
		req.ctxUri = ctxUri;
		var res = wrapResponse(response);
		req.controller = getController(req);
		if (!req.controller.func) {
			res.sendError(404, "cannot find controller by parsing url");
			return;
		}

		// prepare a new context for the controller
		var ctx = new JavaSimpleScriptContext();
		ctx.setBindings(__kj_nashorn_engine__.createBindings(), JavaScriptContext.ENGINE_SCOPE);
		ctx.setAttribute("$appEnv", $appEnv, JavaScriptContext.ENGINE_SCOPE);
		ctx.setAttribute("$classpath", $classpath, JavaScriptContext.ENGINE_SCOPE);
		ctx.setAttribute("__kj_nashorn_engine__", __kj_nashorn_engine__, JavaScriptContext.ENGINE_SCOPE);
		ctx.setAttribute("__kj_nashorn_inner_reader__", __kj_nashorn_inner_reader__, JavaScriptContext.ENGINE_SCOPE);
		ctx.setAttribute("__kj_nashorn_req_ctx__", __kj_nashorn_inner_reader__, JavaScriptContext.ENGINE_SCOPE);
		__kj_nashorn_engine__.eval(__kj_nashorn_inner_reader__.read("_kjservlet_util_internal_.js"), ctx);
		__kj_nashorn_engine__.eval(__kj_nashorn_inner_reader__.read("_kjservlet_ctx_internal_.js"), ctx);

		var filePath = req.controller.pkg;
		if (filePath) {
			try {
				__kj_nashorn_engine__.eval(new JavaFileReader(new JavaFile($classpath + filePath + $appEnv.fileSuffix)), ctx);
			} catch (err) {
				res.sendError(500, err);
				return;
			}
		}
		var func;
		try {
			// get the controller function from context, and run it in the default context
			func = __kj_nashorn_engine__.eval(req.controller.func, ctx);
			if (!func || typeof (func) != "function") {
				res.sendError(404, "cannot find controller function in runtime environment.");
				return;
			}
		} catch (err) {
			res.sendError(404, err);
			return;
		}

		var funcAnnos = _kj_util_.func.getAnnotations(func);
		if (_kj_util_.array.containOne(funcAnnos, [ "@post", "@get", "@put", "@delete" ])) {
			if (req.method.toLowerCase() == "post" && funcAnnos.indexOf("@post") < 0) {
				res.sendError(404);
				return;
			} else if (req.method.toLowerCase() == "get" && funcAnnos.indexOf("@get") < 0) {
				res.sendError(404);
				return;
			} else if (req.method.toLowerCase() == "put" && funcAnnos.indexOf("@put") < 0) {
				res.sendError(404);
				return;
			} else if (req.method.toLowerCase() == "delete" && funcAnnos.indexOf("@delete") < 0) {
				res.sendError(404);
				return;
			}
		}

		var aopBeforeFunctions = [];
		var aopAfterFunctions = [];
		if ($appEnv.interceptors) {
			// AOP
			var interceptors = _kj_util_.array.getArray($appEnv.interceptors);

			for (var i = 0; i < interceptors.length; i++) {
				var interceptor = interceptors[i];
				var interceptTags = _kj_util_.array.getArray(interceptor.intercept);
				var shouldBeIntercepted = _kj_util_.array.containOne(interceptTags, funcAnnos);
				if (shouldBeIntercepted) {
					if (interceptor.before && typeof interceptor.before == "function")
						aopBeforeFunctions.push(interceptor.before);
					if (interceptor.after && typeof interceptor.after == "function")
						aopAfterFunctions.push(interceptor.after)
				}
			}
		}

		for (var i = 0; i < aopBeforeFunctions.length; i++) {
			var pass = aopBeforeFunctions[i](req, res);
			if (!pass)
				return;
		}
		var result = func(req, res);
		for (var i = 0; i < aopAfterFunctions.length; i++) {
			aopAfterFunctions[i](req, res, result);
		}
		if (!result)
			return;

		if (!result.hasOwnProperty("_content_type"))
			if (typeof result == "object")
				result = $renderer.json(result);
			else
				result = $renderer.text(result);

		if (result.headers) {
			for ( var name in result.headers) {
				res.addHeader(name, result.headers[name]);
			}
		}

		if (result._content_type == "error") {
			res.sendError(result.code, result.message);
		} else if (result._content_type == "forward") {
			if (result.data) {
				for ( var name in result.data) {
					var val = _kj_util_.json.toJava(result.data[name]);
					request.setAttribute(name, val);
				}
			}
			request.getRequestDispatcher(result.url).forward(request, response);
		} else if (result._content_type == "redirect") {
			res.redirect(result.data);
		} else if (result._contentType == "bytes") {
			res.contentType = "application/octet-stream";
			res.writeByte(result.data);
		} else {
			res.contentType = result._content_type;
			res.write(result.data);
		}
	};

	var getController = function(req) {
		var formatPkg = function(path) {
			var pkgPath = path.replaceAll(".", "/").replaceAll("//", "/");
			var pkgNodes = pkgPath.split("/");
			pkgPath = "";
			for ( var i in pkgNodes) {
				var node = pkgNodes[i];
				if (node && node.indexOf(":") < 0)
					pkgPath += "/" + node;
			}
			return pkgPath;
		};

		var ctl = {};
		var path = req.ctxUri;
		// remove suffix
		var suffix = httpConf.suffix;
		if (suffix) {
			if (!suffix.startsWith("."))
				suffix = "." + suffix;
			if (path.endsWith(suffix)) {
				var suffixIdx = path.lastIndexOf(suffix);
				path = path.substring(0, suffixIdx);
			}
		}

		var idx = path.indexOf("/$f:");
		if (idx >= 0) {
			ctl.func = req.pathValues["$f"];
			ctl.pkg = formatPkg(httpConf.pkg + path.substring(0, idx));
			ctl.args = [];
			var argsPath = path.substring(idx);
			var nodes = argsPath.split("/");
			for ( var i in nodes) {
				var node = nodes[i];
				if (node && node.indexOf("$f:") < 0) {
					ctl.args.push(node);
				}
			}
		} else {
			var nodes = path.split("/");
			var pathWithoutValues = "";
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				if (node && node.indexOf(":") < 0) {
					pathWithoutValues += "/" + node;
				}
			}
			idx = pathWithoutValues.lastIndexOf("/");

			ctl.pkg = formatPkg(httpConf.pkg + pathWithoutValues.substring(0, idx));
			ctl.func = pathWithoutValues.substring(idx + 1);
			ctl.args = [];
		}

		return ctl;
	}

	var wrapResponse = function(response) {
		var res = {};
		res.oriResponse = response;
		res.contentType;
		res.headers = {};
		res.header = res.headers;
		res.model = {};
		res.sent = false;
		res.checkSent = function() {
			if (res.sent)
				throw "Result is already sent back!";
			res.sent = true;
		};
		res.addHeader = function(name, value) {
			this.oriResponse.addHeader(name, value);
		};
		res.setHeader = function(name, value) {
			this.oriResponse.setHeader(name, value);
		};
		res.sendError = function(code, msg) {
			this.checkSent();
			var message = "";
			if (msg)
				message = msg;
			this.oriResponse.sendError(code, msg);
		};
		res.redirect = function(location) {
			this.checkSent();
			for ( var name in this.headers) {
				this.oriResponse.addHeader(name, this.headers[name]);
			}
			res.oriResponse.sendRedirect(location);
		};
		res.write = function(data) {
			var body = "";
			if (typeof data === "object" && (!this.contentType || this.contentType == "application/json")) {
				this.contentType = "application/json";
				body = JSON.stringify(data);
			} else {
				body = data.toString();
			}
			if (!this.contentType) {
				this.contentType = "text/plain";
			}
			response.setCharacterEncoding(this.encoding ? this.encoding : httpConf.encoding);
			this.writeBytes(body.getBytes());
		};
		res.writeBytes = function(bytes) {
			if (!JavaByteArray["class"].isInstance(bytes)) {
				throw "Illegal Argument! You have input bytes into this method";
			}
			this.checkSent();
			if (!this.contentType) {
				this.contentType = "application/octet-stream";
			}
			this.oriResponse.setContentType(this.contentType);
			this.oriResponse.setContentLength(bytes.length);
			for ( var name in this.headers) {
				this.oriResponse.addHeader(name, this.headers[name]);
			}
			this.oriResponse.getOutputStream().write(bytes);
		}
		return res;
	}

	var wrapRequest = function(request) {
		// step 1 wrap request
		var req = {};
		req.oriRequest = request;
		req.session = req.oriRequest.getSession();
		req.authType = request.getAuthType();
		req.method = request.getMethod();
		req.contentLength = request.getContentLength();
		req.contentType = request.getContentType();
		req.queryString = request.getQueryString();
		req.protocol = request.getProtocol();
		req.schema = request.getScheme();
		req.serverName = request.getServerName();
		req.serverPort = request.getServerPort();
		req.contextPath = request.getContextPath();
		req.requestUri = request.getRequestURI();
		req.servletPath = request.getServletPath();
		req.requestUrl = request.getRequestURL().toString();
		req.url = req.requestUrl;

		req.headers = {};
		req.header = req.headers;
		req.parameterValues = {};
		req.parameterValue = req.parameterValues;
		req.parameters = {};
		req.parameter = req.parameters;
		req.pathValues = {};
		req.pathValue = req.pathValues;

		req.setAttribute = function(name, val) {
			this.oriRequest.setAttribute(name, val);
		};
		req.setAttr = req.setAttribute;
		req.getAttribute = function(name, defaultVal) {
			var val = this.oriRequest.getAttribute(name);
			if (val)
				return val;
			else if (defaultVal)
				return defaultVal;
			else
				return val;
		};
		req.getAttr = req.getAttribute;
		req.removeAttribute = function(name) {
			this.oriRequest.removeAttribute(name);
		}
		req.removeAttr = req.removeAttribute;
		req.rmAttr = req.removeAttribute;

		// headers
		var headerNames = request.getHeaderNames();
		while (headerNames.hasMoreElements()) {
			var name = headerNames.nextElement().toString();
			var value = request.getHeader(name);
			req.headers[name] = value;
		}

		req.readRequestBody = function() {
			// save the body, so it's safe to call this method again.
			if (this.body)
				return this.body;
			var contentLength = this.oriRequest.getContentLength();
			var bytes = new JavaByteArray(contentLength);
			var curror = 0;
			var length = contentLength;
			while ((length = this.oriRequest.getInputStream().read(bytes, curror, length)) > 0) {
				curror = length;
				length = contentLength - length;
			}
			this.body = new JavaString(bytes);
			return this.body;
		}

		// Parameters
		if (!req.contentType || req.contentType.toLowerCase().startsWith("application/x-www-form-urlencoded")) {
			request.setCharacterEncoding(httpConf.encoding)
		} else if (req.contentType.toLowerCase().startsWith("multipart/form-data")) {
			var boundary = "--" + req.contentType.split("boundary=")[1];
			var paramParts = req.readRequestBody().split(boundary);

			if (paramParts.length >= 2) {
				paramParts.shift(); // remove the first empty element
				paramParts.pop(); // remove the last end symbol "--\r\n"
			}
			for (var i = 0; i < paramParts.length; i++) {
				var part = paramParts[i];
				var firstIdx = part.indexOf("\r\n") + 2;
				var lastIdx = part.lastIndexOf("\r\n");
				part = part.substring(firstIdx, lastIdx);
				// fist line,
				var lineAndRest = readLine(part);

				var fileRegx = /^Content-Disposition: form-data; name="(.*)"; filename="(.*)"$/;
				var strRegx = /^Content-Disposition: form-data; name="(.*)"$/;

				var fileMatchRes = lineAndRest.line.match(fileRegx);
				var strMatchRes = lineAndRest.line.match(strRegx);

				var name;
				var value = "";
				if (fileMatchRes) {
					name = fileMatchRes[1];
					var filename = fileMatchRes[2];
					lineAndRest = readLine(lineAndRest.rest);
					var contentType = lineAndRest.line.replace("Content-Type: ", "");
					var content = readLine(lineAndRest.rest).rest;
					value = {
						"filename" : filename,
						"contentType" : contentType,
						"content" : content,
					};
				} else if (strMatchRes) { // string field
					name = strMatchRes[1];
					value = readLine(lineAndRest.rest).rest;
				}
				if (name) {
					if (req.parameterValues[name]) {
						req.parameterValues[name].push(value);
					} else {
						req.parameterValues[name] = [ value ];
					}
				}

			} // end of handling body parameters
		} else if (req.contentType.toLowerCase().startsWith("application/json")) {
			try {
				req.data = JSON.parse(req.readRequestBody());
			} catch (err) {

			}
		} else {
			req.readRequestBody();
		}
		// Parameters from QueryString and body when content type is
		// application/x-www-form-urlencoded
		var paramNames = request.getParameterNames();
		while (paramNames.hasMoreElements()) {
			var name = paramNames.nextElement();
			var values = request.getParameterValues(name);
			var vals = [];
			for (var i = 0; i < values.length; i++) {
				vals.push(values[i]);
			}
			if (req.parameterValues[name]) {
				// this values comes from decode multipart body
				var valuesFromBody = req.parameterValues[name];
				for (var i = 0; i < valuesFromBody.length; i++) {
					vals.push(valuesFromBody[i]);
				}
			}
			req.parameterValues[name] = vals;
		}

		for ( var name in req.parameterValues) {
			var values = req.parameterValues[name];
			if (httpConf.parameterJSONFriendly === true) {
				for (var i = 0; i < values.length; i++) {
					values[i] = tryToJSON(values[i]);
				}
			}
			req.parameters[name] = values[0];
		}
		// PathValues
		var pathFragments = req.servletPath.split("/");
		for ( var idx in pathFragments) {
			var val = pathFragments[idx];
			if (!val)
				continue;
			var index = val.indexOf(":");
			if (index <= 0)
				continue;
			var name = val.substring(0, index);
			var value = val.substring(index + 1, val.length);
			// json friendly
			if (httpConf.parameterJSONFriendly === true) {
				value = tryToJSON(value);
			}
			// comma, break into array
			if (typeof value == "string" && value.indexOf(",") >= 0) {
				value = value.split(",");
				for ( var k in value) {
					value[k] = value[k].trim();
				}
			}
			req.pathValues[name] = value;
		}

		return req;
	}

	var tryToJSON = function(str) {
		try {
			return JSON.parse(str);
		} catch (err) {
			return str;
		}
	}

	var readLine = function(str) {
		var idx = str.indexOf("\r\n");
		if (idx < 0)
			return str;
		var line = str.substring(0, idx);
		var rest = str.substring(idx + 2, str.length);
		return {
			"line" : line,
			"rest" : rest
		}
	};

	return fun;
})();