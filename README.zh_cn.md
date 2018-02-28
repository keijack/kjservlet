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

#### Request 对象的完整属性和方法（命名为 req）
* **req.oriRequest**，原始的 HttpServletRequest Java 对象.  
* **req.session**，通过原始的 request.getSession() 获取的 HttpSession Java 对象。
* **req.authType**，通过原始的 request.getAuthType()获取的字符串对象。
* **req.method**，通过原始的 request.getMethod()获取的字符串对象。
* **req.contentLength**，通过原始的 request.getContentLength()获取的long对象，标识请求内容的字节数。
* **req.contentType**，通过原始的 request.getContentType()获取的字符串对象，标识请求内容的类型。
* **req.queryString**，通过原始的 request.getQueryString()获取的字符串对象，是你访问地址 "?" 后面的内容。
* **req.protocol**，通过原始的 request.getProtocol()获取的字符串对象，是本次访问的协议。
* **req.schema**，通过原始的 request.getSchema()获取的字符串对象，是本次访问的协议，可能是“http”或者是“https”。
* **req.serverName**，服务器名，通过原始的 request.getServerName() 获取的字符串对象。
* **req.serverPort**，服务器端口，通过原始的 request.getServerPort() 获取的数字对象。
* **req.contextPath**，上下文，通过原始的 request.getContextPath() 获取的字符串对象。;
* **req.requestURI**，请求资源地址，不包含协议，地址，端口，访问参数等信息，包含当前上下文地址. 通过原始的  request's getRequestURI() 获取的字符串对象。
* **req.requestUri**，`req.requestURI`的别名。
* **req.uri**，`req.requestURI`的别名。
* **req.ctxUri**，不带上下文地址的资源请求地址.
* **req.servletPath**，当前 servlet 的路径，通过原始的 request's getServletPaht() 获得的字符串对象。
* **req.requestURL**，请求地址，整个访问地址`?`前的一段，通过原始的 request's getRequestURL() 获取，已经通过 toString() 方法转成字符串对象。
* **req.requestUrl**，`req.requestURL`的别名。
* **req.url**，`req.requestURL`的别名。
* **req.headers**，请求头部，通过原始封装 request's getHeader(name) 方法生成的 JSON 对象。如， `req.headers["user-agent"]`可以获得头部的`user-agen`数据。
* **req.header**，`req.headers`的别名。
* **req.parameterValues**，请求参数，包含了有URL的`?`后的通过字符串传递的部分和当 conten-type 是`application/x-www-form-urlencoded` 或者 `multipart/form-data` 时请求体里的部分。该参数总是返回一个数组（即使该数组里只有一个元素）。如果这时一个`multipart/form-data`请求，并且该请求包含上传文件，那么文件参数会被解析为以下的JSON对象：
```javascript
{
    "filename": "somePicture.jpg", // the file's name
    "contentType": "image/jpg", // the content type
    "content": "xxxxxx" // a string that get from the multipart content, 
                        // you can use getBytes() method to get the byte array, 
                        // and write it into a file.
}
```
* **req.parameterValue**，`req.parameterValues`的别名。
* **req.paramVals**，`req.parameterValues`的别名。
* **req.parameters**，类似`req.parameterValues`，但只返回一个值，再有多个同名的请求参数时，返回第一个。
* **req.parameter**，`req.parameters`的别名。
* **req.params**，`req.parameters`的别名。
* **req.param**，`req.parameters`的别名。
* **req.pathValues**，路径参数，详细的内容请参考`路径参数`章节。
* **req.pathValue**，`req.pathValues`的别名。
* **req.setAttribute(name, val)**，原始 request 的 setAttribute(name, value) 方法的封装。
* **req.setAttr(name, val)**，`req.setAttribute(name, val)` 的别名。
* **req.getAttribute(name, defaultValue)**，原始 request's getAttribute(name) 方法的封装，不同的是增加了默认参数，如果原方法返回 null 值，这个方法返回指定的默认值。
* **req.getAttr(name, defaultValue)**，`req.getAttribute(name, defaultValue)`的别名。
* **req.removeAttribute(name)**，原始request's removeAttribute(name) 方法的封装。
* **req.removeAttr(name)**，`req.removeAttribute(name)`的别名。
* **req.rmAttr(name)**，`req.removeAttribute(name)`的别名。
* **req.readRequestBody()**，返回请求体，如题 content-type 是 `application/x-www-form-urlencoded` 的话，该方法返回 null。
* **req.data**，如果请求的 content-type 是 `application/json`的话，该参数是通过 JSON.parse(req.readRequestBody) 转成的 JSON 对象。

