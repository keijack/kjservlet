/*
   _kjservlet_http_freemarker_plugin_.js

   Copyright 2013 Keijack

   This Source Code Form is subject to the terms of the GPL v.3.0. or Apache License v.2.0 (Need permission)  
   
   If a copy of the Permitted license was not distributed with this file, You can obtain one at following links.
   
   GPL: https://www.gnu.org/licenses/gpl.html
   
   Apache License: http://www.apache.org/licenses/
*/

var _kj_freemarker_conf_ = (function() {
	var JavaFile = Java.type("java.io.File");
	var FreeMarkerConf = Java.type("freemarker.template.Configuration");

	var cfg = new FreeMarkerConf(FreeMarkerConf.VERSION_2_3_25);
	cfg.setClassicCompatible(true);
	cfg.setDirectoryForTemplateLoading(new JavaFile($servletContextRoot));
	cfg.setDefaultEncoding("UTF-8");

	return cfg;
})();