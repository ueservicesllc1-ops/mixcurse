const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude the main.js file from the parent directory
config.resolver.blockList = [
  /.*\/main\.js$/,
  /.*\/electron-builder\.json$/,
  /.*\/b2-proxy\.js$/,
  /.*\/dev-server\.js$/,
  /.*\/start-server.*\.(bat|ps1)$/,
  /.*\/BUILD_INSTRUCTIONS\.md$/,
  /.*\/INSTALACION\.md$/,
  /.*\/web-app\.html$/,
  /.*\/dist\/.*/,
  /.*\/images\/.*/,
  /.*\/local-setlist-cache\/.*/,
  /.*\/src\/.*/,
  /.*\/babel\.config\.js$/,
  /.*\/\.gitignore$/,
  /.*\/README\.md$/
];

module.exports = config;


