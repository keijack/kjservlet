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
			$websocket._endpointMapping_[endpoint].onHandShake = endpoints[i].onHandShake;
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

	var sessionHandler = $MTSGlobal.allocate();

	$websocket.sessions = $websocket.session = $MTSGlobal.allocate();

	var JavaSimpleScriptContext = Java.type("javax.script.SimpleScriptContext");
	var JavaScriptContext = Java.type("javax.script.ScriptContext");
	var JavaFileReader = Java.type("java.io.FileReader");
	var JavaFile = Java.type("java.io.File");
	var JavaByteBuffer = Java.type("java.nio.ByteBuffer");
	var JavaByteArray = Java.type("byte[]");

	var wrapSession = function(ses) {
		var session = {};
		session.oriSession = ses;
		session.id = session.sessionId = session.oriSession.getId();
		session.getId = function() {
			return this.id;
		};
		session.sendText = function(text, isLast) {
			if (!text || typeof text != "string")
				return;
			if (isLast === true || isLast === false)
				this.oriSession.getBasicRemote().sendText(text, isLast);
			else {
				try {
					this.oriSession.getBasicRemote().sendText(text);
				} catch (e) {
					print(e);
				}
			}
		};
		session.sendPing = function(pingMsg) {
			var msg = "";
			if (pingMsg)
				msg = pingMsg.toString();
			this.oriSession.getBasicRemote().sendPing(JavaByteBuffer.wrap(msg.getBytes()));
		};
		session.sendPong = function(pongMsg) {
			var msg = "";
			if (pongMsg)
				msg = pongMsg.toString();
			this.oriSession.getBasicRemote().sendPong(JavaByteBuffer.wrap(msg.getBytes()));
		};
		session.sendBytes = function(bytes) {
			if (!bytes || !JavaByteArray["class"].isInstance(data))
				return;
			this.oriSession.getBasicRemote().sendPong(JavaByteBuffer.wrap(bytes));
		};
		session.sendBinary = function(data) {
			if (data && JavaByteBuffer["class"].isInstance(data))
				this.oriSession.getBasicRemote().sendBinary(data);
		};
		session.sendJSON = session.sendJson = function(data) {
			this.sendText(JSON.stringify(data));
		}
		session.sendJavaObject = function(data) {
			this.oriSession.getBasicRemote().sendObject(data);
		}
		session.send = function(data) {
			if (JavaByteArray["class"].isInstance(data)) {
				this.sendBytes(data);
			} else if (JavaByteBuffer["class"].isInstance(data)) {
				this.sendBinary(data);
			} else if (_kj_util_.json.typeOf(data) == "javaObject") {
				this.sendJavaObject(data);
			} else if (_kj_util_.json.typeOf(data) == "json" || _kj_util_.json.typeOf(data) == "jsarray") {
				this.sendJSON(data);
			} else {
				this.sendText(data.toString());
			}
		};

		session.uri = session.requestURI = session.oriSession.getRequestURI().toString();

		session.pathValues = session.pathValue = session.pathVals = session.pathVal = session.pathParameters = session.pathParams = session.pathParam = {};
		var pvkeys = session.oriSession.getPathParameters().keySet().toArray();
		for (var i = 0; i < pvkeys.length; i++) {
			var key = pvkeys[i];
			var val = session.oriSession.getPathParameters().get(key);
			session.pathValues[key] = val;
		}

		session.paramValues = session.paramVals = session.parameterValues = session.requestParameterMap = {};
		var paramMap = session.oriSession.getRequestParameterMap();
		var paramKeys = paramMap.keySet().toArray();
		for (var i = 0; i < paramKeys.length; i++) {
			var key = paramKeys[i];
			var vals = paramMap.get(key);
			session.requestParameterMap[key] = [];
			for (var idx = 0; idx < vals.length; idx++) {
				session.requestParameterMap[key][idx] = vals[idx];
			}
		}

		session.params = session.param = session.parameters = session.parameter = {};
		for ( var key in session.requestParameterMap) {
			session.params[key] = session.requestParameterMap[key][0];
		}

		return session;
	};

	var dispatcher = {
		onHandShake : function(config, request, response) {
			var path = config.getPath();
			var handler = $websocket._endpointMapping_[path];
			if (handler.onHandShake && typeof handler.onHandShake == "function")
				handler.onHandShake(config, request, response);
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
			sessionHandler.put(session.getId(), handlerObject);

			var wrappedSession = wrapSession(session);
			$websocket.sessions.put(session.getId(), wrappedSession);

			if (handlerObject.onOpen && typeof handlerObject.onOpen == "function") {
				handlerObject.onOpen(wrappedSession, config);
			}
		},
		onMessage : function(session, message) {
			var handlerObject = sessionHandler.get(session.getId());
			var wrappedSession = $websocket.sessions.get(session.getId());
			if (handlerObject.onMessage && typeof handlerObject.onMessage == "function") {
				handlerObject.onMessage(wrappedSession, message);
			}
		},
		onClose : function(session, closeReason) {
			var handlerObject = sessionHandler.get(session.getId());
			var wrappedSession = $websocket.sessions.get(session.getId());
			if (handlerObject.onClose && typeof handlerObject.onClose == "function") {
				handlerObject.onClose(wrappedSession, closeReason);
			}
			sessionHandler.remove(session.getId());
			$websocket.sessions.remove(session.getId());
		},
		onError : function(session, thr) {
			var handlerObject = sessionHandler.get(session.getId())
			var wrappedSession = $websocket.sessions.get(session.getId());
			if (handlerObject.onError && typeof handlerObject.onError == "function") {
				handlerObject.onError(wrappedSession, thr);
			}
		}
	};
	return dispatcher;

})();