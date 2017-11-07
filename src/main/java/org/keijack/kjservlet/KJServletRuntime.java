/*
   KJServletRuntime.java

   Copyright 2013 Keijack

   This Source Code Form is subject to the terms of the GPL v.3.0. or Apache License v.2.0 (Need permission)  
   
   If a copy of the Permitted license was not distributed with this file, You can obtain one at following links.
   
   GPL: https://www.gnu.org/licenses/gpl.html
   
   Apache License: http://www.apache.org/licenses/
*/

package org.keijack.kjservlet;

import java.io.File;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

public final class KJServletRuntime {

    private static volatile KJServletRuntime instance;

    public static KJServletRuntime newInstance() {
	return new KJServletRuntime();
    }

    public static KJServletRuntime getInstance() {
	if (instance == null) {
	    synchronized (KJServletRuntime.class) {
		if (instance == null) {
		    instance = newInstance();
		}
	    }
	}
	return instance;
    }

    public class InnerJsReader {

	private volatile Map<String, String> scriptCache = new HashMap<>();

	public String read(String path) {
	    if (!scriptCache.containsKey(path)) {
		synchronized (scriptCache) {
		    if (!scriptCache.containsKey(path)) {
			try (InputStreamReader in = new InputStreamReader(this.getClass().getResourceAsStream(path))) {
			    StringWriter out = new StringWriter();
			    char[] buff = new char[100 * 1024];
			    int byteRead = 0;
			    while ((byteRead = in.read(buff)) > 0) {
				out.write(buff, 0, byteRead);
			    }
			    scriptCache.put(path, out.toString());
			} catch (Exception e) {
			    throw new RuntimeException(e);
			}
		    }
		}
	    }
	    return scriptCache.get(path);
	}
    }

    private final ScriptEngine engine;

    private final InnerJsReader reader;

    private KJServletRuntime() {
	try {
	    engine = new ScriptEngineManager().getEngineByName("js");
	    engine.put("__kj_nashorn_engine__", engine);

	    String classPath = this.getClass().getClassLoader().getResource("").getPath().toString();
	    engine.put("$classpath", classPath);

	    // System

	    reader = new InnerJsReader();
	    engine.put("__kj_nashorn_inner_reader__", reader);

	    engine.eval(reader.read("_kjservlet_util_internal_.js"));
	    engine.eval(reader.read("_kjservlet_sys_internal_.js"));
	    engine.eval(reader.read("_kjservlet_log_internal_.js"));
	    // global configuration
	    File globalJs = new File(classPath + "/global.js");
	    if (globalJs.exists() && globalJs.isFile())
		engine.eval(new FileReader(globalJs));

	} catch (Exception e) {
	    throw new NashornJSException(e);
	}
    }

    public void loadInnerScript(String innerScriptName) {
	try {
	    engine.eval(reader.read(innerScriptName));
	} catch (Exception e) {
	    throw new NashornJSException(e);
	}
    }

    public Object invokeFunction(String function, Object... args) {
	try {
	    return ((Invocable) engine).invokeFunction(function, args);
	} catch (Exception e) {
	    throw new NashornJSException(e);
	}
    }

    public Object invokeMethod(String object, String method, Object... args) {
	try {
	    Object obj = engine.get(object);
	    return ((Invocable) engine).invokeMethod(obj, method, args);
	} catch (Exception e) {
	    throw new NashornJSException(e);
	}
    }

}
