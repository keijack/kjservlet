package org.keijack.kjservlet;

import java.io.File;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.io.StringWriter;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public final class KJServletRuntime {

    public class InnerJsReader {

	public String read(String path) {
	    try (InputStreamReader in = new InputStreamReader(this.getClass().getResourceAsStream(path))) {
		StringWriter out = new StringWriter();
		char[] buff = new char[1024];
		int byteRead = 0;
		while ((byteRead = in.read(buff)) > 0) {
		    out.write(buff, 0, byteRead);
		}
		return out.toString();
	    } catch (Exception e) {
		throw new RuntimeException(e);
	    }
	}
    }

    private final ScriptEngine engine;

    public KJServletRuntime(ServletContext ctx) {
	try {
	    engine = new ScriptEngineManager().getEngineByName("js");
	    engine.put("__kj_nashorn_engine__", engine);

	    engine.put("$servletContextRoot", ctx.getRealPath("/"));

	    String classPath = this.getClass().getClassLoader().getResource("").getPath().toString();
	    engine.put("$classpath", classPath);

	    // System
	    InnerJsReader reader = new InnerJsReader();
	    engine.put("__kj_nashorn_inner_reader__", reader);

	    engine.eval(reader.read("_kjservlet_util_internal_.js"));
	    engine.eval(reader.read("_kjservlet_sys_internal_.js"));
	    engine.eval(reader.read("_kjservlet_log_internal_.js"));
	    // global configuration
	    File globalConf = new File(classPath + "/global.js");
	    if (globalConf.exists())
		engine.eval(new FileReader(globalConf));

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
