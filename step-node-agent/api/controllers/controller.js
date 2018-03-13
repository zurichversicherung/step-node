module.exports = function Controller (agentContext) {
  let exports = {}

  const FileManager = require('../filemanager/filemanager')
  const OutputBuilder = require('./output')
  exports.filemanager = new FileManager(agentContext)

  exports.reserveToken = function (req, res) {
    exports.reserveToken_(req.params.tokenId)
    res.json({})
  }

  exports.reserveToken_ = function (tokenId) {
    console.log('[Controller] Reserving token: ' + tokenId)
  }

  exports.releaseToken = function (req, res) {
    exports.releaseToken_(req.params.tokenId)
    res.json({})
  }

  exports.releaseToken_ = function (tokenId) {
    console.log('[Controller] Releasing token: ' + tokenId)
  }

  exports.process = function (req, res) {
    const tokenId = req.params.tokenId
    const keywordName = req.body.function
    const argument = req.body.argument
    const properties = req.body.properties

    exports.process_(tokenId, keywordName, argument, properties, function (payload) {
      res.json(payload)
    })
  }

  exports.process_ = function (tokenId, keywordName, argument, properties, callback) {
    const outputBuilder = new OutputBuilder(callback)

    try {
      const filepathPromise = exports.filemanager.loadOrGetKeywordFile(agentContext.controllerUrl + '/grid/file/', properties['$node.js.file.id'], properties['$node.js.file.version'], keywordName)

      filepathPromise.then(function (result) {
        let keywordFile
        if (result.endsWith('.js')) {
          keywordFile = result
        } else {
          keywordFile = result + '/keywords/keywords.js'
        }

        console.log('[Controller] Executing keyword ' + keywordName + ' using filepath ' + keywordFile)
        exports.executeKeyword(keywordName, keywordFile, tokenId, argument, outputBuilder, agentContext)
      }, function (err) {
        console.log('[Controller] Error while attempting to run keyword ' + keywordName + ' :' + err)
      })
    } catch (e) {
      outputBuilder.fail(e)
    }
  }

  exports.executeKeyword = async function (keywordName, filepath, tokenId, argument, outputBuilder, agentContext) {
    console.log('[Controller] Requiring keyword file ' + filepath + ' for token ' + tokenId)
    const kwMod = require(filepath)
    const keywordFunction = kwMod[keywordName]
    if (keywordFunction) {
      let session = agentContext.tokenSessions[tokenId]

      if (!session) session = {}

      console.log('[Controller] Executing keyword ' + keywordName + ' on token ' + tokenId)
      await keywordFunction(argument, outputBuilder, session).catch(function (e) {
        console.log('[Controller] Keyword execution failed: ' + e)
        outputBuilder.fail(e)
      })

      console.log('[Controller] Keyword successfully executed on token ' + tokenId)
    } else {
      outputBuilder.fail('Unable to find keyword ' + keywordName)
    }
  }

  return exports
}
