# step-plugin-node
STEP Plugin for Node.js

***

## Getting started

### Setup your first project

Install Node.js and then:
```sh
$ git clone https://github.com/denkbar/step-node.git
$ cd step-node\examples\my-keyword-library
$ include the ChromeDriver location in your PATH environment variable OR copy chromedriver.exe to step-node\examples\my-keyword-library
$ npm install
```

Test your keywords locally
```sh
$ npm run test
```

### Deploy your keywords to STEP

Install and start the STEP Controller as described in http://denkbar.io/documentation/step/3_3/getting-started/

Install the STEP agent for Node.js
```sh
$ npm install -g step-node-agent
```

Start the STEP agent for Node.js in your project folder (step-node\examples\my-keyword-library)
```sh
$ step-node-agent -f AgentConf.js
```

Check that your agent for Node.js is properly registered in STEP: http://localhost:8080/#/root/grid/agents

Add the following keywords to STEP: http://localhost:8080/#/root/functions
- Open_Chrome
- Google_Search

Start using your keywords (Details: http://denkbar.io/documentation/step/3_3/keyword-types/)

