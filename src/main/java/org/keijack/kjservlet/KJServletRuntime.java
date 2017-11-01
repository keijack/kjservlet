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
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
			    char[] buff = new char[1024];
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

    private KJServletRuntime() {
	try {
	    engine = new ScriptEngineManager().getEngineByName("js");
	    engine.put("__kj_nashorn_engine__", engine);

	    String classPath = this.getClass().getClassLoader().getResource("").getPath().toString();
	    engine.put("$classpath", classPath);

	    // System
	    InnerJsReader reader = new InnerJsReader();
	    engine.put("__kj_nashorn_inner_reader__", reader);

	    engine.eval(reader.read("_kjservlet_util_internal_.js"));
	    engine.eval(reader.read("_kjservlet_sys_internal_.js"));
	    engine.eval(reader.read("_kjservlet_log_internal_.js"));
	    // global configuration
	    File globalJs = new File(classPath + "/global.js");
	    if (globalJs.exists())
		engine.eval(new FileReader(globalJs));

	} catch (Exception e) {
	    throw new NashornJSException(e);
	}
    }

    public void initHttp(ServletContext ctx) {
	try {
	    String ctxRoot = ctx.getRealPath("/");
	    if (!ctxRoot.endsWith(File.separator)) {
		ctxRoot += File.separator;
	    }
	    engine.put("$servletContextRoot", ctxRoot);
	    InnerJsReader reader = (InnerJsReader) engine.get("__kj_nashorn_inner_reader__");
	    engine.eval(reader.read("_kjservlet_http_internal_.js"));
	} catch (Exception e) {
	    throw new NashornJSException(e);
	}
    }

    public void doRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException {
	try {
	    ((Invocable) engine).invokeFunction("_kj_dispatch_and_run_", request, response);
	} catch (Exception e) {
	    throw new ServletException(e);
	}
    }

}
