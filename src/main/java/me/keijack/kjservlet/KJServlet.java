package me.keijack.kjservlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class KJServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	String debugParam = getInitParameter("debug");
	boolean debug = "true".equalsIgnoreCase(debugParam);
	KJServletRuntime.getInstance(!debug).doRequest(request, response);
    }

}
