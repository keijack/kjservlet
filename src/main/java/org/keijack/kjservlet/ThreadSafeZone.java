package org.keijack.kjservlet;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class ThreadSafeZone extends ConcurrentHashMap<String, Object> {

    private static final long serialVersionUID = 1L;

    public ThreadSafeZone allocate() {
	return this.allocate(UUID.randomUUID().toString());
    }

    public ThreadSafeZone allocate(String key) {
	if (this.contains(key)) {
	    Object val = this.get(key);
	    if (this.getClass().isInstance(val))
		return (ThreadSafeZone) val;
	    else
		return null;
	}
	ThreadSafeZone zone = new ThreadSafeZone();
	this.put(key, zone);
	return zone;
    }

}
