/*
   KJWebSocketServerAppConfig.java

   Copyright 2013 Keijack

   This Source Code Form is subject to the terms of the GPL v.3.0. or Apache License v.2.0 (Need permission)  
   
   If a copy of the Permitted license was not distributed with this file, You can obtain one at following links.
   
   GPL: https://www.gnu.org/licenses/gpl.html
   
   Apache License: http://www.apache.org/licenses/
*/

package org.keijack.kjservlet;

import java.util.HashSet;
import java.util.Set;

import javax.websocket.Endpoint;
import javax.websocket.server.ServerApplicationConfig;
import javax.websocket.server.ServerEndpointConfig;

public class KJWebSocketServerAppConfig implements ServerApplicationConfig {

    @Override
    public Set<ServerEndpointConfig> getEndpointConfigs(Set<Class<? extends Endpoint>> endpointClasses) {
	Set<ServerEndpointConfig> result = new HashSet<>();
	KJServletRuntime runtime = KJServletRuntime.getInstance();
	runtime.loadInnerScript("_kjservlet_websocket_internal_.js");
	runtime.invokeFunction("_kj_websocket_init_", result, endpointClasses);
	return result;
    }

    @Override
    public Set<Class<?>> getAnnotatedEndpointClasses(Set<Class<?>> scanned) {
	return scanned;
    }

}
