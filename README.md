# KJServlet - A Javascript web framework for Java
 KJServlet is lightweight javascript web framework which allows you to write sever side code using Javascript. It is based on Nashorn which is a script engine introduced in Java 8. In other words unlike Node.js which runs in V8 engine,  this framework runs on JVM environment. Which means that you can use all kinds of Java libs to construct you own web applications. 

 It is also a very free style framework, it allows you to write your Javascript in many ways. Take writing controller for example, you can use functions, or you can use method in a Javascript object; you can write the response in a callback function, or you can just return a JSON object and let the framework do the rendering. 

 This document is a reference guide to KJServlet framework features. Because of this is a very new framework and written by one person (which is me), so there might be some bugs that I have not discovered. If you find some problems, or have any questions or suggestions, or you want to get involved in this project, please let me know, here is my email: keijack.wu#gmail.com (please change # to @)
 
 ## Getting Start
 As the project name shows, it is a servlet, so you can very easily embed it into any J2EE projects.  Follow these steps to run the demo:
 
1. Download the `kjservlet-[version].jar` and put it into your project, in the most time, the location is 
```shell
 [webapps]/WEB-INF/lib
 ```   
2.  If you are using maven, for the reason that this project have not put into the maven central repository (will do it latter), you have  to checkout this project and make it as your local maven modual, then add the following dependency to your `pom.xml`
```xml
	<dependency>
		<groupId>me.keijack.kjservlet</groupId>
		<artifactId>kjservlet</artifactId>
		<version>0.1.0</version>
	</dependency>
```
3. Add the servlet and servlet-mapping to your `web.xml`
```xml
	<servlet>
		<display-name>k-js-servlet</display-name>
		<servlet-name>KJServlet</servlet-name>
		<servlet-class>org.keijack.kjservlet.KJServlet</servlet-class>
	</servlet>
	<servlet-mapping>
		<servlet-name>KJServlet</servlet-name>
		<url-pattern>/*</url-pattern>
	</servlet-mapping>
```
4. Add a Javascript file `demo.js` into the classpath folder, which mostly is `[webcontent]/WEB-INF/classes`
5. Add a function to `demo.js` like: 
```javascript
function sayHello(req){
	var name=req.param["name"];
	return $renderer.html("<!DOCTYPE html><html><head><title>Say Hello</title></head><body>Hello, " + name + "</body></html>");
}
``` 
6, Start up the server, and use you browser to visit `http://[your_server_host]:[your_server_port]/[your_servlet_context]/demo/sayHello?name=World`, then you will see the "Hello World" in the browser.

For more information, please read the User Guide.