#### Response 对象的完整属性和方法（命名为 res）
* **res.oriResponse**，原始的 HttpServletResponse Java 对象。
* **res.contentType**，标识当前返回体的内容类型，通过原始的 response 的 setContentType(contentType) 方法进行设值。
* **res.headers**，返回体对象的头部参数，是一个JSON对象，会通过原始的 response 的 addHeader(name, value) 方法将该对象中的数据加到返回体中。 
* **res.header**，`res.headers`的别名。
* **res.addHeader(name, value)**，原始的 response 的 addHeader(name, value) 方法的封装。
* **res.setHeader(name, value)**，原始的 response 的 setHeader(name, value) 方法的封装。
* **res.sendError(code, message)**，原始的 response 的 sendError(code, message) 方法的封装，其中第二个参数`message`为可选参数。
* **res.redirect(url)**，原始的 response 的 sendRedirect(url) 方法的封装。
* **res.write(data)**, 将数据写入 response 的输出流中。`data` 参数可以为 JSON 对象，该方法会自动将 JSON 转为字符串写入输出流。 
* **res.writeByte(bytes)**, 只接受 Java 的 `byte[]` 类型的参数，使用原始 response 的 getOutputStream().write(bytes) 方法写数据到输出流中; *使用该方法，程序会自动生成头部数据中的`Content-Length`参数。*

### 另一种响应方式
在此章节，将描述另一种响应的方式，你无须使用`response`对象，仅通过方法返回值，就能使得请求获得正确的响应。

正如你在**快速开始**章节所见，你根本无须使用`response`对象，而直接通过返回 JSON 对象、字符串等数据来进行响应请求。框架将会使用合适的响应方式来处理这些数据。

从原理上来说，如果方法返回的是一个符合格式的 JSON 数据，框架会自动进行响应的处理。而在编码过程中，我们并不需要知道具体的该 JSON 对象的结构，你只需使用框架提供的全局对象 `$renderer`来处理你的数据就个可以。

`$renderer` 对象的方法如下：:
* **$renderer.render(contentType, content, headers)**，生成一个自定义内容类型的结构化 JSON 对象。其中，如果你的`contentType`参数传入的是`null`、空字符串、`false`，框架会根据你传入的参数来判断你的响应类型是什么；`content`参数仅接受 string 类型；`headers`参数是可选的，该参数的类型应为一个 JSON 对象，所有该对象中的数据都会用原始的response 的 addHeader(name, value) 方法写入响应头部。.
* **$renderer.text(text, headers)**，生成一个内容类型为 "text/plain"的结构化 JSON；`headers`参数为可选。 
* **$renderer.html(data, headers)**，生成一个内容类型为 "text/html"的结构化 JSON；`headers`参数为可选。 
* **$renderer.json(data, headers)**，生成一个内容类型为 "application/json"的结构化 JSON，其中参数`data`应为一个 JSON 对象；`headers`参数为可选。.
* **$renderer.bytes(data, headers)**，`data`应为 Java 的 `byte[]`对象，`headers`参数为可选。框架将使用原始 response 的 getOutputStream().write(bytes)将数据写入响应体。
* **$renderer.redirect(url, headers)**, 生成重定向到指定 url的结构化JSON，其中`headers`参数为可选。 
* **$renderer.forward(url, data, headers)**，生成一个转发请求到指定的 url的结构化JSON，`data`参数为可选，如果传入该对象，框架将调用原始的 request.addAttruibute(name, value) 方法将数据写入请求；`headers`参数亦为可选参数。
* **$renderer.error(code, message)**，生成一个发送错误编码的结构化JSON，其中`message`参数为可选。
* **$renderer.view(viewFileLocation, data, headers)**, 生成一个供框架 MVC 特性使用的结构化 JSON，框架 MVC 特性在后续章节叙述。

以下是使用`$renderer`对象的例子，使用了该对象，你的代码风格大概如下：
```javascript
function dosth(req){
	var param = req.parameters;
	var serviceResult = someServiceObject.doService(param);
	return $renderer.json(serviceResult);
}
```
事实上，在大部分情况下，`$renderer`对象都不是必须显示编写的，你可以直接返回你的业务对象，框架会对这些对象进行自动适配：
```javascript
function dosth(req){
	var param = req.parameters;
	var serviceResult = someServiceObject.doService(param);
	return serviceResult; // 该返回值为一个 JSON 对象
}
```
你还可以返回类似如下架构的数据：
```javascript
    return "<!DOCTYPE html><html>....</html>"; // 会响应为 "text/html"。
```
```javascript
    return "<?xml version="1.0" encoding="UTF-8"?><tag>...</tag>"; // 会响应为 "text/xml"。
```
```javascript
    return "redirect:/url"; // 会重定向至 /url
```
```javascript
    return "forward:/url"; // 会转发至 /url
```
```javascript
    return "some text"; // 会响应为 "text/plain" 
```

