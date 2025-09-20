const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for audio files
config.resolver.assetExts.push(
  // Audio formats
  'mp3',
  'm4a',
  'wav',
  'aac',
  'ogg',
  'flac'
);

// Exclude large audio files from bundle when using Cloudinary
if (process.env.USE_CLOUDINARY === 'true') {
  // This helps reduce APK size when using Cloudinary
  config.resolver.blockList = [
    /assets\/audio\/.*\.(mp3|m4a|wav|aac|ogg|flac)$/,
  ];
}



 

 
module.exports = withNativeWind(config, { input: './global.css' })
