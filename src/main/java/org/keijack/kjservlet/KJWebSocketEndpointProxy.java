package org.keijack.kjservlet;

import javax.websocket.CloseReason;
import javax.websocket.Endpoint;
import javax.websocket.EndpointConfig;
import javax.websocket.MessageHandler;
import javax.websocket.Session;

public class KJWebSocketEndpointProxy extends Endpoint {

    @Override
    public void onOpen(Session session, EndpointConfig config) {
	KJServletRuntime.getInstance().invokeMethod("_kj_websocket_dispatcher_", "onOpen", session, config);
	session.addMessageHandler(new MessageHandler.Whole<String>() {
	    @Override
	    public void onMessage(String message) {
		KJServletRuntime.getInstance().invokeMethod("_kj_websocket_dispatcher_", "onMessage", session, message);
	    }

	});
    }

    @Override
    public void onClose(Session session, CloseReason closeReason) {
	super.onClose(session, closeReason);
	KJServletRuntime.getInstance().invokeMethod("_kj_websocket_dispatcher_", "onClose", session, closeReason);
    }

    @Override
    public void onError(Session session, Throwable thr) {
	super.onError(session, thr);
	KJServletRuntime.getInstance().invokeMethod("_kj_websocket_dispatcher_", "onError", session, thr);
    }

}
