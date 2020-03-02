const fs = require('fs-extra')
const IS_WINDOWS = /^win/.test(process.platform)

async function DatPlugin (webrun) {
  const { CACHE } = webrun.options
  const { DATCACHE = new URL('datcache/', CACHE) } = webrun.options

  let DatArchive = null
  let datPeers = null

  if (getMainDat()) await loadDatPeers()

  webrun.addProtocol('dat:', async function getDat (url) {
    const DatArchive = getDatArchive()
    const parentURL = `dat://${url.hostname}`

    const archive = await DatArchive.load(parentURL)

    return archive.readFile(url.pathname, 'utf8')
  })

  webrun.addGlobal('DatArchive', getDatArchive)
  webrun.addGlobal('experimental', getExperimental)

  function getDatArchive () {
    if (!DatArchive) {
      const storageLocation = urlToPath(DATCACHE)
      fs.ensureDirSync(storageLocation)

      const sdk = require('dat-sdk/promise')({
        storageOpts: {
          storageLocation
        }
      })
      DatArchive = sdk.DatArchive
    }

    return DatArchive
  }

  async function loadDatPeers () {
    const main = getMainDat()

    // If the main file isn't loaded from Dat, we can't set peers for it
    if (!main) return

    const DatArchive = getDatArchive()

    const DatPeers = require('dat-peers')

    const archive = await DatArchive.load(`dat://${main.host}`, {
      extensions: DatPeers.EXTENSIONS
    })

    try {
      const infoJSON = await archive.readFile('/dat.json', 'utf8')
      const info = JSON.parse(infoJSON)
      if (!info.experimental.apis.includes('datPeers')) throw new Error('Archive not opted into datPeers')
    } catch (e) {
      // Archive hasn't opted into dat peers. Close it.
      await archive.close()
      return
    }

    datPeers = new DatPeers(archive._archive)
  }

  function getMainDat () {
    // If we don't have a main module, we can't get peers for it
    if (!webrun.main) return null
    const main = new URL(webrun.main)

    // If the main module isn't a dat archive, we can't get peers for it
    if (main.scheme.protocol !== 'dat:') return null

    return main
  }

  function getExperimental () {
    // If we're not in a dat archive, we can't load experimental APIs
    if (!getMainDat()) return null

    const experimental = {
      get datPeers () {
        return datPeers
      }
    }

    return experimental
  }
}

module.exports = DatPlugin

function urlToPath (url) {
  let location = url.pathname
  if (IS_WINDOWS) location = location.slice(1)
  return location
}
