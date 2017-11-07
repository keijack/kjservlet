/*
   NashornJSException.java

   Copyright 2017 Keijack

   This Source Code Form is subject to the terms of the GPL v.3.0. or Apache License v.2.0 (Need permission)  
   
   If a copy of the Permitted license was not distributed with this file, You can obtain one at following links.
   
   GPL: https://www.gnu.org/licenses/gpl.html
   
   Apache License: http://www.apache.org/licenses/LICENSE-2.0
*/

package org.keijack.kjservlet;

public class NashornJSException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final String msg;

    public NashornJSException(String msg) {
	super();
	this.msg = msg;
    }

    public NashornJSException(Throwable t) {
	super(t);
	this.msg = t.getMessage();
    }

    @Override
    public String getMessage() {
	return "Javascript Error ==> " + this.msg;
    }

}
