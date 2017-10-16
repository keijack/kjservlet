package org.keijack.kjservlet;

public interface JSFunctionWrapper {

    public Object call();

    public Object call(Object arg0);

    public Object call(Object arg0, Object arg1);

    public Object call(Object arg0, Object arg1, Object arg2);

    public Object call(Object arg0, Object arg1, Object arg2, Object arg3);

    public Object call(Object arg0, Object arg1, Object arg2, Object arg3, Object arg4);

    public Object call(Object arg0, Object arg1, Object arg2, Object arg3, Object arg4, Object arg5);

    public Object call(Object arg0, Object arg1, Object arg2, Object arg3, Object arg4, Object arg5, Object arg6);

    public Object call(Object arg0, Object arg1, Object arg2, Object arg3, Object arg4, Object arg5, Object arg6, Object arg7);

    public Object call(Object arg0, Object arg1, Object arg2, Object arg3, Object arg4, Object arg5, Object arg6, Object arg7, Object arg8);

    public Object call(Object arg0, Object arg1, Object arg2, Object arg3, Object arg4, Object arg5, Object arg6, Object arg7, Object arg8, Object arg9);

    public Object apply();

    public Object apply(Object[] args);
}
