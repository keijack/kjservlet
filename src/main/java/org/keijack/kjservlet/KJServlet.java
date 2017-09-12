package org.keijack.kjservlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class KJServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private boolean debug = false;

    private KJServletRuntime jservletRuntime;

    @Override
    public void init() throws ServletException {
	super.init();
	String debugParam = getInitParameter("debug");
	debug = "true".equalsIgnoreCase(debugParam);
	jservletRuntime = new KJServletRuntime(getServletContext());
    }

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	getJservletRuntime().doRequest(request, response);
    }

    private KJServletRuntime getJservletRuntime() {
	if (debug) {
	    return new KJServletRuntime(getServletContext());
	} else {
	    return jservletRuntime;
	}
    }

}
