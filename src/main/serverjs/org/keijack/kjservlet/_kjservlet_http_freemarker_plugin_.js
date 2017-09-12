var _kj_freemarker_conf_ = (function() {
	var JavaFile = Java.type("java.io.File");
	var FreeMarkerConf = Java.type("freemarker.template.Configuration");

	var cfg = new FreeMarkerConf(FreeMarkerConf.VERSION_2_3_25);
	cfg.setClassicCompatible(true);
	cfg.setDirectoryForTemplateLoading(new JavaFile($servletContextRoot));
	cfg.setDefaultEncoding("UTF-8");

	return cfg;
})();