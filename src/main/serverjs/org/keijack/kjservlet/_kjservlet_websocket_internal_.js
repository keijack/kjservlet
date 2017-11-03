(function() {
	var websocketDefault = {
		fileHome : "classpath:",
		fileSuffix : ".js",
		pkg : ""
	};
	_kj_util_.json.extand($websocket, websocketDefault);
	if ($websocket.endpoint && !$websocket.endpoints) {
		$websocket.endpoints = $websocket.endpoint;
	}
})();

var _kj_websocket_init_ = (function() {

	var ServerEndpointConfigBuilder = Java.type("javax.websocket.server.ServerEndpointConfig.Builder")
	var KJWebSocketEndpoint = Java.type("org.keijack.kjservlet.KJWebSocketEndpointProxy");
	var KJWebSocketEndpointConfig = Java.type("org.keijack.kjservlet.KJWebSocketEndpointConfig");
	var endpointConf = new KJWebSocketEndpointConfig();

	var init = function(result) {
		if (!$websocket.endpoints)
			return;
		if (Array.isArray($websocket.endpoints) && $websocket.endpoints.length === 0)
			return;
		if (!Array.isArray($websocket.endpoints) && typeof $websocket.endpoints != "string")
			return;
		var endpoints = _kj_util_.array.getArray($websocket.endpoints);
		$websocket._endpointMapping_ = {};
		for (var i = 0; i < endpoints.length; i++) {
			var endpoint = endpoints[i];
			if (typeof endpoint == "object") {
				endpoint = endpoint.endpoint;
			} else if (typeof endpoint != "string")
				continue;

			result.add(ServerEndpointConfigBuilder.create(KJWebSocketEndpoint["class"], endpoint).configurator(endpointConf).build());

			var path = endpoints[i];
			if (typeof path == "object") {
				path = path.handler;
			}
			if (!path || typeof path != "string")
				continue;
			$websocket._endpointMapping_[endpoint] = getHandler(path);
			$websocket._endpointMapping_[endpoint].handShake = endpoints[i].handShake;
		}

	}

	function getHandler(path) {
		var nodes = path.split("/");
		var pathWithoutValues = "";
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node && node.indexOf("{") != 0) {
				pathWithoutValues += "/" + node;
			}
		}

		var ctl = {};

		var idx = pathWithoutValues.lastIndexOf("/");

		var location = _kj_util_.path.pkgToPath($websocket.pkg) + pathWithoutValues.substring(0, idx);
		var root;
		if ($websocket.fileHome.startsWith("classpath:")) {
			// class path
			root = $websocket.fileHome.replace("classpath:", $classpath);
		} else {
			// relative path
			root = $classpath + "/" + $websocket.fileHome;
		}
		location = root + "/" + location + $websocket.fileSuffix;
		ctl.location = _kj_util_.path.formatPath(location);
		ctl.handler = pathWithoutValues.substring(idx + 1);
		return ctl;
	}

	return init;
})();

var _kj_websocket_dispatcher_ = (function() {

	var sessionHandler = $threadSafeZone.allocate("_kj_websocket_session_handler_");

	var JavaSimpleScriptContext = Java.type("javax.script.SimpleScriptContext");
	var JavaScriptContext = Java.type("javax.script.ScriptContext");
	var JavaFileReader = Java.type("java.io.FileReader");
	var JavaFile = Java.type("java.io.File");

	var dispatcher = {
		onHandShake : function(config, request, response) {
			var path = config.getPath();
			var handler = $websocket._endpointMapping_[path];
			if (handler.handShake && typeof handler.handShake == "function")
				handler.handShake(config, request, response);
		},
		onOpen : function(session, config) {
			var path = config.getPath();
			var handler = $websocket._endpointMapping_[path];

			var ctx = new JavaSimpleScriptContext();
			ctx.setBindings(__kj_nashorn_engine__.createBindings(), JavaScriptContext.ENGINE_SCOPE);

			__kj_nashorn_engine__.eval(__kj_nashorn_inner_reader__.read("_kjservlet_util_internal_.js"), ctx);
			__kj_nashorn_engine__.eval(__kj_nashorn_inner_reader__.read("_kjservlet_ctx_internal_.js"), ctx);
			__kj_nashorn_engine__.eval(new JavaFileReader(new JavaFile(handler.location)), ctx);

			var handlerObject = __kj_nashorn_engine__.eval(handler.handler, ctx);
			if (!handlerObject)
				return;
			sessionHandler.put("#" + session.getId(), handlerObject);
			if (handlerObject.onOpen && typeof handlerObject.onOpen == "function") {
				handlerObject.onOpen(session, config);
			}
		},
		onMessage : function(session, message) {
			var handlerObject = sessionHandler.get("#" + session.getId())
			if (handlerObject.onMessage && typeof handlerObject.onMessage == "function") {
				handlerObject.onMessage(session, message);
			}
		},
		onClose : function(session, closeReason) {
			var handlerObject = sessionHandler.get("#" + session.getId())
			if (handlerObject.onClose && typeof handlerObject.onClose == "function") {
				handlerObject.onClose(session, closeReason);
			}
			sessionHandler.remove("#" + session.getId());
		},
		onError : function(session, thr) {
			var handlerObject = sessionHandler.get("#" + session.getId())
			if (handlerObject.onError && typeof handlerObject.onError == "function") {
				handlerObject.onError(session, thr);
			}
		}
	};
	return dispatcher;

})();