## MVC
MVC 是一个非常常见的设计模式，该设计模式的主要原则在于分层，将代码分为逻辑层（Model）、控制层（Controller）和展示层（View）。代码分层的好处在于解耦，使得代码易读和更好维护。  

网站开发者都喜欢使用 MVC 模式，特别是 Java Web 的开发者，也因此，用 Java 语言提供的模板引擎特别多。得益于此，在我们的框架中使用 MVC 模式也变得非常的容易。
 
KJServlet 支持 JSP、Freemarker 和 Velocity 模板引擎用做 View 层。 

正如上章所见，你需要使用 $renderer.view 方法来使用 MVC 模式，参考例子如下：
```javascript
function dosth(req){
    var param = req.parameters;
	var serviceResult = someServiceObject.doService(param);
	return $renderer.view("/WEB-INF/pages/view.jsp", serviceResult); // serviceResult 为 JSON 对象
}
```
框架默认使用 JSP 作为模板引擎，不会你可以在`global.js` 文件中的 `$webapp` 对象中自定义自己的模板引擎，例子如下： 
```javascript
$webapp = {
    controller : {
        fileHome : "classpath:/org/keijack/kjservlet/demo/controller", // 你的 controller 方法的路径，默认为 "classpath:"
        fileSuffix : ".js", // 你的 controller 文件的后缀，默认为 ".js" 
        suffix : "", // 你 controller 请求的后缀，默认为 ""
    },
    resources : [ "*.html", "/images/*" ],
    view : {
        resolver : "jsp", // 模板引擎类型，可为"jsp"、"freemarker"或"velocity"
        prefix : "/WEB-INF/pages/", // view 文件路径的前缀。
        suffix : ".jsp", // view 文件路径后缀。
    }, 
}
```
如果你在 `global.js`中配置了以上参数，你的 controller 方法将会简化为：
```javascript
function dosth(req){
    var param = req.parameters;
	var serviceResult = someServiceObject.doService(param);
	return $renderer.view("view", serviceResult); // 模板文件将为 /WEB-INF/pages/view.jsp 
}
```
*注意！如果你使用 freemarker 或者 volocity 模板引擎，你需要自己增加这些引擎的依赖。如果你使用  maven 和 freemarker，你需要在你的 `pom.xml`中加入以下的依赖配置*
```xml
    <dependency>
        <groupId>org.freemarker</groupId>
        <artifactId>freemarker</artifactId>
        <version>2.3.26-incubating</version>
    </dependency>
```
在 **$renderer.view(templateFileLocation, data, header)** 中的第二个参数`data`应该是一个 JSON 对象，框架会将该 JSON 对象转换成一个 Java Map 对象然后再传递到你的模板引擎中，因此，在你的模板引擎中，你可以使用 Map 的方式来在使用该对象。 

假设你的`data`对象如下：
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
在你的模板文件中 -- 以 freemarker 为例 -- 可以这样来使用：
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
再`data`对象中，你还可以使用对象方法/函数，再模板引擎中，你需要使用 `call` 或者 `apply` 使用这些方法。

*注意！`call`方法能够接收最多10 个参数。而 `apply` 总是接受一个数据对象总为参数。*  

假设你的`data`对象如下： 
```javascript
    var data = {"userName": "Jhon",
                "sex": "male",
                "isAdult": function(){
                	// 注意：再这个方法中不要使用 `this`因为最终，这些方法会封装为一个 Java 对象。 
                	return data.age >= 18;
                },
                "age": 28,
                "department": { "name": "HR",
                                "phone": "+01xxxxxx",
                },
                "subordinates": ["Mike", "Lily"]
    };
```

*注意！不要再`data`对象的方法中使用 `this`，因为最终这些方法会被封装为一个 Java 对象 `JSFunctionWrapper`，因此`this`的指向并不是当前的 JSON 对象。*

那么，再你的模板文件中，你可以如下调用该方法：
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
 
如果你认为以上3个模板引擎都不适用，你甚至可以自定义你自己的模板引擎：
```javascript
$webapp = {
    controller : {
        fileHome : "classpath:/org/keijack/kjservlet/demo/controller", 
        fileSuffix : ".js",  
        suffix : "", 
    },
    resources : [ "*.html", "/images/*" ],
    view : {
        resolver : function(viewFileLocation, data, headers){
            // viewFileLocation 已经拼装好以下配置中的 prefix 和suffix。
            // 生成最终的 View 层渲染的 html 字符串
            var html = ...;
            // 最后通过 $renderer 返回一个结构化的对象。
            return $renderer.html(html, headers); 
        },
        prefix : "/WEB-INF/pages/", 
        suffix : ".jsp", 
    }, 
}
```
## 标注和面向切面编程（AOP）
Javascript 不像 Java 一样具有内置的标注体系，并且，Javascript 的对象生成方式和 Java 有非常大的区别，你甚至无须使用 new 便可以定义对象，所以在 Javascript 中，其实很难如 Java 一样做到面向切面编程。然而，通过一些小把戏，我们还是勉强做了一些面向切面的内容。 
  
