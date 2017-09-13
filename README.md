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

## Route

As you can see, there are no route configurations in the demo, so how the framework actually find the route? Here, directories are used. 

Take the demo in the <b>Getting Start</b> for example, if you put the demo.js to a folder `path` in the class path (so that the real path of the demo.js will be `[webcontent]/WEB-INF/classes/path/demo.js`), then you will use `http://[your_server_host]:[your_server_port]/[your_servlet_context]/path/demo/sayHello?name=World` to visit the controller function. 

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
If you want to get more information about this `global.js` file, please read the <b>The global.js file</b> chapter.

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
```shell
http://[your_server_host]:[your_server_port]/[your_servlet_context]/demo/person.yieldName?name=John
```

## Writing Controllers
When the framework finally find your controller function via routing mentioned above chapter, the framework will call your function by giving your function 2 arguments, which are request and response -- Which are not the original HttpServletRequest and HttpServletResponse objects from servlet, but the wrapped ones. But if you really want to get the original Java Object, use request.oriRequest to get the original HttpServletRequest, and use the response.oriResponse to get the original HttpServletResponse.  
 
There are several code style to write controller function.
 
### Use response object and return no values




 
