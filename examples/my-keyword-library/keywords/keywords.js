exports.Open_Chrome = async (input, output, session) => {
  const webdriver = require('selenium-webdriver')

  const driver = await new webdriver.Builder()
    .forBrowser('chrome')
    .build()

  session.driver = driver
  output.send()
}

exports.Google_Search = async (input, output, session) => {
  try {
    const webdriver = require('selenium-webdriver')
    const { By } = webdriver
    const driver = session.driver

    session.driver = driver
    await driver.get('http://www.google.com/ncr')
    await driver.findElement(By.name('q')).sendKeys(input.search + webdriver.Key.ENTER)

    const data = await driver.takeScreenshot()
    output.attach({ name: 'screenshot.png', hexContent: data })
    output.send({ result: 'OK' })
  } catch (e) {
    output.fail(e)
  }
}

exports.Close_Chrome = async (input, output, session) => {
  try {
    const driver = session.driver
    driver.quit()

    output.send({ result: 'OK' })
  } catch (e) {
    output.fail(e)
  }
}
