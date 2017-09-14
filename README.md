# KJServlet - A Javascript web framework for Java
 KJServlet is lightweight javascript web framework which allows you to write sever side code using Javascript. It is based on Nashorn which is a script engine introduced in Java 8. In other words unlike Node.js which runs in V8 engine,  this framework runs on JVM environment. Which means that you can use all kinds of Java libs to construct you own web applications. 

 It is also a very free style framework, it allows you to write your Javascript in many ways. Take writing controller for example, you can use functions, or you can use method in a Javascript object; you can write the response in a callback function, or you can just return a JSON object and let the framework do the rendering. 

 This document is a reference guide to KJServlet framework features. Because of this is a very new framework and written by one person (which is me), so there might be some bugs that I have not discovered. If you find some problems, or have any questions or suggestions, or you want to get involved in this project, please let me know, here is my email: keijack.wu#gmail.com (please change # to @)
 
## Getting Start
 
 As the project name shows, it is a servlet, so you can very easily embed it into any J2EE projects.  Follow these steps to run the demo:
 
1. Download the `kjservlet-[version].jar` and put it into your project, in the most time, the location is 
```
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

## Route

As you can see, there are no route configurations in the demo, so how the framework actually find the route? Here, directories are used. 

Take the demo in the **Getting Start** for example, if you put the demo.js to a folder `path` in the class path (so that the real path of the demo.js will be `[webcontent]/WEB-INF/classes/path/demo.js`), then you will use `http://[your_server_host]:[your_server_port]/[your_servlet_context]/path/demo/sayHello?name=World` to visit the controller function. 

In fact, you do have some ways to configure the route. A `global.js` in the classpath root folder will be run when the runtime environment is being prepared. In this file, you can redefined a global variable $appEnv, which will affect the routing. 
```javascript
$appEnv = {
    fileHome : "/WEB-INF/server-js/", // Where your js files are, default is "classpath:"
    fileSuffix : ".js", // What suffix is your js file, default is "js"
    controller : {
        pkg : "org.keijack.kjservlet.demo.controller", // The package of the js file, when routing,
                                                       // you don't need to add  
                                                       // /org/keijack/kjservlet/demo/controller/  
                                                       // to you url. 
        suffix : "", // If your url have a suffix, like ".do", please set it here
    },
    resources : [ "*.html", "/images/*" ], // the url match these pattern will be treated as the static files
};
```  
If you want to get more information about this `global.js` file, please read the **The global.js file** chapter.

The last portion of the url is the controller function name, which is `sayHello` in the example above. In this example the function `sayHellow` in the `demo.js` will be called.

There is also another way to route to the controller function, we will talk about that later. 

KJServlet is function related design, it's OK for you to use global functions. In fact, every request will run in its own context -- We will go deeper into that latter -- so it doesn't matter even you have duplicated function names in different controller files. But if you want to arrange your codes well by using spaces and objects, the framework supports that as well. 

In the example above, if you defined an object like the following in your `demo.js` file:
```javascript
var person = {
    yieldName : function(req) {
        var name = req.parameters.name;
        return $renderer.html("<!DOCTYPE html><html><head><title>Say Hello</title></head><body>My name is " + name + "!</body></html>");
    }
};
```
Then you can use the following url to visit:
```
http://[your_server_host]:[your_server_port]/[your_servlet_context]/demo/person.yieldName?name=John
```

## Writing Controllers  
 
### The Request and the Response arguments
Just like the normal servlet that you will write when you implements javax.servlet.Servlet Interface in Java code, the framework will give you two arguments to your controller function. You should get user data from the first argument the framework past to your controller function, which is known as the Request object, and write data back by using the second argument which is known as the Response object. Of course, we have another way provided by using return values to send back data, and you can completely ignore the response object just like we did in the **Getting Start** chapter, we will talk about that latter.

The very example of using request and response objects is like this:
```javascript
function dosth(req, res){
    var someParamVal = req.parameters["name-defined-in-form-input"]; // if your parameters name is simple enough, you can use "." also, like: req.parameters.simpleName
    var serviceResult = someServiceObject.doService(someParamVal);
    res.write(serviceResult);
    /*
    if the serviceResult is the Java byte array, instead, please use
    res.writeByte(serviceResult);
    */
}
```
If you prefer to callback functions, you might write codes like:
```javascript
function dosth(req, res){
    var someParamVal = req.parameters["name-defined-in-form-input"]; // if your parameters name is simple enough, you can use "." also, like: req.parameters.simpleName
    someServiceObject.doService(someParamVal, function (serviceCallbackResult) {
        res.write(serviceCallbackResult);
    });
}
```

The completed fields and functions of the request and response objects are bellow. 