如果你熟悉 Javascript，你必然对 **strict mode**有所耳闻。如果你向希望一个方法使用 strict mode 来执行，你需要在你的方法开始时加入一行 "use strict"，我们的 AOP 灵感也时来源于此。请参考以下代码： 
```javascript
function dosth(req){
    "use strict";
    "@post"; // KJSeverlet 内置的标注，该方法只接受 POST 类型的请求。
    "@myOwnAnno"; // 用户自定义的标注
    // 你的逻辑代码
    ...
    "@Anno2"; // 如果你的标注放在逻辑体里，该标注不会被框架读取。    
    ...
}
```
在以上的例子中，你获得的标注将是 ["@post", "@myOwnAnno"]。 

*注意！标注仅仅在 Controller 方法中生效!*

我们已经知道如何进行标注了，那么如何使用这些标注呢？我们回到在`global.js`文件中的`$webapp`对象中来：
```javascript
$webapp = {
    controller : {
        fileHome : "classpath:/org/keijack/kjservlet/demo/controller", 
        fileSuffix : ".js",  
        suffix : "", 
    },
    resources : [ "*.html", "/images/*" ],
    view : {
        resolver : "jsp", 
        prefix : "/WEB-INF/pages/", 
        suffix : ".jsp", 
    },
    interceptors : {
        intercept : "@myOwnAnno", // 如果你对多个标准进行相同的切面，该参数可以传入一个数组
        // intercept: ["@myOwnAnno1", "@MyOwnAnno2"],
        before : function(req, res, ctx) {
            // controller 方法之前执行的代码
            return true; // 如果希望方法继续执行，你必须返回 true，如果返回 false，那么，controller 方法将被终止，不再执行。
        },
        after : function(req, res, result, ctx) {
            // controller 方法执行之后执行的代码。
        },
        onError : function(req, res, error, ctx) {
            // controller 方法抛出异常时执行的代码。
        } 
    },  // 如果你有多个切面，请传入一个数组
    // interceptors: [ {intercept: "@myOwnAnno1" , before: function(req, res){}} , {intercept: "myAnno2", after: function(req, res){}}],
}
```

再上述方法中，你会看到一个 `ctx` 对象，该对象最终会设入到你的请求范围中，再你的 controller 方法中，你可以通过 全局的`$context` 来访问同一个对象。

举个例子，通过这个方法，你可以非常容易地实现在一个请求中使用同一个数据库会话，只有在业务执行成功之后才会提交，如果抛出异常，你可以回滚所有的操作。  （关于数据库对象`$db`，我们将在后续章节进行详细说明）
```javascript
// 在 global.js 中，你可以如此定义
$webapp = {
    ...
    interceptors :  {
        intercept : "@transaction", 
        before : function(req, res, ctx) {
            ctx.conn = $db.connect(); // 使用名为 "default" 的数据源
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
function ctrlFun(req){
    "@transaction";
    $context.conn.insert("TableName", {...});
}
```

框架中有内置了一些标注，为 **"@get", "@head", "@post", "@put", "@delete", "@connect", "@options", "@trace", "@patch"**，正如你所见，这些标注事实上时 HTTP请求的方法，如果你使用了一个或者多个这些标注，当年的请求的方法不存在于你的选择的标注中时，框架会直接返回404错误。

## 事件
Javascript 程序员可能会非常常用面向事件的编码方式，但是，这个框架运行在 J2EE 环境下，在这个环境下，事件的支持非常弱。

不过，我们也尝试着支持一些面向事件的方式来编写代码。我们在 请求的范围中提供了一个全局的对象 `$event`，具体的用法请参考：
```javascript
/**
 * 注册一个监听者，监听名为"eventName" 的事件
 **/
var listener = $event.on("eventName", function(data) {
	// 这些代码会在接收到事件 "eventName" 时执行。
});

/**
 * 这个监听者不再监听事件。 
 **/
listener.off();
/**
 * 也可以使用该方法取消监听，效果和上述方法一致。
 **/
$event.remove(listener);

/**
 * 取消整个事件，删除所有该事件的监听者。
 **/
$event.off("eventName");

/**
 * 发布一个事件，该事件发布之后，所有的监听者收到事件之后会执行相关的代码。
 **/
$event.publish("eventName", data);
```
*注意！事件仅在请求范围支持，这意味着你不能再`global.js` 和它引入的文件中使用该参数. *

