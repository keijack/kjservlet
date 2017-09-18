var _kj_util_ = {
	json : {},
	func : {},
	array : {},
}

/**
 * Get the value of a key in an object, if the field is a function, run it and get the return value.
 */
_kj_util_.json.funVal = function(object, key) {
	var val = object[key];
	if (typeof val === "function")
		return val();
	else
		return val;
};

_kj_util_.json.extand = function(target, o1) {
	if (!o1)
		return target;
	if (!target)
		return o1;
	for ( var name in o1) {
		if (!target.hasOwnProperty(name)) {
			target[name] = o1[name];
		} else if (typeof target[name] == "object" && typeof o1[name] == "object") {
			this.extand(target[name], o1[name]);
		}
	}
	return target;
};

_kj_util_.func.getAnnotations = function(func) {
	var trimComments = function(srouceCode) {
		var code = sourceCode.trim();
		while (code.startsWith("//") || code.startsWith("/*")) {
			var idx = 0;
			if (code.startsWith("//")) { // one line comments;
				idx = code.indexOf("\n") + 1;
			} else { // multiple lines comments
				idx = code.indexOf("*/") + 2;
			}
			code = code.substring(idx).trim();
		}
		return code;
	};

	if (typeof func !== 'function')
		return [];
	var sourceCode = func.toString();
	sourceCode = sourceCode.substring(sourceCode.indexOf('{') + 1).trim(); // remove function xxxx() {
	if (sourceCode.startsWith('"use strict"') || sourceCode.startsWith("'use strict'")) { // remove "use strict";
		sourceCode = sourceCode.substring('"use strict"'.length).trim();
		if (sourceCode.startsWith(';'))
			sourceCode = sourceCode.substring(1).trim();
	}
	sourceCode = trimComments(sourceCode);
	var annos = [];
	while (sourceCode.startsWith('"@') || sourceCode.startsWith("'@")) {
		var quoteChar = sourceCode.charAt(0);
		sourceCode = sourceCode.substring(2); // remove "@
		var rightQuoteIdx = sourceCode.indexOf(quoteChar);
		var tag = sourceCode.substring(0, rightQuoteIdx);
		if (tag)
			annos.push("@" + tag);
		sourceCode = sourceCode.substring(tag.length + 1).trim(); // remove "
		if (sourceCode.startsWith(';')) // remove ;
			sourceCode = sourceCode.substring(1).trim();
		sourceCode = trimComments(sourceCode);
	}
	return annos;

};

_kj_util_.array.getArray = function(val) {
	if (Array.isArray(val))
		return val;
	else
		return [ val ];
};

_kj_util_.array.containOne = function(array, elements) {
	for (var i = 0; i < elements.length; i++) {
		if (array.indexOf(elements[i]) >= 0)
			return true;
	}
	return false;
};

/**
 * hash
 */
String.prototype.hash = function() {
	var hash = 0, i, chr;
	for (i = 0; i < this.length; i++) {
		chr = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};
/**
 * replace all
 */
String.prototype.replaceAll = function(s, replacement) {
	var str = this.toString();
	while (str.indexOf(s) >= 0) {
		str = str.replace(s, replacement);
	}
	return str;
}