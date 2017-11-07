/*
   _kjservlet_http_velocity_plugin_.js

   Copyright 2013 Keijack

   This Source Code Form is subject to the terms of the GPL v.3.0. or Apache License v.2.0 (Need permission)  
   
   If a copy of the Permitted license was not distributed with this file, You can obtain one at following links.
   
   GPL: https://www.gnu.org/licenses/gpl.html
   
   Apache License: http://www.apache.org/licenses/LICENSE-2.0
*/

var _kj_velocity_engine_ = (function() {
	var p = new java.util.Properties();
	p.setProperty("file.resource.loader.path", $servletContextRoot);
	var engine = new org.apache.velocity.app.VelocityEngine();
	engine.init(p);
	return engine;
})();