## Websocket
### 配置
要使用 websocket，你需要再你的 `global.js`中，增加一个`$websocket`的变量定义：
```javascript
$websocket = {
    fileHome : "classpath:", // 处理 websocket 的 js 文件的存储路径，默认情况下时 "classpath:"。
    fileExtension : ".js", // 处理 websocket 的 js 文件的后缀，默认为 "js"。
    endpoints : [
        {
            endpoint : "/ws/echo/{pathValue0}/{pathValue1}", // 你的 websocket 链接的地址。 
            handler : "/ws/echo/echo.upper", // 你的文件路径和处理对象。此例子中，处理 websocket 的对象时处于 classpath:/ws/echo.js 中，其是 echo 对象的一个子对象 upper。  
            onHandShake : function(conf, request, response) { // 该方法是可选方法
            	// 你的代码，再握手时执行的代码，注意：本方法中，conf、request、response 均为 Java 对象。 
            }
        },
        "/ws/chatRoom/checkin", // 简单的方式，对握手不做处理，endpoint 的路径与处理类一致。处理对象位于 classpath:/ws/chatRoom.js 中，其命名为 checkin。
    ]
}
``` 
在上述的配置例子中，你的处理 websocket 的代码处于 Java 的 classpath 中，大部分情况下为`/WEB-INF/classes`下，而这些文件的后缀为".js"。

在上述例子中，注册了两个 endpoint。其中第一个 endpoint，当你使用websocket客户端访问时，访问的地址时：`ws://[服务器域名]:[服务器端口]/[webapp上下文]/ws/echo/pv0/pv1`，而处理文件则时处于 `classpaht:/ws`路径下的 `echo.js` 文件。在这个文件中，应该有以下的对象：
```javascript
var echo = {
	upper : {
		onOpen : function(session, conf) {
			// 打开 websocket 时执行的代码
		}, 
		onMessage : function(session, message) {
			// 接收到 消息时的代码
		},
		onClose : function(session, closeReason) {
			// 关闭 websocket 时的代码
		}, 
		onError : function(session, throwable) {
			// 执行异常时执行的代码
		}
	}
}
```
上述第二个 endpoint， 当你使用websocket客户端访问时，访问的地址时：`ws://[服务器域名]:[服务器端口]/[webapp上下文]/ws/chatRoom/checkin`，其处理文件则位于`classpaht:/ws`路径下的 `chatRoom.js` 文件。在这个文件中，应该有一个对象`checkin`，其结构如例子以中的 `echo.upper`。
### 处理对象的方法  
处理对象应包含以下4个方法中至少一个方法。
* **onOpen(session, conf)**，该方法在 websocket 会话打开时调用，其中`session`是一个经过封装的 JSON 对象，而`conf`是一个未经封装的 Java 对象，该对象和 `onHandShake`中的`conf`对象是同以对象。
* **onMessage(session, message)**，当收到客户端发送消息时调用，`session`对象和 `onOpen`中的`session`对象为同一对象，`message`参数时客户端发送到服务端的文本。
* **onClose(session, closeReason)**，当会话关闭时调用，`session`对象和 `onOpen`中的`session`对象为同一对象，`closeReason` 时 J2EE 源生的 Java CloseReason 对象，未做封装。
* **onError(session, throwable)**，当异常发生时调用，`session`对象和 `onOpen`中的`session`对象为同一对象， `throwable` 业务逻辑抛出的异常，为 Java 对象。

这四个方法都是可选方法，你可以选择实现你需要的方法，但如果一个方法都没有，你的 websocket 也就没有意义了吧。

