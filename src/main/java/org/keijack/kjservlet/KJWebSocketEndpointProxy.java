/*
   KJWebSocketEndpointProxy.java

   Copyright 2017 Keijack

   This Source Code Form is subject to the terms of the GPL v.3.0. or Apache License v.2.0 (Need permission)  
   
   If a copy of the Permitted license was not distributed with this file, You can obtain one at following links.
   
   GPL: https://www.gnu.org/licenses/gpl.html
   
   Apache License: http://www.apache.org/licenses/LICENSE-2.0
*/

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
