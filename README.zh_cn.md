# KJServlet - 一个基于 Java 的 JS web 框架
KJServlet 是一个轻量级的 Javascript web 框架，该框架基于由 Java 8 开始引入的 Nashorn 引擎，这意味着你所写的 javascript 代码最终会运行在 JVM 的环境下，也正因为如此，你可以非常容易的使用各种已经存在的第三方 Java 类库来构建你的应用程序。

这也是一个比较自由风格的框架，支持你使用不同的代码风格来编写你的逻辑。拿编写 controller 为例，你可以将使用流行的面向函数变成的方式使用函数来当作入口，或许你习惯了面向对象的风格，你也可以使用对象和方法来作为入口；在编写 controller 方法的时候，你可以使用回调（callback）的方式来返回页面数据，也可以直接返回数据由框架来确定如何返回，并且，该框架支持了 MVC，你可以使用非常熟悉的 JSP、Freemarker、Velocity 来编写你的显示层代码。 

这个文档是本框架的使用文档，绝大部分内容是在描述框架提供的接口和使用方式，偶尔会有一些设计的内容，但是非常少，如果你们对框架的设计本身有兴趣，在读源代码的时候有问题，可以随时联系我。另外由于这个框架非常的新，并且目前只有一个人在维护，一些错误和 BUG 是无可避免的，所以如果出现了问题，除了可以在这里提交 BUG 之外，也可以随时邮件联系我，我的邮箱未 keijack.wu@gmail.com。在国内可发送邮件到 keijack@163.com  

<b>*关于许可：就目前而言，该框架提供两种许可，默认的情况是 GPL，如果你想将该框架作为商业用途，又不想开放源代码的话，可以随时联系我，我会提供一个 Apache 的许可。*</b>
 
##  快速开始
本框架所有的接口都基于J2EE的标准接口，所以你可以非常容易的将其嵌入到任何的 J2EE 项目当中。你可以按照以下步骤来运行一下例子：
 
1. 下载`kjservlet-[version].jar`并将其放入你的工程lib目录，大部分情况下，这个目录的位置是
```
 [webapps]/WEB-INF/lib
 ```   
2. 如果你使用 maven，由于这个框架尚未提交到中央库，所以你可以下载本工程，通过 maven install 到本地仓库，之后在你的例子工程的 `pom.xml` 加入： 
```xml
	<dependency>
		<groupId>me.keijack.kjservlet</groupId>
		<artifactId>kjservlet</artifactId>
		<version>0.1.0</version>
	</dependency>
```
3. 在你 web 工程的 `web.xml` 中增加以下的 servlet 和 servlet-mapping：
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
4. 在你的 class path 目录下（大部分情况下，这个目录是 `./WEB-INF/classes`）增加一个 javascript 文件 `demo.js`。 
5. 在`demo.js`文件上增加下述方法：
```javascript
function sayHello(req){
    var name=req.param["name"];
    return "<!DOCTYPE html><html><head><title>Say Hello</title></head><body>Hello, " + name + "</body></html>";
}
``` 
6. 启动服务器，并且用浏览器方位`http://127.0.0.1:8080/kjservlet-demo/demo/sayHello?name=World`，“Hello world” 就会显示在浏览器上了。 

更多详细的内容，请参考以下的用户手册。

## 路由
就如你在上面例子所看到的，你甚至不需要配置任何的路由信息，为何？因为这个框架是基于目录来进行路由的。

就上述的例子而言，如果你将`demo.js`放到一个目录，例如`./WEB-INF/classes/path`中，那么，你的访问地址就得变为`http://127.0.0.1:8080/kjservlet-demo/path/demo/sayHello?name=World`。 

事实上，除了路经之外，还是有一些别的配置项会影响路由规则的。 这个框架在每次启动的时候都会从 classpath 目录下尝试去读取一个名为`global.js`的 javascript 文件，你可以在这个文件中增加一些配置内容。
```javascript
$webapp = {
    controller : {
        fileHome : "classpath:/org/keijack/kjservlet/demo/controller", // 你的 controller 以及其引入的 javascript 文件的根目录, 默认情况下是 "classpath:"
        fileSuffix : ".js", // 你的 controller 以及其引入的 javascript 文件的后缀，默认是".js"
        suffix : "", // 你访问服务器的 url 的后缀，例如常用的 .do 或者 .action
    },
    resources : [ "*.html", "/images/*" ], // 一些静态文件的规则。
};
```  
`global.js`在这个框架中是一个非常重要的文件，他不是完整意义上的配置文件，因为在上面的 javascript 会被执行，一些全局的方法你也可以在这里定义。具体的内容，请参考`global.js文件`相关的章节内容。

