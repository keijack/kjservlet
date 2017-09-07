var _kj_velocity_engine_ = (function() {
	var p = new java.util.Properties();
	p.setProperty("file.resource.loader.path", $classpath + "../../");
	var engine = new org.apache.velocity.app.VelocityEngine();
	engine.init(p);
	return engine;
})();