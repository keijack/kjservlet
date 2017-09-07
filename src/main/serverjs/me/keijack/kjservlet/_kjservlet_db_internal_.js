var $db = (function() {

	"use strict";

	function DBAccessClass() {

		/**
		 * Use this variable as `this` to avoid some error and make codes more readable
		 */
		var $DBAccessClass = this;

		/**
		 * The data sources that are saved
		 */
		$DBAccessClass.datasources = {};

		/**
		 * cache
		 */
		$DBAccessClass.cache = true;

		/**
		 * Add a data source to the
		 */
		$DBAccessClass.addDatasource = function(key, arg1, arg2) {
			if ($DBAccessClass.datasources.hasOwnProperty(key))
				return $DBAccessClass.datasources[key];

			var dsClass;
			var params;
			if (typeof arg1 === "string") {
				dsClass = arg1;
				params = arg2;
			} else {
				dsClass = "com.mysql.jdbc.jdbc2.optional.MysqlDataSource";
				params = arg1;
			}

			var DataSourceClass = Java.type(dsClass);
			var ds = new DataSourceClass();
			for ( var k in params) {
				if (k === "key" || k === "dsClass")
					continue;
				ds[k] = params[k];
			}
			$DBAccessClass.datasources[key] = ds;

			return ds;
		};

		$DBAccessClass.addDataSource = $DBAccessClass.addDatasource;

		/**
		 * connect to
		 */
		$DBAccessClass.connect = function() {
			var ds;
			if (arguments.length === 0) {
				return this.connect("default");
			} else if (arguments.length === 1 && typeof arguments[0] === "string") {
				var dsKey = arguments[0];
				ds = $DBAccessClass.datasources[dsKey];
				if (!ds)
					return null;
			} else if (arguments.length === 1 && typeof arguments[0] === "object") {
				var object = arguments[0];
				ds = getDefaultDatasrouce(object.url, object.username, object.password);
			} else if (arguments.length === 2) {
				var url = arguments[0];
				var username = arguments[1]
				ds = getDefaultDatasrouce(url, username, "");
			} else if (arguments.length === 3) {
				var url = arguments[0];
				var username = arguments[1]
				var password = arguments[2]
				ds = getDefaultDatasrouce(url, username, password);
			} else {
				return null;
			}

			/**
			 * inner class
			 */
			function ConnectionClass() {

				var $ConnectionClass = this;
				/**
				 * mysql connection
				 */
				var dscon;

				function getCon() {
					if (!dscon)
						dscon = ds.getConnection();

					if ($ConnectionClass.autoCommit === true || $ConnectionClass.autoCommit === false)
						dscon.autoCommit = $ConnectionClass.autoCommit;
					return dscon;
				}

				/**
				 * AutoCommit
				 */
				$ConnectionClass.autoCommit;

				/**
				 * need cache?
				 */
				$ConnectionClass.cache = true;

				/**
				 * cached data
				 */
				var cachedData = {};

				/**
				 * Select, execute query
				 */
				$ConnectionClass.select = function(sql, arg1, arg2, maxResult) {

					var params = [];
					var first;
					var max;
					if (arg1 && Array.isArray(arg1)) {
						params = arg1;
						first = new Number(arg2 || 0);
						max = new Number(maxResult || 0);
					} else if (arg1 && (typeof arg1 === "number" || typeof arg1 === "string")) {
						first = new Number(arg1);
						max = new Number(arg2 || 0);
					} else {
						first = 0;
						max = 0;
					}

					var cacheKey = "sql:->[" + sql + "]params:->[" + params + "]first:->[" + first + "]max:->[" + max + "]";
					if ($DBAccessClass.cache && $ConnectionClass.cache) {
						var data = cachedData[cacheKey];
						if (data) {
							return data;
						}
					} else {
						cachedData = {};
					}

					var con = getCon();

					var statement = con.prepareStatement(sql, 1004, 1007);
					if (params && Array.isArray(params)) {
						for (var i = 1; i <= params.length; i++) {
							statement.setObject(i, params[i - 1]);
						}
					}
					statement.setMaxRows(first + max);

					var result = statement.executeQuery();
					var jarrayRes;
					if (result == null)
						jarrayRes = [];
					else
						jarrayRes = handleResultSet(result, first);

					if ($DBAccessClass.cache && $ConnectionClass.cache) {
						cachedData[cacheKey] = jarrayRes;
					}

					return jarrayRes;
				}

				/**
				 * private method: resultSet -> JSON array
				 */
				var handleResultSet = function(result, first) {
					var list = [];
					if (first)
						result.relative(first);
					while (result.next()) {
						var obj = {};
						var row = result.getMetaData();
						for (var i = 1; i <= row.getColumnCount(); i++) {
							var label = row.getColumnLabel(i);
							var value = result.getObject(i);
							obj[label] = value;
						}
						list.push(obj);
					}
					return list;
				};

				/**
				 * insert
				 */
				$ConnectionClass.insert = function(table, obj) {
					if (Array.isArray(obj))
						return insertBatch(table, obj);
					else
						return insertOne(table, obj);
				};

				/**
				 * insert a list of object
				 */
				var insertBatch = function(table, list) {
					if (!list || list.length == 0)
						throw "Illegal Arguments";
					var fields = [];
					var fieldsStr = "";
					var valuesStr = "";
					// use the first element to get the fields
					var obj = list[0];
					for ( var key in obj) {
						fields.push(key);
						if (fieldsStr) {
							fieldsStr += ", ";
							valuesStr += ",";
						}
						fieldsStr += "`" + key + "`";
						valuesStr += "?";
					}
					var sql = "INSERT INTO `" + table + "` (" + fieldsStr + ") VALUES (" + valuesStr + ")";

					var paramsList = [];
					for (var i = 0; i < list.length; i++) {
						var item = list[i];
						var params = [];
						for (var j = 0; j < fields.length; j++) {
							var key = fields[j];
							if (!item.hasOwnProperty(key))
								throw "Illegal Arguments: please confirm that all objects in the list must have same fields.";
							var val = _kj_util_.json.funVal(item, key);
							params.push(val);
						}
						paramsList.push(params);
					}
					return executeBatch(sql, paramsList);
				}

				/**
				 * insert one object
				 */
				var insertOne = function(table, obj) {
					var params = [];
					var fields = "";
					var values = "";
					for ( var key in obj) {
						if (fields) {
							fields += ", ";
							values += ", ";
						}
						fields += "`" + key + "`";
						values += "?";
						var val = _kj_util_.json.funVal(obj, key);
						params.push(val);
					}
					var sql = "INSERT INTO `" + table + "` (" + fields + ") VALUES (" + values + ")";
					return $ConnectionClass.execute(sql, params);
				};

				/**
				 * update
				 */
				$ConnectionClass.update = function(table, objs, idFieldName) {
					if (Array.isArray(objs))
						return updateBatch(table, objs, idFieldName);
					else
						return updateOne(table, objs, idFieldname);
				};

				/**
				 * update batch
				 */
				var updateBatch = function(table, objs, idFieldName) {
					var idName = idFieldName || "id";
					if (!objs || objs.lenght == 0)
						throw "Illegal Arguments";

					var fields = [];
					var setFieldsStr = "";
					var first = objs[0];
					for ( var key in first) {
						if (key == idName)
							continue;
						fields.push(key);
						if (setFieldsStr)
							setFieldsStr += ",";
						setFieldsStr += "`" + key + "` = ?";
					}

					var sql = "UPDATE `" + table + "` SET " + setFieldsStr + " where `" + idName + "` =  ?";

					var paramsList = [];
					for (var i = 0; i < objs.length; i++) {
						var obj = objs[i];
						var params = [];
						for (var j = 0; j < fields.length; j++) {
							var key = fields[j];
							if (!obj.hasOwnProperty(key))
								throw "Illegal Arguments: please confirm that all objects in the list must have same fields.";
							var val = _kj_util_.json.funVal(obj, key);
							params.push(val);
						}
						var id = _kj_util_.json.funVal(obj, idName);
						params.push(id);
						paramsList.push(params);
					}

					return executeBatch(sql, paramsList);
				};

				/**
				 * Update one
				 */
				var updateOne = function(table, obj, idFieldName) {
					var idName = idFieldName || "id";
					var idVal = _kj_util_.json.funVal(obj, idName);
					if (!idVal)
						throw "An id field is required";

					var setFields = "";
					var params = [];
					for ( var key in obj) {
						if (key == idName)
							continue;
						if (setFields)
							setFields += ",";
						setFields += "`" + key + "` = ?";
						var val = _kj_util_.json.funVal(obj, key);
						params.push(val);
					}

					params.push(idVal);
					var sql = "UPDATE `" + table + "` SET " + setFields + " where `" + idName + "` =  ?";
					return $ConnectionClass.execute(sql, params);
				}

				/**
				 * delete
				 */
				$ConnectionClass.del = function(table, ids, idFieldName) {
					if (Array.isArray(ids))
						return delBatch(table, ids, idFieldName);
					else
						return delOne(table, ids, idFieldName);
				};

				/**
				 * Delete batch
				 */
				var delBatch = function(table, ids, idFieldName) {
					var idName = idFieldName || "id";
					var sql = "DELETE FROM `" + table + "` where `" + idName + "` = ?";
					var paramsList = [];
					for (var i = 0; i < ids.length; i++) {
						paramsList.push([ ids[i] ]);
					}
					return executeBatch(sql, paramsList);
				};

				/**
				 * Delete One
				 */
				var delOne = function(table, id, idFieldName) {
					var idName = idFieldName || "id";
					var sql = "DELETE FROM `" + table + "` where `" + idName + "` = ?";
					return $ConnectionClass.execute(sql, [ id ]);
				};

				/**
				 * execute
				 */
				$ConnectionClass.execute = function(sql, params) {
					if (arguments.length < 3) {
						if (!params || Array.isArray(params))
							return executeOne(sql, params);
						else {
							return excuteeOne(sql, [ params ]);
						}
					} else {
						var args = [];
						for (var i = 1; i < arguments.length; i++) {
							args.push(arguments[i]);
						}
						if (Array.isArray(params))
							return executeBatch(sql, args);
						else
							return executeOne(sql, args);
					}
				};

				/**
				 * executeBatch
				 */
				var executeBatch = function(sql, args) {
					// reset data
					cachedData = {};
					var con = getCon();
					var statement = con.prepareStatement(sql);
					if (args) {
						for (var i = 0; i < args.length; i++) {
							var params = args[i];
							if (params && Array.isArray(params)) {
								for (var j = 1; j <= params.length; j++) {
									statement.setObject(j, params[j - 1]);
								}
								statement.addBatch();
							}
						}
					}
					var res = statement.executeBatch();
					var total = 0;
					for (var i = 0; i < res.length; i++) {
						total += res[i];
					}
					return total;
				}

				/**
				 * execute one sql
				 */
				var executeOne = function(sql, params) {
					// reset data
					cachedData = {};
					var con = getCon();
					var statement = con.prepareStatement(sql);
					if (params && Array.isArray(params)) {
						for (var i = 1; i <= params.length; i++) {
							statement.setObject(i, params[i - 1]);
						}
					}
					var result = statement.execute();
					var updateCount = statement.getUpdateCount();
					if (result)
						return handleResultSet(result)
					else
						return updateCount;
				};

				$ConnectionClass.close = function() {
					// reset data
					cachedData = {};
					if (dscon) {
						dscon.close();
						dscon == null;
					}
				}

				/**
				 * commit
				 */
				$ConnectionClass.commit = function() {
					// reset data
					cachedData = {};
					if (dscon)
						dscon.commit();
				}

				$ConnectionClass.rollback = function() {
					// reset data
					cachedData = {};
					if (dscon)
						dscon.rollback();
				}

			} // end of ConnectionClass

			return new ConnectionClass();

		};

		var getDefaultDatasrouce = function(url, username, password) {
			return $DBAccessClass.addDatasource(url + "##" + username + "##" + password, {
				url : url,
				username : username,
				password : password,
			});
		}

	}

	return new DBAccessClass();

})();