以”/“未分割，除了服务器，上下文路经之外，前面的部分是计算的 controller 文件的路经，最后的一段则是 controller 的函数或者是对象和方法。在上面例子中，`sayHello`便是处理这次请求的函数。

还有另外一种方式可以配置路由，这一点我们稍后再述。 

本框架的设计未面向函数设计。所以，在你的 controller js 文件中，你完全可以使用全局函数，而不必拘泥于使用对象。事实上，每个请求都会运行在一个新的上下文（context）里，这意味着你甚至可以在 controller 文件中使用全局变量，这些”全局变量“事实上只在当次请求有效。当然，你也完全使用对象来管理你的代码。 

如上述例子，如果使用对象方法而非函数的话，你可以定义这样一个对象在你的`demo.js`：
```javascript
var person = {
    yieldName : function(req) {
        var name = req.parameters.name;
        return "<!DOCTYPE html><html><head><title>Say Hello</title></head><body>My name is " + name + "!</body></html>";
    }
};
```
你可以使用以下链接访问该 controller 方法:
```
http://[your_server_host]:[your_server_port]/[your_servlet_context]/demo/person.yieldName?name=John
```
You can add alias to routes, at your $webapp object, add a property named `alias`. for example:
本框架主要的路由规则都是依据路经来计算的，如果你还是比较习惯使用路由配置的方法的话，那么你可以使用`aliases`的配置来进行配置。*请注意，这个只是别名，原路经按照规范访问依然有效。*
```javascript
$webapp = {
    controller : {
        fileHome : "classpath:/org/keijack/kjservlet/demo/controller", 
        fileSuffix : ".js",  
        suffix : "", 
    },
    aliases : { // 别名
    	"/yieldMyName" : "/demo/person.yieldName",
    },
    resources : [ "*.html", "/images/*" ], 
};
```
增加了上述配置之后，你可以使用以下链接访问上面对象的例子。
```
http://[your_server_host]:[your_server_port]/[your_servlet_context]/yieldMyName?name=John
```

## 引入其他的文件
上一章节说明了本框架的路由规则，通过路经来寻找处理一个请求的 javascript 文件。但是，将所有的逻辑放在一个文件中并不是最佳的实践，所以在实际业务当中，大部分情况下我们需要在一个文件中引入其他的文件。
 
Nashorn 内置提供了一个方法 load(文件全路经)，不过我们并不推荐你使用这个方法，而是使用框架提供的 import(文件相对路经) 的方法。

以下是你应该使用 imports() 方法的理由:

* 在一个范围里（global.js运行在全局范围内，每个请求运行在单独的范围，关于范围这一点，后续有详细说明），import 方法之后引入一个文件一次。所以对于一些通用的方法而言，通过 import 引入，会更为高效。也不会因为重复引入而导致一些问题。

* import 方法使用的是相对路经，所以有更好的迁移性，不会因为你迁移了路经就导致引入错误。*注意！在 controller 范围引入文件是，相对路经的根目录是你在 `global.js` 的 `$webapp` 对象中配置的 `fileHome` 属性的值（默认是 classpath），而在全局范围内，import 方法的根目录固定是 classpath。* 

* 使用 import 方法，你可以使用 `.` 符号来替代 `/` 符号，这对于熟悉 Java 的程序员来说更为熟悉。也因此，请注意 *在你的文件路经当中你不能使用`.`符号来命名，而且在引入时不能包含文件的后缀名。在 controller 范围中引入文件，你的后缀名可以通过在 `global.js` 的 `$webapp` 中的 fileExtension 来进行配置；而在全局范围内，你所有的引入文件后缀名必须是`.js` *
 

## 编写 Controller 函数/方法  
 
### Request 和 Response 参数
就如你自己编写 Servlet 类一样，你的 controller 函数/方法会接收到两个参数，第一个参数是 request，第二个参数是 response。这两个参数本身就是对 HttpServletRequest 和 HttpServletResponse 进行了 js 对象封装。所以，理论上，你应该从 request 对象获取用户提交的内容，然后通过 response 对象将结果数据写回。但是，似乎你在**快速开始**章节的并不是这样，你只看到一个 request 参数，关于这一点，会在后续说明。

参考以下的 controller 方法
```javascript
function dosth(req, res){
    var someParamVal = req.parameters["name-defined-in-form-input"]; // 如果你的参数足够简单，你甚至只用 "."，例如你的参数名是"simpleName"的话，你可以使用: req.parameters.simpleName
    var serviceResult = someServiceObject.doService(someParamVal);
    res.write(serviceResult);
}
```
如果你更习惯使用回调方法的话，你可以这样来编写:
```javascript
function dosth(req, res){
    var someParamVal = req.parameters["name-defined-in-form-input"]; 
    someServiceObject.doService(someParamVal, function (serviceCallbackResult) {
        res.write(serviceCallbackResult);
    });
}
```

