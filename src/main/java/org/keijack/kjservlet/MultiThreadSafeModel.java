/*
   MultiThreadSafeModel.java

   Copyright 2017 Keijack

   This Source Code Form is subject to the terms of the GPL v.3.0. or Apache License v.2.0 (Need permission)  
   
   If a copy of the Permitted license was not distributed with this file, You can obtain one at following links.
   
   GPL: https://www.gnu.org/licenses/gpl.html
   
   Apache License: http://www.apache.org/licenses/LICENSE-2.0
*/

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
