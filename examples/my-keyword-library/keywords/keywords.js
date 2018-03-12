exports.Open_Chrome = async function(input, output, session) {

	var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

	var driver = await new webdriver.Builder()
		.forBrowser('chrome')
		.build();

	session.driver = driver;

	output.send();
}

exports.Google_Search = async function(input, output, session) {
	try {
		//promise.USE_PROMISE_MANAGER = false;
		var webdriver = require('selenium-webdriver'),
		By = webdriver.By,
		until = webdriver.until;

		var driver = session.driver;

		session.driver = driver;
		await driver.get('http://www.google.com/ncr');
		await driver.findElement(By.name('q')).sendKeys(input.search+webdriver.Key.ENTER);

		var data = await driver.takeScreenshot();
		output.attach({"name":"screenshot.png","hexContent":data});

		output.send({"result":"OK"});
	} catch (e) {
		output.fail(e);
	}
}

exports.Close_Chrome = async function(input, output, session) {
	try {
		var driver = session.driver;
		driver.quit();

		output.send({"result":"OK"});
	} catch (e) {
		output.fail(e);
	}
}