以下是 request 对象和 response 对象的完整属性、方法列表。 

#### Request 对象的完整属性和方法（命名为 req ）
* **req.oriRequest**, 原始的 HttpServletRequest Java 对象.  
* **req.session**, 通过原始的 request.getSession() 获取的 HttpSession Java 对象。
* **req.authType**, 通过原始的 request.getAuthType()获取的字符串对象。
* **req.method**, 通过原始的 request.getMethod()获取的字符串对象。
* **req.contentLength**, 通过原始的 request.getContentLength()获取的long对象，标识请求内容的字节数。
* **req.contentType**, 通过原始的 request.getContentType()获取的字符串对象，标识请求内容的类型。
* **req.queryString**, 通过原始的 request.getQueryString()获取的字符串对象，是你访问地址 "?" 后面的内容。
* **req.protocol**, 通过原始的 request.getProtocol()获取的字符串对象，是本次访问的协议。
* **req.schema**, 通过原始的 request.getSchema()获取的字符串对象，是本次访问的协议，可能是“http”或者是“https”。
* **req.serverName**, 服务器名，通过原始的 request.getServerName() 获取的字符串对象。
* **req.serverPort**, 服务器端口，通过原始的 request.getServerPort() 获取的数字对象。
* **req.contextPath**, 上下文，通过原始的 request.getContextPath() 获取的字符串对象。;
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
In this section, you can see how to ignore the response object, and use return value to send back data.

As you can see in the **Getting Start** chapter, you can completely ignore the response object, and return some values which will be written back to original response by the framework.

The value returned will be a structure JSON object, you don't need to know how the JSON like. Because a global object $renderer is provided, which will do the wrapping. 

The methods of the $renderer object is bellow:
* **$renderer.render(contentType, content, headers)**, render a customized content type response. However, if you pass null, "", false to the contentType parameter, the framework will try to guess what you content is. The content parameter should be a string; parameter headers is optional, it is a JSON object, all its values will use the original response's addHeader(name, value) method to add to the response.
* **$renderer.text(text, headers)**, render a text response, the content type will be "text/plain"; the headers is optional. 
* **$renderer.html(data, headers)**, render a html response, the content type will be "text/html"; the headers is optional. 
* **$renderer.json(data, headers)**, render a JSON response, the content type will be "application/json"; the data should be a JSON object, and the headers is optional.
* **$renderer.bytes(data, headers)**, data should be a Java byte array, and the headers is optional. The framework will use the original response's getOutputStream().write(data) to write the data back.
* **$renderer.redirect(url, headers)**, the framework will use the original response's sendRedirect(url) to send a redirect. Before that headers -- if you pass it to the method -- will be added to the response's headers. 
* **$renderer.forward(url, data, headers)**, the framework will use the original request.getRequestDispatcher(url).forward(request, response) to forward the request. The data parameter and the headers parameter are optional. When you pass this two parameters, the values in data object will be added to request using the original request's setAttribute(name, value) method, while headers will be added to the **response**'s header by using the original response's addAttribute(name, value) method.
* **$renderer.error(code, message)**, send back an error, message is optional.
* **$renderer.view(viewFileLocation, data, headers)**, using MVC design pattern, support JSP, Freemarker and Velocity, customized resolve function. will discuss this latter.

By using the $renderer object , your code style would probably like:
```javascript
function dosth(req){
	var param = req.parameters;
	var serviceResult = someServiceObject.doService(param);
	return $renderer.json(serviceResult);
}
```
You can even use even much simpler way to do this, like:
```javascript
function dosth(req){
	var param = req.parameters;
	var serviceResult = someServiceObject.doService(param);
	return serviceResult;
}
```
The framework will do the wrap for you. You can also return some string like:
```javascript
    return "<!DOCTYPE html><html>....</html>"; // will render as "text/html".
```
```javascript
    return "<?xml version="1.0" encoding="UTF-8"?><tag>...</tag>"; // will render as "text/xml"
```
```javascript
    return "redirect:/url"; // will redirect to /url
```
```javascript
    return "forward:/url"; // will forward to /url
```
```javascript
    return "some text"; // will render as "text/plain" 
```

## MVC
MVC is a well know design pattern, whose main principle is to separate the business logic layer(Model), control layer(controller), and the presentation layer(View) to make codes much clearer and easier to read, maintain and extend.  
  
Web developers loves to use MVC patterns, especially Java web developers, so they have done so much work on building up all kinds of template engines. Thanks to this, we can very easily using MVC in our framework.
 