### `session` 对象的属性和方法
* **session.oriSession**，原始的 Session Java 对象。
* **session.id**，本次会话 id。
* **session.sessionId**，`session.id`的别称。
* **session.getId()**，该方法返回`session.id`。
* **session.sendText(text, isLast)**，向客户端发送文本，其中`isLast`可选的，如果你传入了`isLast`参数，并且该参数时`false`，那么session将不会马上发送这些文本，而是等到该参数传入`true`时统一发送。
* **session.sendPing(pingMsg)**，发送一个 ping 消息。 
* **session.sendPong(pongMsg)**，发送一个 pong 消息。
* **session.sendBytes(bytes)**，发送一个 Java byte 数组，如果 `bytes` 参数不是 `byte[]` 对象，该方法将不会做任何事情。
* **session.sendBinary(binary)**，发送二进制数据，`binary` 必须为 Java 的 `java.nio.ByteBuffer`对象，否则，该方法将不会做任何事情。
* **session.sendJSON(jsonObject)**，发送一个 JSON 对象，该对象会转成 字符串发送。 
* **session.sendJson(jsonObject)**，`session.sendJSON(jsonObject)`的别称。
* **session.sendJavaObject(javaObject)**，发送一个 Java 对象。
* **session.send(data)**，本方法会根据传入的对象的类型选择上述方法中合适的一个进行发送。
* **session.uri**，websocket 链接请求的 uri。
* **session.requestURI**，`session.uri`的别称。
* **session.pathValues**，路径参数，在你的 endpoint 中使用 `{}` 配置的参数。 
* **session.pathValue**，`session.pathValues`的别称。
* **session.pathVals**，`session.pathValues`的别称。
* **session.pathVal**，`session.pathValues`的别称。
* **session.pathValue**，`session.pathValues`的别称。
* **session.pathParameters**，`session.pathValues`的别称。
* **session.pathParams**，`session.pathValues`的别称。
* **session.pathParam**，`session.pathValues`的别称。
* **session.queryString**，请求参数，跟在uri `?` 后面的字符串。
* **session.parameterValues**，同 request 的方法，来源于 queryString，本方法总是返回一个数组。 
* **session.paramValues**，`session.parameterValues`的别称。
* **session.paramVals**，`session.parameterValues`的别称。
* **session.requestParameterMap**，`session.parameterValues`的别称。
* **session.parameters**，类似`session.parameterValues`，但值总是为一个参数，如果存在多个参数，则返回第一个。

*你可能需要将该 session 对象存储到全局范围内以在别的请求线程中使用该对象发送消息给客户端，然而，由于 Narson 本身并不是线程安全的，所以如果需要进行线程安全的存储该对象，可以参考`线程安全`章节。* 


##  全局范围和请求范围
在 KJServlet 框架中，有两中范围，一种时全局范围，该范围在 Servlet 加载的时候就会被初始化，在这个范围中，除了一些内置的 script 外，作为本框架最重要的`global.js`也在本阶段执行。 

另一个范围是请求范围，当一个请求访问服务器时，servlet 会分发该请求到 KJServletRuntime，这是一个单例。这个运行时会计算该请求的路由，找到正确的控制器的 js 文件和方法，并且创建一个新的范围并且在该范围中运行控制器的代码。  

那在全局范围的变量和请求范围的变量是如何进行相互访问的呢？这里我们玩了点小把戏。虽然，包含控制方法的文件是运行在请求范围中的，因此，控制方法的初始化是在请求范围中执行的，但是，控制方法本身却是在全局范围中执行的。也因此，控制方法可以同时访问请求范围和全局范围中的变量。也因为如此，除了控制方法和它所调用到方法之外，其他定义在与该方法同一个文件中的方法是不可以访问到全局范围中的变量的。

而在 websocket 的实现中，每个 Session 会运行在一个范围中，其原理和请求范围一致，该范围在 `onOpen` 方法之前创建，并且在`onClose`方法执行后丢弃。

### 全局文件 `global.js` e
全局文件`global.js` 是你可以在对定义全局变量和方法的唯一入口。这个文件仅允许放在`classpath`目录底下，是一个固定名字的文件。你可以通过`imports`方法来引入其他的文件。但是和你可以定义存储路径和后缀名的 controller 文件不同，这些全局的文件只能放在`classpath`目录或者其子目录下，并且必须以".js"为后缀名。

由于这个文件在运行环境初始化时运行一次，因此，一些公用的对象和逻辑也建议放在这个文件中，例如数据库连接池对象、你的一些全局配置，例如AWS的 accessKey和accessSecret等内容。

其中，最常见的全局变量便是 `$webapp`，该对象的配置会直接影响到你的路由、你controller 文件的位置、MVC 的解析器和 AOP 的切面逻辑。这些内容请参考上述相关的章节。

## 其他由框架提供的对象
我们提供了一些非常有用的插件，并且，更多的插件正在编写当中。 

### 数据库访问对象`$db` 
你可以通过`imports("$db");`来引入该对象，你可以在全局范围或者请求范围中引入该对象，但是由于数据库的创建和销毁都是重操作，因此大部分情况下，我们都会在`global.js`中引入该对象。

All the dependencies won't be imported to the project automatically, so when you use this object, just handle your own dependency in your `pom.xml`. 
该对象会使用到一些额外的依赖，这些并没有在原始的 jar 包中引入，因此你需要自己处理这些依赖，如果你使用 maven，你可以在你的`pom.xml`中加入以下依赖配置：
```xml
    <!-- 如果你使用mysql，如果不是请配置相关的 jdbc 链接库 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>5.1.43</version>
    </dependency>
    <!-- 如果你使用到 druid 连接池，你也可以选用其他的连接池。 -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid</artifactId>
        <version>1.1.2</version>
    </dependency>
``` 

