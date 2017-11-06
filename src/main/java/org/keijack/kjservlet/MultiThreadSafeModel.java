package org.keijack.kjservlet;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class MultiThreadSafeModel extends ConcurrentHashMap<String, Object> {

    private static final long serialVersionUID = 1L;

    private final String key;

    public MultiThreadSafeModel(String key) {
	super();
	this.key = key;
    }

    public String getKey() {
	return key;
    }

    public MultiThreadSafeModel allocate() {
	return this.allocate(UUID.randomUUID().toString());
    }

    public MultiThreadSafeModel allocate(String key) {
	if (this.contains(key)) {
	    Object val = this.get(key);
	    if (this.getClass().isInstance(val))
		return (MultiThreadSafeModel) val;
	    else
		return null;
	}
	MultiThreadSafeModel map = new MultiThreadSafeModel(key);
	this.put(key, map);
	return map;
    }

}
