const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const config = getDefaultConfig(projectRoot)

// The attendance maths, reducer and palette live in ../shared, outside this
// project root, so Metro has to be told to watch and resolve them.
config.watchFolders = [path.resolve(projectRoot, '..', 'shared')]
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')]

module.exports = config