#### The Properties and Functions of the Request Object
* **req.oriRequest**, the original HttpServletRequest object comes from the servlet.  
* **req.session**, the HttpSession object comes from the original request's getSession() method.
* **req.authType**, the authType comes from the original request's getAuthType() method.
* **req.method**, the request method comes from the original request's getMethod() method.
* **req.contentLength**, the content length comes from the original request's getContentLength() method.
* **req.contentType**, the request content type, comes from the original request.getContentType() method.
* **req.queryString**, the query string, the string after the url's "?", comes from the original request's getQueryString() method.
* **req.protocol**, the protocol of this request, it would be "HTTP/1.1", comes from the original request's getProtocol() method;
* **req.schema**, the schema of this request, it would be "http" or "https", comes from the original request's getSchema() method;
* **req.serverName**, the server name, comes from the original request's getServerName() method.
* **req.serverPort**, the server port, comes from the original request's getServerPort() method.
* **req.contextPath**, the context path, if you put all the web content to the `$TOMCAT_HOME/webapps/ROOT/` for example, the context path is `/`, if the web content locates in `$TOMCAT_HOME/webapps/demo/`, the context path is `/demo/`;
* **req.requestURI**, the request uri, not includes the schema, server name, server port and query string  but inclues the context path. comes from the original request's getRequestURI() method.
* **req.requestUri**, an alias of `req.requestURI`.
* **req.ctxUri**, request uri without context path.
* **req.uri**, another alias of `req.requestURI`.
* **req.servletPath**, the servlet path comes from the original request's getServletPaht() method.
* **req.requestURL**, the string before the url's "?", comes from the original request's getRequestURL() method, already change it to a string using toString() method.
* **req.requestUrl**, an alias of `req.requestURL`.
* **req.url**, another alias of `req.requestURL`.
* **req.headers**, the request's headers, has been initialized by using the original request's getHeader(name) method. For example, You can use `req.headers["user-agent"]` to get the user agent.
* **req.header**, an alias of `req.headers`.
* **req.parameterValues**, the parameter values, including the values from the query string and the request body when content type is `application/x-www-form-urlencoded` and `multipart/form-data`. This property holds arrays, even only one value. If the values contains a file uploaded by user when the request's content type is `multipart/form-data`, the value will be an objeck like
```javascript
{
    "filename": "somePicture.jpg", // the file's name
    "contentType": "image/jpg", // the content type
    "content": "xxxxxx" // a string that get from the multipart content, 
                        // you can use getBytes() method to get the byte array, 
                        // and write it into a file.
}
```
* **req.parameterValue**, an alias of `req.parameterValues`.
* **req.paramVals**, another alias of `req.parameterValues`.
* **req.parameters**, similar whith `req.parameterValues`, but only have one value. If there are more than one value with the parameter name, the first one would be the value here.
* **req.parameter**, an alias of `req.parameters`.
* **req.params**, another alias of `req.parameters`.
* **req.param**, another alias of `req.parameters`.
* **req.pathValues**, the values comes from the url path itself, will discuss latter.
* **req.pathValue**, an alias of `req.pathValues`.
* **req.setAttribute(name, val)**, the wrap of the original request's setAttribute(name, value) method.
* **req.setAttr(name, val)**, an alias of `req.setAttribute(name, val)`;
* **req.getAttribute(name, defaultValue)**, the wrap of the original request's getAttribute(name) method, if there are no value then return the defaultValue that given.
* **req.getAttr(name, defaultValue)**, an alias of `req.getAttribute(name, defaultValue)`.
* **req.removeAttribute(name)**, the wrap of the original request's removeAttribute(name) method.
* **req.removeAttr(name)**, an alias of `req.removeAttribute(name)`.
* **req.rmAttr(name)**, another alias of `req.removeAttribute(name)`.
* **req.readRequestBody()**, return the request body string, if the content type is `application/x-www-form-urlencoded`, this method will return null.
* **req.data**, if the request content type is `application/json`, this property will be JSON.parse(req.readRequestBody).

#### The Properties and Functions of the Response Object
* **res.oriResponse**, the original HttpServletResponse object.
* **res.contentType**, the content type of this response, will set this value using original response's setContentType() method.
* **res.headers**, headers of this response, will use original response's addHeader(name, value) to add all these properties to the original response. 
* **res.header**, an alias of `res.headers`.
* **res.addHeader(name, value)**, the wrap of the original response's addHeader(name, value) method.
* **res.setHeader(name, value)**, the wrap of the original response's setHeader(name, value) method.
* **res.sendError(code, message)**, the wrap of the original response's sendError(code, message) method, it's OK that you ignore the message parameter by just using `res.sendError(code)`.
* **res.redirect(url)**, the wrap of the original response's sendRedirect(url) method.
* **res.write(data)**, write data to the response's output stream. Data could be a JSON object, in this case, the JSON.stringify(data) will be used before to change the JSON object to string. 
* **res.writeByte(bytes)**, only accept byte array as the only parameter, write data by using original response's getOutputStream().write(bytes); *About the Content-Length, the response object will calculate that automatically.*

### Another Way to Response




