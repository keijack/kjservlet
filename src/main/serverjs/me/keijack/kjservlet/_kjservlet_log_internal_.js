var $logFac = {
	getLogger : function(logType) {
		var type = logType ? logType.toLowerCase() : "";

		var defaultTag = "me.keijack.kjservlet.nashorn.universe";

		var objToStr = function(obj) {
			var str = obj.toString();
			if (Array.isArray(obj))
				str = "JArray => " + str;
			if (str === "[object Object]")
				str = "JSON => " + JSON.stringify(obj);
			return str;
		}

		var wrapError = function(error) {
			if (!error)
				return null;
			var JavaThrowable = Java.type("java.lang.Throwable");
			if (JavaThrowable["class"].isInstance(error)) {
				return error;
			} else {
				var errorMsg = objToStr(error);
				var JavaNashornException = Java.type("me.keijack.kjservlet.NashornJSException");
				return new JavaNashornException(errorMsg);
			}
		};

		var getLogger = function(tag, level) {
			if (type === "log4j") {
				var JavaLog4j = Java.type("org.apache.log4j.Logger");
				var logger = JavaLog4j.getLogger(tag);
				return {
					debug : function(msg, err) {
						if (err)
							logger.debug(msg, wrapError(err));
						else
							logger.debug(msg);
					},
					info : function(msg, err) {
						if (err)
							logger.info(msg, wrapError(err));
						else
							logger.info(msg);
					},
					warn : function(msg, err) {
						if (err)
							logger.warn(msg, wrapError(err));
						else
							logger.warn(msg);
					},
					error : function(msg, err) {
						if (err)
							logger.error(msg, wrapError(err));
						else
							logger.error(msg);
					},
					fatal : function(msg, err) {
						if (err)
							logger.fatal(msg, wrapError(err));
						else
							logger.fatal(msg);
					}
				};
			} else {
				var date = new Date().toISOString();
				date = date.replace("T", " ").replace("Z", "");
				var printToConsole = function(level, msg, err) {
					var str = "[" + date + "] " + level.toUpperCase() + " #" + tag + "# " + " ==> " + msg;
					if (err) {
						str += "\nException ======> \n" + err;
					}
					print(str);
				};
				return {
					debug : function(msg, err) {
						var levels = "debug,info,warn,error,fatal";
						if (levels.indexOf(level) < 0)
							return;

						printToConsole("debug", msg, err);
					},
					info : function(msg, err) {
						var levels = "info,warn,error,fatal";
						if (levels.indexOf(level) < 0)
							return;

						printToConsole("info", msg, err);
					},
					warn : function(msg, err) {
						var levels = "warn,error,fatal";
						if (levels.indexOf(level) < 0)
							return;

						printToConsole("warn", msg, err);
					},
					error : function(msg, err) {
						var levels = "error,fatal";
						if (levels.indexOf(level) < 0)
							return;

						printToConsole("error", msg, err);
					},
					fatal : function(msg, err) {
						var levels = "fatal";
						if (levels.indexOf(level) < 0)
							return;

						printToConsole("fatal", msg, err);
					}
				};
			}

		};

		var log = {
			level : "info",
			"d" : function(tag, message, err) {
				if (arguments.length == 1) {
					this.d(defaultTag, arguments[0]);
					return;
				}

				getLogger(tag, this.level).debug(objToStr(message), err);
			},
			"i" : function(tag, message, err) {
				if (arguments.length == 1) {
					this.i(defaultTag, arguments[0]);
					return;
				}

				getLogger(tag, this.level).info(objToStr(message), err);
			},
			"w" : function(tag, message, err) {
				if (arguments.length == 1) {
					this.w(defaultTag, arguments[0]);
					return;
				}

				getLogger(tag, this.level).warn(objToStr(message), err);
			},
			"e" : function(tag, message, err) {
				if (arguments.length == 1) {
					this.e(defaultTag, arguments[0]);
					return;
				}

				getLogger(tag, this.level).error(objToStr(message), err);
			},
			"f" : function(tag, message, err) {
				if (arguments.length == 1) {
					this.f(defaultTag, arguments[0]);
					return;
				}

				getLogger(tag, this.level).fatal(objToStr(message), err);
			}
		};

		return log;
	}
};

var $log = $logFac.getLogger();