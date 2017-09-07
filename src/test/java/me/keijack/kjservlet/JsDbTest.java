package me.keijack.kjservlet;

import static org.junit.Assert.fail;

import org.junit.Test;

import me.keijack.kjservlet.KJServletRuntime;

public class JsDbTest {

	@Test
	public void test() {
		try {
			KJServletRuntime.getInstance(false).invokeFunction("src/test/java/me/keijack/kjservlet/kjdbtest.js", "run");
		} catch (Exception e) {
			e.printStackTrace();
			fail();
		}
	}

}