KJServlet support JSP, Freemarker and Velocity template engine. 

It's very easy to use the template, just like:
```javascript
function dosth(req){
    var param = req.parameters;
	var serviceResult = someServiceObject.doService(param);
	return $renderer.view("/WEB-INF/pages/view.jsp", serviceResult);
}
```
The template engine is JSP by default, if you want to change it, please set it up in $webapp in your `global.js` file.
```javascript
$webapp = {
    controller : {
        fileHome : "classpath:/org/keijack/kjservlet/demo/controller", // Where your js files are, default is "classpath:"
        fileSuffix : ".js", // What suffix is your js file, default is ".js" 
        suffix : "", 
    },
    resources : [ "*.html", "/images/*" ],
    view : {
        resolver : "jsp", // The resolver, "jsp" by default, you can change it to "freemarker" or "velocity"
        prefix : "/WEB-INF/pages/", // the prefix of the view
        suffix : ".jsp", // the suffix of theview
    }, 
}
```
With the configuration above, you controller will be:
```javascript
function dosth(req){
    var param = req.parameters;
	var serviceResult = someServiceObject.doService(param);
	return $renderer.view("view", serviceResult); // and the template file will be /WEB-INF/pages/view.jsp 
}
```
*Notice! When you change the resolver to `freemarker` or `velocity`, you must import the relative jars to your project. If you use freemarker resolver, and using maven to build your webapp, the following dependency mush be added to your `pom.xml`*
```xml
    <dependency>
        <groupId>org.freemarker</groupId>
        <artifactId>freemarker</artifactId>
        <version>2.3.26-incubating</version>
    </dependency>
```
The second parameter which names data of the **$renderer.view(templateFileLocation, data, header)** should be a JSON object, the framework will convert this into a Java Map, so when you are writing the template file, just use it as a Map. 

For Example, if you data object is:
```javascript
function dosth(req){
    var data = {"userName": "Jhon",
                "sex": "male",
                "age": 28,
                "department": { "name": "HR",
                                "phone": "+01xxxxxx",
                },
                "subordinates": ["Mike", "Lily"]
    };
    return $renderer.view("view", data);
}
```
So in your template file -- take freemarker for example -- would probably like:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Personal Details</title>
</head>
<body>
    <h1>Personal Details of ${userName}</h1>
    <p>sex: ${sex}</p>
    <p>age: ${age}</p>
    <p>department: ${department.name}</p>
    <p>subordinates: <#list subordinates as sbn>${sbn}, </#list>
</body>
</html>
``` 
Functions are also allowed in the data object, please use method `call` or `apply` to use functions.

*Notice: `call` method accepts at most 10 arguments. And `apply` method accepts an array as the only argument.*  

Assume that your data object 
```javascript
    var data = {"userName": "Jhon",
                "sex": "male",
                "isAdult": function(){
                	// Notice: please don't use `this` here, for the function will be wrapped into a Java Object called JSFunctionWrapper. 
                	return data.age >= 18;
                },
                "age": 28,
                "department": { "name": "HR",
                                "phone": "+01xxxxxx",
                },
                "subordinates": ["Mike", "Lily"]
    };
```

*Notice: please don't use `this` in this kind of functions, for they will be wrapped into a Java Object `JSFunctionWrapper` which `this` will point to.*

Then in your template file,
```html
<!DOCTYPE html>
<html>
<head>
    <title>Personal Details</title>
</head>
<body>
    <h1>Personal Details of ${userName}</h1>
    <p>sex: ${sex}</p>
    <p>is adult: ${isAult.call()}</p>
    <p>age: ${age}</p>
    <p>department: ${department.name}</p>
    <p>subordinates: <#list subordinates as sbn>${sbn}, </#list>