以下例子时最简单的用法 
```javascript
    // 虽然你会在全局范围中引入 $db 对象，但是由于每个链接都有自己的生命周期，因此，以下链接代码你应该放在你的 controller 方法中。 
    var conn = $db.connect("jdbc:mysql://127.0.0.1:3306/db", "username", "password");
``` 
如上述所属说，我们并不想将数据库的配置非常零散的放在各个 controller 文件中，因此我们可以通过以下增加数据源的方式将这些配置放在`global.js`中。
```javascript
    // 以下配置应该安放在你的全局文件 `global.js`中
    $db.addDatasource("default", {
        url : "jdbc:mysql://127.0.0.1:3306/kjtest",
        user : "username",
        password : "password"
    }); 
    // 在你的 controller 方法中，你只需使用数据源的名字便能进行创捷连接。 
    var con = $db.connect("default");
    // 由于你的数据源名字为"default"，你甚至无须传入该名字便能创建连接。
    var con = $db.connect(); 
```

*注意！上述的增加数据源的方法仅支持 mysql和其变种 Mariadb！*

如果你不是使用 Mysql/MariaDB，或者你使用到连接池技术，你需要显式传入连接池的类名，如以下例子：
```javascript
    // 如果你用到 druid 连接池，那么你可以在你的 `global.js` 文件中增加以下配置。
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
    }).init(); // 并不是所有的连接池都由 init 方法，如果你使用别的连接池，你不需要调用 .init() 方法。
    // 之后，你可以在你的controller 方法中通过以下语句获得连接。
    var conn = $db.connect("druid");
```

**连接对象 conn** 
当你通过 `$db.connect()` 获取到连接对象之后，你可以使用该对象的 **select, insert, update, delete** 来处理你的业务。 
* **conn.select(sql [, params][, firstResult[,maxResult]])**，该方法会返回一个JSON数据，数组中的每个对象会映射一行数据库的数据，假设你有表`User`如下：

id | userName | userEmail | sex
------ | ------ | ------ | ------
1 | John | john@abc.com | male
2 | Mike | mike@abc.com | male
3 | Mary | mary@abc.com | female

在你的代码中，你可以使用该方法来查询，如下：
```javascript
    var conn = $db.connect("druid");
    var result = conn.select("select * from User where sex = ?", [ "male" ]); // 如果在第二个参数位置传入查询阐述，你传入参数的长度必须 sql 语句的占位符 ? 的数量一致。
    print(JSON.stringify(result);
```
以上的代码，你将会得到以下的数据：
```javascript
[ 
    {"id": 1, "userName": "John", "userEmail": "john@abc.com", "sex": "male"}, 
    {"id": 2, "userName": "Mike", "userEmail": "mike@abc.com", "sex": "male"}
]
```

* **conn.insert(tableName, object || object-array)**，插入一个或者多个对象到数据库中，对象的属性必须能与数据库相匹配。如果你传入的是一个数组，请保证数组里所有的对象都具有完全一致的数据。
```javascript
    var conn = $db.connect();  // 使用默认数据源。
    // 新增一行到数据库的 User 表中。 
    conn.insert("User", {
        "userName" : "Ben",
        "userEmail" : "ben@xyz.com",
        "sex" : "male"
    });
    // 插入多行数据到数据库 User 表中。
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

* **conn.update(tableName, object || object-array[, whereQuery[, queryPrameters]])**，更新指定数据库表的一行或者多行数据，如果查询条件语句没有传入，该方法会尝试更新对象中包含有的 `id` 和数据库匹配的字段。
```javascript
    var conn = $db.connect();  // 使用默认数据源。
    // 以下的方法会更新 `User` 中 id 等于 2 的一行数据, 
    // 由于没有传入 `sex` 列的值，该列的值不会被更新， 
    // 返回的 updateCount 显示更新的多少行数据。 
    var updateCount = conn.update("User", {
        "id" : 2,
        "userName" : "Michael",
        "userEmail" : "mike@bcd.com"
    });
    // 更新多行数据，请保证所有对象都有统一的字段。
    conn.update("User", [ {
        "id" : 2,
        "userName" : "Michael",
        "userEmail" : "mike@bcd.com"
    }, {
        "id" : 3,
        "userName" : "Maria",
        "userEmail" : "mary@bcd.com"
    }]);
	// 通过查询语句进行更新。
    conn.update("User", {
        "userName" : "Maria",
        "userEmail" : "mary@xyz.com"
    }, "where sex = ?", [ "female" ]);    
