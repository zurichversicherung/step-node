module.exports = function FileManager (agentContext) {
  const fs = require('fs')
  const shell = require('shelljs')
  const http = require('http')
  const unzip = require('unzip2')

  let exports = {}
  const workingDir = agentContext.properties['filemanagerPath'] + '/work/'
  console.log('[FileManager] Starting file manager using working directory: ' + workingDir)

  console.log('[FileManager] Clearing working dir: ' + workingDir)
  shell.rm('-rf', workingDir)
  fs.mkdirSync(workingDir)

  let filemanagerMap = {}

  exports.loadOrGetKeywordFile = function (controllerUrl, fileId, fileVersionId) {
    return new Promise(function (resolve, reject) {
      const filePath = workingDir + fileId + '/' + fileVersionId

      const cacheEntry = getCacheEntry(fileId, fileVersionId)
      if (cacheEntry) {
        if (!cacheEntry.loading) {
          console.log('[FileManager] Entry found for fileId ' + fileId + ': ' + cacheEntry.name)
          const fileName = cacheEntry.name

          if (fs.existsSync(filePath + '/' + fileName)) {
            resolve(filePath + '/' + fileName)
          } else {
            reject(new Error('Entry exists but no file found: ' + filePath + '/' + fileName))
          }
        } else {
          console.log('[FileManager] Waiting for cache entry to be loaded for fileId ' + fileId)
          cacheEntry.promises.push((result) => {
            console.log('[FileManager] Cache entry loaded for fileId ' + fileId)
            resolve(result)
          })
        }
      } else {
        putCacheEntry(fileId, fileVersionId, {'loading': true, 'promises': []})

        console.log('[FileManager] No entry found for fileId ' + fileId + '. Loading...')
        shell.mkdir('-p', filePath)
        console.log('[FileManager] Created file path: ' + filePath + ' for fileId ' + fileId)

        console.log('[FileManager] Requesting file from: ' + controllerUrl + fileId)
        const filenamePromise = getKeywordFile(controllerUrl + fileId, filePath)

        filenamePromise.then(function (result) {
          console.log('[FileManager] Transfered file ' + result + ' from ' + controllerUrl + fileId)

          let cacheEntry = getCacheEntry(fileId, fileVersionId)
          cacheEntry.name = result
          cacheEntry.loading = false

          putCacheEntry(fileId, fileVersionId, cacheEntry)

          if (cacheEntry.promises) {
            cacheEntry.promises.forEach(callback => callback(filePath + '/' + result)) // eslint-disable-line
          }
          delete cacheEntry.promises

          resolve(filePath + '/' + result)
        }, function (err) {
          console.log('Error :' + err)
          reject(err)
        })
      }
    })
  }

  function getCacheEntry (fileId, fileVersion) {
    return filemanagerMap[fileId + fileVersion]
  }

  function putCacheEntry (fileId, fileVersion, entry) {
    filemanagerMap[fileId + fileVersion] = entry
  }

  function getKeywordFile (controllerFileUrl, targetDir) {
    return new Promise(function (resolve, reject) {
      http.get(controllerFileUrl, (resp) => {
        const filename = parseName(resp.headers)
        const filepath = targetDir + '/' + filename
        if (isDir(resp.headers)) {
          resp.pipe(unzip.Extract({path: filepath})).on('close', () => resolve(filename))
        } else {
          const myFile = fs.createWriteStream(filepath)
          resp.pipe(myFile).on('finish', () => resolve(filename))
        }
      }).on('error', (err) => {
        console.log('Error: ' + err.message)
        reject(err)
      })
    })
  }

  function parseName (headers) {
    const contentDisposition = JSON.stringify(headers['content-disposition'])
    return contentDisposition.split('filename = ')[1].split(';')[0]
  }

  function isDir (headers) {
    const contentDisposition = JSON.stringify(headers['content-disposition'])
    return contentDisposition.split('type = ')[1].split(';')[0].startsWith('dir')
  }
  return exports
}
