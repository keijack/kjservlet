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