```

* **conn.delete(tableName, id || idArray[, idColumnName])**，按照主键来删除数据，你可以指定主键名，如果不指定，那么会使用`id`作为主键名。
```javascript
    var conn = $db.connect();  // 使用默认数据源。
    // 删除 id = 1 的行
    conn.delete("User", 1);
    // 删除 id = 2 和 id = 2 的行
    conn.delete("User", [ 1, 2 ]);
    // 本次删除中，主键的列名为 pk， 而不是 id。
    conn.delete("User", [ 1, 2 ], "pk");
```

* **conn.del(tableName, whereSql [, parameters])**，通过查询语句来删除。 
```javascript
    var conn = $db.connect();  // 使用默认数据源。
    // 删除所有性别为男性的用户
    conn.del("User", "where sex = ?", ["male"]);
```

* **conn.execute(sql [, parameters])**，如果你需要执行复杂的 sql 操作，你可以使用该方法来进行。
```javascript
    var conn = $db.connect();  // 使用默认数据源。
    conn.excute("update table `User` set `name` = ? where id in (select id....)", ['John', ...]);
```

**缓存和自动提交**

所有的连接在默认的情况下都会进行缓存和自动提交。 

在默认情况下，每次查询的结果均会存储在当前的连接对象中，如果下次有同样的查询，会直接从缓存返回。如果你不需要（理由可能是每次查询都不一样，而每次查询都缓存会占用较多内存），你可以在`global.js`中的`$db`对象中使用`$db.cache = false;` 进行全局配置，或者在连接对象进行本次连接配置`conn.cache = false;` 

如果你希望关闭自动提交，你可以在连接对象中进行设置：`conn.autoCommit = false`，做了该设置之后，你必须手动调用`conn.commit()`进行提交，或者`conn.rollback()`进行回滚。

### 日志对象 `$log`
KJServlet 提供了一个非常简单的日志对象，默认的情况下，该对象会将内容输入到 Java 的标准输出流中，其中全部的方法如下：

* **$log.d(tag, message, error)**，输出一个 debug 级别的日志，`error`是可选参数。 
* **$log.i(tag, message, error)**，输出一个 info 级别的日志，`error`是可选参数。
* **$log.w(tag, message, error)**，输出一个 warn 级别的日志，`error`是可选参数。
* **$log.e(tag, message, error)**，输出一个 error 级别的日志，`error`是可选参数。
* **$log.f(tag, message, error)**，输出一个 fatal 级别的日志，`error`是可选参数。

The default log level is "info", that means if you use `$log.d(tag, message)`, there will be no log shows in the console. Please set the debug level in the `global.js`
默认情况下，日志的级别为`info`，这意味着，不会输出`$log.d(tag, message)`的日志。你可以在 `global.js`中修改这个级别
```javascript
$log.level = "debug";
```

我们也支持 log4j，如果你希望使用 log4j，你需要替换掉全局的 `$log` 对象。你可以使用内置的`$logFac`来获取 log4j 的日志对象。在你的`global.js`中加入以下语句：
```javascript
$log = $logFac.getLogger("log4j");
```
log4j 日志对象的接口和默认的日志对象一致。但是，$log.level 将不会工作，你必须按照 log4j 的规范来创建你的 log4j.properties 来控制日志输出登记和日志输出的路径，请参考 log4j 的用户手册获取更多信息。

你还得自己处理 log4j 的相关依赖，如果你用 maven，在你的`pom.xml`中，你需要加入以下依赖配置：
```xml
    <dependency>
        <groupId>log4j</groupId>
        <artifactId>log4j</artifactId>
        <version>1.2.17</version>
    </dependency>
```
## 多线程安全
Nashorn 并不是多线程安全的，似乎多线程安全实现起来相当的复杂，所以似乎在短期之内，开发团队都不会支持多线程安全。
 
*请参考以下博文 https://blogs.oracle.com/nashorn/nashorn-multithreading-and-mt-safety*
 
但是 KJServlet 是运行在 J2EE 容器中的应用，在 J2EE 中，每次请求的处理都是多线程进行的，所以必须要实现线程安全。按照上述文章的提议，我们为每个请求都创建了一个上下文对象（请参考全局范围和请求范围），所以在这点上，KJServlet是线程安全的。 

但是，在很多业务中，我们可能会在不同的请求中使用到相同的数据，通常我们建议使用类似 Redis、数据库等方式来处理这些数据。但是如果你希望通过代码进行，我们提供了一个全局的`$MTSGlobal`对象，该对象是 Java ConcurrentHashMap 类的一个子类，这个类是一个线程安全的 Map，如果你真的希望在各个线程中共享数据，在你的`global.js`中通过该对象来创建你的共享对象。
```javascript
var mySharingData = $MTSGlobal.allocate();
``` 
之后，你可以在你的代码中使用 `put(key, value)`, `get(key)`, `remove(key)` 方法来控制你的共享数据。  