package org.keijack.kjservlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class KJServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    /**
     * @deprecated This is the field that I use to test the global.js
     */
    private boolean debug = false;

    private KJServletRuntime runtime;

    @Override
    public void init() throws ServletException {
	super.init();
	String debugParam = getInitParameter("debug");
	debug = "true".equalsIgnoreCase(debugParam);
	runtime = KJServletRuntime.getInstance();
	runtime.loadInnerScript("_kjservlet_http_internal_.js");
	runtime.invokeFunction("_kj_servlet_init_", getServletContext());
    }

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	getRuntime().invokeFunction("_kj_servlet_dispatch_and_run_", request, response);
    }

    private KJServletRuntime getRuntime() {
	if (debug) {
	    KJServletRuntime runtime = KJServletRuntime.newInstance();
	    runtime.loadInnerScript("_kjservlet_http_internal_.js");
	    runtime.invokeFunction("_kj_servlet_init_", getServletContext());
	    return runtime;
	} else {
	    return runtime;
	}
    }

}
