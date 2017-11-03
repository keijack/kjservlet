package org.keijack.kjservlet;

import javax.websocket.HandshakeResponse;
import javax.websocket.server.HandshakeRequest;
import javax.websocket.server.ServerEndpointConfig;

public class KJWebSocketEndpointConfig extends ServerEndpointConfig.Configurator {

    @Override
    public void modifyHandshake(ServerEndpointConfig sec, HandshakeRequest request, HandshakeResponse response) {
	KJServletRuntime.getInstance().invokeMethod("_kj_websocket_dispatcher_", "onHandShake", sec, request, response);
    }

}