</body>
</html>
```  
 
You can even customized your own resolver:
```javascript
$webapp = {
    controller : {
        fileHome : "classpath:/org/keijack/kjservlet/demo/controller", // Where your js files are, default is "classpath:"
        fileSuffix : ".js", // What suffix is your js file, default is ".js" 
        suffix : "", 
    },
    resources : [ "*.html", "/images/*" ],
    view : {
        resolver : function(viewFileLocation, data, headers){
            // viewFileLocation is the one that has already contacted with the prefix and suffix.
            // you can do your own logic here
            var html = ...;
            // finally don't forget to return the result object.
            return $renderer.html(html, headers); 
        },
        prefix : "/WEB-INF/pages/", // the prefix of the view
        suffix : ".jsp", // the suffix of theview
    }, 
}
```
## Annotations and AOP
Unlike Java, there are no build-in annotation support in Javascript, and because of that you can defined your object any time, any where, it's pretty hard to intercept into the logic in runtime. However, we play a little trick for that. 
  
If you are familiar with Javascript, you must have heard of the **strict mode**. If you want to run a function in a strict mode, you just need to add a line "use strict" to first line of the function body. Our annotations just like that. 
```javascript
function dosth(req){
    "use strict";
    "@post"; // KJSeverlet build-in annotations, this controller accepts only "POST" request.
    "@myOwnAnno"; // user-defined annotations
    //your function codes here
    ...
    "@Anno2"; // this cannot be read.    
    ...
}
```
So, the annotations of this controller function are ["@post", "@myOwnAnno"]. 

*Notice! Annotations can only be read in the Controller functions!*

Now, you know how to put annotations, but how to use it? Let go back to $webapp in the `global.js`;
```javascript
$webapp = {
    controller : {
        fileHome : "classpath:/org/keijack/kjservlet/demo/controller", // Where your js files are, default is "classpath:"
        fileSuffix : ".js", // What suffix is your js file, default is ".js" 
        suffix : "", 
    },
    resources : [ "*.html", "/images/*" ],
    view : {
        resolver : "jsp", 
        prefix : "/WEB-INF/pages/", 
        suffix : ".jsp", 
    },
    interceptors : [ {
        intercept : ["@myOwnAnno"], // It's OK to use just a string here, rather than an array.
        before : function(req, res, ctx) {
            // do things here before the controller function being called
            return true; // you must return true to tell the framework that continue to call the controller function, or not the controller function will not be called.
        },
        after : function(req, res, result, ctx) {
            // do things after the controller function been called
        },
        onError : function(req, res, error, ctx) {
            // do things when error occurs.
        } 
    } ],  // if you only have one interceptor, you can put an object here rather that an array.
}
```

The `ctx` object pass to all your AOP functions is a global object in your Request Scope, you can use `$context` to access it in your controller script files.

For example, you can use this object to open a connection that you can use in a whole request thread.  (About the $db object, check the **The `$db` Object** section)
```javascript
// In the global.js
$webapp = {
    ...
    interceptors : [ {
        intercept : ["@myOwnAnno"], // It's OK to use just a string here, rather than an array.
        before : function(req, res, ctx) {
            ctx.conn = $db.connect(); // "default" data source is used.
            ctx.conn.autoCommit = false;
            return true; 
        },
        after : function(req, res, result, ctx) {
            ctx.conn.commit();
        },
        onError : function(req, res, error, ctx) {
            ctx.conn.rollback();
        }
    }
};
// In your controller script and the script files it imports.
$context.conn.insert("TableName", {...});
```

There are some build-in annotations, which are **"@get", "@head", "@post", "@put", "@delete", "@connect", "@options", "@trace", "@patch"**. As you can see, they are all request methods in lower case. So if you put at lease one of this annotations to a controller function, but the method of a request is not among them, a 404 error will be sent back.  

## Events
Many Javascript developers like to use events. But, Nashorn runs on Java environment, so it's weak on supporting events.

However, KJServlet provides a simple event handler. 
```javascript
/**
 * Register a function to an event
 **/
var listener = $event.on("eventName", function(data) {
	// Your codes  here will be called when an event with the eventName is published.
});

/**
 * remove the listener from the event. 
 **/
listener.off();
/**
 * Or you can use this function.
 **/
$event.remove(listener);

/**
 * Unregister an event, remove all its listeners.
 **/
$event.off("eventName");

/**
 * Publish an event
 **/
$event.publish("eventName", data);
```
*Notice! The $event works only in the request scope, that means if you cannot use $event object in `global.js` and the script files that imported to it. *

## Websocket
### Configuration
To use websocket, add the object `$websocket` definition in your `global.xml`:
```javascript
$websocket = {
    fileHome : "classpath:", // Where your handler js files are. 'classpath:' by default.
    fileExtension : ".js", // The extension of your handler js files. default '.js' by default.
    endpoints : [
        {
            endpoint : "/ws/echo/{pathValue0}/{pathValue1}", // The url that your client connect to the server. 
            handler : "/ws/echo/echo.upper", // You handler js file path and object.  
            onHandShake : function(conf, request, response) { // this method is optional
            	// your codes here. The conf, request, response objects are Java objects. 
            }
        },
        "/ws/chatRoom/checkin", // simple way, no onHanShake, the `endpoint` value and the `handler` value are the same.
    ]
}
```
In the example configuration above, your websocket handler javascript files will be stored in the java classpath, which may probably be `/WEB-INF/classes`, and with the extension `.js`. There are two endpoints registered, the first one, the websocket client will connect with the url `ws://[server-name]:[server-port]/[webapp-context]/ws/echo/pv0/pv1`, and the handler javascript file will has a name `echo.js` and be placed in the folder `classpath:/ws`. There is at least an object in this javascript, just like: 
```javascript
var echo = {
	upper : {
		onOpen : function(session, conf) {
			// This method will be called when session opens
		}, 
		onMessage : function(session, message) {
			// your codes
		},
		onClose : function(session, closeReason) {
			// your codes
		}, 
		onError : function(session, throwable) {
			// your codes
		}
	}
}
```
### Handler Methods  
Four methods will be called from there session start until the session ended. They are
* **onOpen(session, conf)**, called when session opens. `session` is a wrapped json object, conf is a Java object, the same object that pass to the `onHandShake` method that configured in the `global.js`.
* **onMessage(session, message)**, called when message are received, `session` is the same object that pass to the `onOpen` method. the `message` variable is the text message that the client send to the server.
* **onClose(session, closeReason)**, called when the session closes, `session` is the same object that pass to the `onOpen` method. `closeReason` is the J2EE original CloseReason object.
* **onError(session, throwable)**, called when exception occurs, `session` is the same object that pass to the `onOpen`method. `throwable` is the exception or error that throws by the business logic.

All these four methods are optional, you can choose those you need. 

### Fields and Methods in `session` Variable
* **session.oriSession**, the original Java Session Object.
* **session.id**, the id of this session.
* **session.sessionId**, the alias of session.id.
* **session.getId()**, the method that return the session.id.
* **session.sendText(text, isLast)**, the method that send text to client, `isLast` is optional. if the `isLast` variable is passed, the session will only send all text when `isLast` == true.
* **session.sendPing(pingMsg)**, send a ping message. 
* **session.sendPong(pongMsg)**, send a pong message.
* **session.sendBytes(bytes)**, send Java byte array, if the `bytes` variable is not a `byte[]` object, this method will not do anything.
* **session.sendBinary(binary)**, send binary data, `binary` must be the Object of `java.nio.ByteBuffer`, or this method will not do anything.
* **session.sendJSON(jsonObject)**, send a JSON object as a string. 
* **session.sendJson(jsonObject)**, alias of `session.sendJSON(jsonObject)`.
* **session.sendJavaObject(javaObject)**, send a Java Object.
* **session.send(data)**, this method will find the suitable send method to send the message.
* **session.uri**, the uri of this websocket.
* **session.requestURI**, the alias of `session.uri`.
* **session.pathValues**, the path values that configured in the endpoint. It is a JSON object, key is the words that configure in the endpoint and surrounded by the `{}`. And the value is the words that you pass in your connection. 
* **session.pathValue**, the alias of `session.pathValues`.
* **session.pathVals**, the alias of `session.pathValues`.
* **session.pathVal**, the alias of `session.pathValues`.
* **session.pathValue**, the alias of `session.pathValues`.
* **session.queryString**, the query string from the connection url.
* **session.pathParameters**, the alias of `session.pathValues`.
* **session.pathParams**, the alias of `session.pathValues`.
* **session.pathParam**, the alias of `session.pathValues`.
* **session.parameterValues**, just like the Http request, it comes from the QueryString, the values of this object is always an array. 
* **session.paramValues**, the alias of `session.parameterValues`.
* **session.paramVals**, the alias of `session.parameterValues`.
* **session.requestParameterMap**, the alias of `session.parameterValues`.
* **session.parameters**, similar with `session.parameterValues`, but the value of this object always is a string. If there are more than one value with the same name in the query string, the first one is here.

*You may save the session for a global use and send text in other threads, however, because that Nashorn is not multi-thread safe, please check the `Multi-Thread Safety` to find a solution* 


##  Global Scope And Request Scope

There are two kinds of scopes in KJservlet. One is the global scope, which would be initialized after the servlet loaded. Some inner script and the most important global script -- `gloabl.js` -- would be run at this time. 

The other scope is the request scope. When a request is come, the servlet will call dispatch method of the singleton KJServletRuntime. The dispatch method will compute the route, find the controller js, and then run it in a new scope.  

Then, there is a little trick here. After the controller script loaded, the controller function itself will run in the global scope. So your controller functions have the ability to access the objects and functions in both scope. That means outside the controller function and the functions it calls, you cannot use the objects and functions that defined in `global.js`.

While in the websocket connections, every session will all run in one scope, which will be started before `onOpen` callback, and ended after `onClose` callback.

### The `global.js` file
The `global.js` is the file for you to affect the global scope, this file is located at the class path's root folder, and must have the name `global.js`.   You are allowed to import script files here, but unlike the controller script files, you have to put all of your global files under the class path and its sub-folder, and all your global files must use the ".js" suffix. 

As this file runs only once when the runtime environment initializing, so it is recommended that all the objects that used by all (or at lease most) of the controller's function should be put here, just like the database connection pool object, some of your own configurations just like the AWS's access key and access secret. 

The most common configuration you would use here is the $webapp, which affects your routes, the location of your controller scripts, the MVC resolver, and the interceptors, all of which have already discussed in above chapters.

## Other Object That Provided
We provide some objects to simplify your coding. And more and more plugins are coming. 

### The `$db` Object
You can use `imports("$db");` to import this object to both of your scope context. But it's recommended that you should import it into your global scope, and configure you connection there.

All the dependencies won't be imported to the project automatically, so when you use this object, just handle your own dependency in your `pom.xml`. 
```xml
    <!-- If you are using mysql -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>5.1.43</version>
    </dependency>
    <!-- If you are using druid connection pool -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid</artifactId>
        <version>1.1.2</version>
    </dependency>
``` 

If you want to use it in a very simple way, just use: 
```javascript
    // Although you should put the import the $db file in your global.js, but every connection has its own life style, so the following code should put to your controller function. 
    var conn = $db.connect("jdbc:mysql://127.0.0.1:3306/db", "username", "password");
``` 
But as we talked above, we don't want to scatter all the url, username, password everywhere in the code. So the following solution is a better way.
```javascript
    // This should be put to your `global.js`
    $db.addDatasource("default", {
        url : "jdbc:mysql://127.0.0.1:3306/kjtest",
        user : "username",
        password : "password"
    }); 
    // and in your controller function, you can use this
    var con = $db.connect("default");
    // because the datasource name is "default", you can ignore that argument when getting the connection:
    var con = $db.connect(); 
```

*Notice! This method only supports MySql and its variant, MariaDB, and you must handle the mysql driver dependency in your pom.xml.*

If you are not using mysql, or if you want to use some connection pool, you use this:
```javascript
    // If you use the Druid connection pool, put this to your `global.js`
    $db.addDatasource("druid", "com.alibaba.druid.pool.DruidDataSource", {
        url : "jdbc:mysql://127.0.0.1:3306/kjtest",
        username : "username",
        password : "password",
        filters : "stat",
        maxActive : 20,
        initialSize : 1,
        maxWait : 60000,
        minIdel : 1,
        timeBetweenEvictionRunsMillis : 60000,
        minEvictableIdleTimeMillis : 30000,
        testWhileIdle : true,
        testOnBorrow : false,
        testOnReturn : false,
        poolPreparedStatements : true,
        maxOpenPreparedStatements : 20
    }).init(); // Not every datasouce has this init method, please check before you write this.
    // Then in your controller function
    var conn = $db.connect("druid");
```

**The Connection Object** 

After you get the connection object, you can use **select, insert, update, delete** to do your business. 
* **conn.select(sql [, params][, firstResult[,maxResult]])**, this method will return a object array, each of the object contains one row of the result. If your table `User` like:

id | userName | userEmail | sex
------ | ------ | ------ | ------
1 | John | john@abc.com | male
2 | Mike | mike@abc.com | male
3 | Mary | mary@abc.com | female

And in your code
```javascript
    var conn = $db.connect("druid");
    var result = conn.select("select * from User where sex = ?", [ "male" ]); // If the second argument is the parameter array, its length must equal the counting of '?' in the previous string argument which is the SQL sentence.
    print(JSON.stringify(result);
```
Then you will find the output will be:
```javascript
[ 
    {"id": 1, "userName": "John", "userEmail": "john@abc.com", "sex": "male"}, 
    {"id": 2, "userName": "Mike", "userEmail": "mike@abc.com", "sex": "male"}
]
```

* **conn.insert(tableName, object || object-array)**, insert one or more object to the database, the object's properties must match the columns of this table. If want to update insert a list, please make sure that all the objects in that list has the same properties.
```javascript
    var conn = $db.connect();  // A data source named "default" is present.
    // Insert a new row to the table.
    // The result updateCount to shows how many rows have been inserted. 
    var updateCount = conn.insert("User", {
        "userName" : "Ben",
        "userEmail" : "ben@xyz.com",
        "sex" : "male"
    });
    // Insert several rows to the table
    conn.insert("User", [{
        "userName" : "Ben",
        "userEmail" : "ben@xyz.com",
        "sex" : "male"
    }, {
        "userName" : "Kate",
        "userEmail" : "kate@xyz.com",
        "sex" : "female"
    }]);
```

* **conn.update(tableName, object || object-array[, whereQuery[, queryPrameters]])**,  update a table by given object or object array. If where query sql passed, will update via that condition, or the `id` property in the objects will use. 
```javascript
    var conn = $db.connect();  // A data source named "default" is present.
    // The following sentence will update the row with the id equals 2 in the table `User`, 
    // because column `sex` hasn't passed, it will keep its old value. 
    // The result updateCount to shows how many rows have been changed. 
    var updateCount = conn.update("User", {
        "id" : 2,
        "userName" : "Michael",
        "userEmail" : "mike@bcd.com"
    });
    // Update several rows and ignore the result
    conn.update("User", [ {
        "id" : 2,
        "userName" : "Michael",
        "userEmail" : "mike@bcd.com"
    }, {
        "id" : 3,
        "userName" : "Maria",
        "userEmail" : "mary@bcd.com"
    }]);
	// Update via sql query condition
    conn.update("User", {
        "userName" : "Maria",
        "userEmail" : "mary@xyz.com"
    }, "where sex = ?", [ "female" ]);    
```

* **conn.delete(tableName, id || idArray[, idColumnName])**, delete rows via id, you can specify the id column name. 
```javascript
    var conn = $db.connect();  // A data source named "default" is present.
    // Delete the row with id equals 1
    conn.delete("User", 1);
    // Delete tow rows
    conn.delete("User", [ 1, 2 ]);
    // If your primary key is not `id`, but `pk`
    conn.delete("User", [ 1, 2 ], "pk");
```

* **conn.del(tableName, whereSql [, parameters])**, delete rows via the give query conditions. 
```javascript
    var conn = $db.connect();  // A data source named "default" is present.
    // delete all the rows with sex equals `male`
    conn.del("User", "where sex = ?", ["male"]);
```

* **conn.execute(sql [, parameters])**, if you want to execute a complicated sql, use this method to do it.
```javascript
    var conn = $db.connect();  // A data source named "default" is present.
    conn.excute("update table `User` set `name` = ? where id in (select id....)", ['John', ...]);
```

**Caching and AutoCommit**

All connections here will do the caching and auto-commit. 

With the caching, every query will be cached to the connection object, and if you query that again, the result in the cache will be returned. If you don't want caching, you can specify it in the $db object `$db.cache = false` in your `global.js`, or in the connection object to disable only one connection `conn.cache = false`. 

If you want the auto-commit off, set it in the connection object: `conn.autoCommit = false`, then you can use `conn.commit()` and `conn.rollback()` to commit,or roll back.

### The `$log` Object
KJServlet provides a simple logger for you to record your messages. By default, it use only the system standard output stream. All of its methods are:

* **$log.d(tag, message, error)**, log a debug message, `error` is a optional parameter. 
* **$log.i(tag, message, error)**, log a info message, `error` is a optional parameter.
* **$log.w(tag, message, error)**, log a warn message, `error` is a optional parameter.
* **$log.e(tag, message, error)**, log a error message, `error` is a optional parameter.
* **$log.f(tag, message, error)**, log a fatal message, `error` is a optional parameter.

The default log level is "info", that means if you use `$log.d(tag, message)`, there will be no log shows in the console. Please set the debug level in the `global.js`
```javascript
$log.level = "debug";
```

We also support log4j logger, if you want to use it, replace the default `$log` object in the `global.js`:
```javascript
$log = $logFac.getLogger("log4j");
```
The interface of the log4j logger is just as the same as the default logger. However, the $log.level will not work, and you have to create a log4j.properties to handle where and how the messages being logged. (Please read the log4j user guids for more information).

You should also handle the dependency yourself, in your `pom.xml`, you should add this dependency:
```xml
    <dependency>
        <groupId>log4j</groupId>
        <artifactId>log4j</artifactId>
        <version>1.2.17</version>
    </dependency>
```
## Multi-Thread Safety
Nashorn is not multi-thread safe, and for some complicated reason, it seems that Nashorn developer team will not add this feature in a short time.
 
*Please check this https://blogs.oracle.com/nashorn/nashorn-multithreading-and-mt-safety*
 
But KJServlet is run in a J2EE web container, it will start new threads when request coming. Follow the suggestion in the above article, we create new context for every request, that makes the KJServlet multi-thread safe. 

However, sometimes we have to share your own data, how should we do than. For this purpose, we provide a global `$MTSGlobal` object. It is a sub-class of Java ConcurrentHashMap object, which is a multi-thread safe implementation of the Map interface. If you really want to share data via threads, define your sharing model in your `global.js`
```javascript
var mySharingData = $MTSGlobal.allocate();
``` 
Then use `put(key, value)`, `get(key)`, `remove(key)` methods to handle your sharing data.  