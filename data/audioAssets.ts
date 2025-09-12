// Audio assets mapping for toddler learning
// Using Cloudinary URLs for optimized builds and smaller APK size

import RemoteLogger from '../utils/RemoteLogger';

// Cloudinary configuration - Your actual cloud name from successful upload
const CLOUDINARY_CLOUD_NAME = 'dapnwrxsv';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload`;
const CLOUDINARY_FOLDER = 'studykey-audio'; // Folder where all audio files are stored

// Helper function to generate Cloudinary URL with audio optimization and folder
const getCloudinaryAudioUrl = (fileName: string, options: string = 'f_auto,q_auto:good') => {
  try {
    // Remove file extension for Cloudinary (it auto-detects format)
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    const url = `${CLOUDINARY_BASE_URL}/${options}/${CLOUDINARY_FOLDER}/${fileNameWithoutExt}`;
    
    // Add logging for production debugging
    if (__DEV__ === false) {
      console.log(`[CLOUDINARY] Generated URL: ${url}`);
    }
    
    return url;
  } catch (error) {
    console.error('[CLOUDINARY] Error generating URL:', error);
    return null;
  }
};

// Environment flag - Use local files for testing crashes
const useCloudinary = true;

// Hybrid approach: Test Cloudinary, fallback to TTS quickly
const CLOUDINARY_TIMEOUT = 3000; // 3 second timeout for APK

// Debug environment information for APK
if (__DEV__ === false) {
  RemoteLogger.log('📦 Production APK Environment Info:', {
    NODE_ENV: process.env.NODE_ENV,
    USE_CLOUDINARY: process.env.USE_CLOUDINARY,
    CLOUDINARY_CLOUD_NAME,
    isDev: __DEV__,
    platform: require('react-native').Platform.OS
  });
}

// Audio filename mapping - Maps app's internal names to actual Cloudinary filenames
const audioFileNameMap: { [key: string]: string } = {
  // Animals & Letters category - Letters (Front side)
  'animals-letters_1_word.mp3': 'A.mp3',
  'animals-letters_2_word.mp3': 'B.mp3', 
  'animals-letters_3_word.mp3': 'C.mp3',
  'animals-letters_4_word.mp3': 'D.mp3',
  'animals-letters_5_word.mp3': 'E.mp3',
  'animals-letters_6_word.mp3': 'F.mp3',
  'animals-letters_7_word.mp3': 'G.mp3',
  'animals-letters_8_word.mp3': 'H.mp3',
  'animals-letters_9_word.mp3': 'I.mp3',
  'animals-letters_10_word.mp3': 'J.mp3',
  'animals-letters_11_word.mp3': 'k.mp3',
  'animals-letters_12_word.mp3': 'L.mp3',
  'animals-letters_13_word.mp3': 'M.mp3',
  'animals-letters_14_word.mp3': 'N.mp3',
  'animals-letters_15_word.mp3': 'o.mp3',
  'animals-letters_16_word.mp3': 'P.mp3',
  'animals-letters_17_word.mp3': 'Q.mp3',
  'animals-letters_18_word.mp3': 'R.mp3',
  'animals-letters_19_word.mp3': 'S.mp3',
  'animals-letters_20_word.mp3': 'T.mp3',
  'animals-letters_21_word.mp3': 'U.mp3',
  'animals-letters_22_word.mp3': 'V.mp3',
  'animals-letters_23_word.mp3': 'W.mp3',
  'animals-letters_24_word.mp3': 'x.mp3',
  'animals-letters_25_word.mp3': 'y.mp3',
  'animals-letters_26_word.mp3': 'z.mp3',

  // Animals & Letters category - Letter Pronunciations (Front side)
  'animals-letters_1_pronunciation.mp3': 'p-A.mp3',
  'animals-letters_2_pronunciation.mp3': 'p-B.mp3',
  'animals-letters_3_pronunciation.mp3': 'p-C.mp3',
  'animals-letters_4_pronunciation.mp3': 'P-D.mp3',
  'animals-letters_5_pronunciation.mp3': 'P-e.mp3',
  'animals-letters_6_pronunciation.mp3': 'P-F.mp3',
  'animals-letters_7_pronunciation.mp3': 'P-G.mp3',
  'animals-letters_8_pronunciation.mp3': 'p-H.mp3',
  'animals-letters_9_pronunciation.mp3': 'P-I.mp3',
  'animals-letters_10_pronunciation.mp3': 'p-J.mp3',
  'animals-letters_11_pronunciation.mp3': 'p-k.mp3',
  'animals-letters_12_pronunciation.mp3': 'p-L.mp3',
  'animals-letters_13_pronunciation.mp3': 'p-M.mp3',
  'animals-letters_14_pronunciation.mp3': 'p-N.mp3',
  'animals-letters_15_pronunciation.mp3': 'p-o.mp3',
  'animals-letters_16_pronunciation.mp3': 'p-p.mp3',
  'animals-letters_17_pronunciation.mp3': 'p-Q.mp3',
  'animals-letters_18_pronunciation.mp3': 'P-R.mp3',
  'animals-letters_19_pronunciation.mp3': 'P-S.mp3',
  'animals-letters_20_pronunciation.mp3': 'p-T.mp3',
  'animals-letters_21_pronunciation.mp3': 'P-U.mp3',
  'animals-letters_22_pronunciation.mp3': 'p-V.mp3',
  'animals-letters_23_pronunciation.mp3': 'P-W.mp3',
  'animals-letters_24_pronunciation.mp3': 'p-x.mp3',
  'animals-letters_25_pronunciation.mp3': 'p-y.mp3',
  'animals-letters_26_pronunciation.mp3': 'p-z.mp3',

  // Animals & Letters category - Letter Sentences (Front side)
  'animals-letters_1_sentence.mp3': 'S-A.mp3',
  'animals-letters_2_sentence.mp3': 'S-B.mp3',
  'animals-letters_3_sentence.mp3': 's-C.mp3',
  'animals-letters_4_sentence.mp3': 'S-D.mp3',
  'animals-letters_5_sentence.mp3': 'S-E.mp3',
  'animals-letters_6_sentence.mp3': 'S-F.mp3',
  'animals-letters_7_sentence.mp3': 'S-G.mp3',
  'animals-letters_8_sentence.mp3': 'S-H.mp3',
  'animals-letters_9_sentence.mp3': 'S-I.mp3',
  'animals-letters_10_sentence.mp3': 'S-J.mp3',
  'animals-letters_11_sentence.mp3': 'S-k.mp3',
  'animals-letters_12_sentence.mp3': 's-L.mp3',
  'animals-letters_13_sentence.mp3': 'S-M.mp3',
  'animals-letters_14_sentence.mp3': 'S-N.mp3',
  'animals-letters_15_sentence.mp3': 's-o.mp3',
  'animals-letters_16_sentence.mp3': 's-P.mp3',
  'animals-letters_17_sentence.mp3': 'S-Q.mp3',
  'animals-letters_18_sentence.mp3': 'S-R.mp3',
  'animals-letters_19_sentence.mp3': 'S-S.mp3',
  'animals-letters_20_sentence.mp3': 'S-t.mp3',
  'animals-letters_21_sentence.mp3': 'S-U.mp3',
  'animals-letters_22_sentence.mp3': 's-V.mp3',
  'animals-letters_23_sentence.mp3': 'S-W.mp3',
  'animals-letters_24_sentence.mp3': 's-X.mp3',
  'animals-letters_25_sentence.mp3': 's-Y.mp3',
  'animals-letters_26_sentence.mp3': 's-z.mp3',

  // Animals & Letters category - Animal Names (Back side)
  'animals-letters_1_animal.mp3': 'Alligator.mp3',
  'animals-letters_2_animal.mp3': 'Bear.mp3',
  'animals-letters_3_animal.mp3': 'Cat.mp3',
  'animals-letters_4_animal.mp3': 'Dog.mp3',
  'animals-letters_5_animal.mp3': 'Elephant.mp3',
  'animals-letters_6_animal.mp3': 'Fox.mp3',
  'animals-letters_7_animal.mp3': 'Giraffe.mp3',
  'animals-letters_8_animal.mp3': 'Hippopotamus.mp3',
  'animals-letters_9_animal.mp3': 'Iguana.mp3',
  'animals-letters_10_animal.mp3': 'Jellyfish.mp3',
  'animals-letters_11_animal.mp3': 'koala.mp3',
  'animals-letters_12_animal.mp3': 'lion.mp3',
  'animals-letters_13_animal.mp3': 'Monkey.mp3',
  'animals-letters_14_animal.mp3': 'Numbat.mp3',
  'animals-letters_15_animal.mp3': 'owl.mp3',
  'animals-letters_16_animal.mp3': 'penquin.mp3',
  'animals-letters_17_animal.mp3': 'Quaka.mp3',
  'animals-letters_18_animal.mp3': 'Rhinoceros.mp3',
  'animals-letters_19_animal.mp3': 'Snake.mp3',
  'animals-letters_20_animal.mp3': 'Turtle.mp3',
  'animals-letters_21_animal.mp3': 'Urial.mp3',
  'animals-letters_22_animal.mp3': 'Vulture.mp3',
  'animals-letters_23_animal.mp3': 'Walrus.mp3',
  'animals-letters_24_animal.mp3': 'xenops.mp3',
  'animals-letters_25_animal.mp3': 'yak.mp3',
  'animals-letters_26_animal.mp3': 'zebra.mp3',

  // Animals & Letters category - Animal Pronunciations (Back side)
  'animals-letters_1_animal_pronunciation.mp3': 'P-Alligator.mp3',
  'animals-letters_2_animal_pronunciation.mp3': 'P-Bear.mp3',
  'animals-letters_3_animal_pronunciation.mp3': 'P-cat.mp3',
  'animals-letters_4_animal_pronunciation.mp3': 'p-dog.mp3',
  'animals-letters_5_animal_pronunciation.mp3': 'p-elephant.mp3',
  'animals-letters_6_animal_pronunciation.mp3': 'P-Fox.mp3',
  'animals-letters_7_animal_pronunciation.mp3': 'P-Giraffe.mp3',
  'animals-letters_8_animal_pronunciation.mp3': 'p-Hippopotamus.mp3',
  'animals-letters_9_animal_pronunciation.mp3': 'P-iguana.mp3',
  'animals-letters_10_animal_pronunciation.mp3': 'p-Jellyfish.mp3',
  'animals-letters_11_animal_pronunciation.mp3': 'p-koala.mp3',
  'animals-letters_12_animal_pronunciation.mp3': 'p-lion.mp3',
  'animals-letters_13_animal_pronunciation.mp3': 'P-Monkey.mp3',
  'animals-letters_14_animal_pronunciation.mp3': 'p-Numbat.mp3',
  'animals-letters_15_animal_pronunciation.mp3': 'p-owl.mp3',
  'animals-letters_16_animal_pronunciation.mp3': 'P-penquin.mp3',
  'animals-letters_17_animal_pronunciation.mp3': 'p-Quaka.mp3',
  'animals-letters_18_animal_pronunciation.mp3': 'p-Rhinoceros.mp3',
  'animals-letters_19_animal_pronunciation.mp3': 'p-Snake.mp3',
  'animals-letters_20_animal_pronunciation.mp3': 'p-turtle.mp3',
  'animals-letters_21_animal_pronunciation.mp3': 'p-Urial.mp3',
  'animals-letters_22_animal_pronunciation.mp3': 'p-Vulture.mp3',
  'animals-letters_23_animal_pronunciation.mp3': 'p-Walrus.mp3',
  'animals-letters_24_animal_pronunciation.mp3': 'p-xenops.mp3',
  'animals-letters_25_animal_pronunciation.mp3': 'p-yak.mp3',
  'animals-letters_26_animal_pronunciation.mp3': 'p-zebra.mp3',

  // Animals & Letters category - Animal Sentences (Back side)
  'animals-letters_1_animal_sentence.mp3': 'S-alligator.mp3',
  'animals-letters_2_animal_sentence.mp3': 'S-Bear.mp3',
  'animals-letters_3_animal_sentence.mp3': 'S-cat.mp3',
  'animals-letters_4_animal_sentence.mp3': 's-dog.mp3',
  'animals-letters_5_animal_sentence.mp3': 'S-elephant.mp3',
  'animals-letters_6_animal_sentence.mp3': 'S-Fox.mp3',
  'animals-letters_7_animal_sentence.mp3': 'S-Giraffe.mp3',
  'animals-letters_8_animal_sentence.mp3': 'S-Hippopotamus.mp3',
  'animals-letters_9_animal_sentence.mp3': 's-iguana.mp3',
  'animals-letters_10_animal_sentence.mp3': 's-Jellyfish.mp3',
  'animals-letters_11_animal_sentence.mp3': 'S-koala.mp3',
  'animals-letters_12_animal_sentence.mp3': 's-lion.mp3',
  'animals-letters_13_animal_sentence.mp3': 's-Monkey.mp3',
  'animals-letters_14_animal_sentence.mp3': 's-Numbat.mp3',
  'animals-letters_15_animal_sentence.mp3': 's-owl.mp3',
  'animals-letters_16_animal_sentence.mp3': 's-penquin.mp3',
  'animals-letters_17_animal_sentence.mp3': 'S-Quaka.mp3',
  'animals-letters_18_animal_sentence.mp3': 's-Rhinoceros.mp3',
  'animals-letters_19_animal_sentence.mp3': 's-Snake.mp3',
  'animals-letters_20_animal_sentence.mp3': 's-turtle.mp3',
  'animals-letters_21_animal_sentence.mp3': 's-Urial.mp3',
  'animals-letters_22_animal_sentence.mp3': 'S-Vulture.mp3',
  'animals-letters_23_animal_sentence.mp3': 's-Walrus.mp3',
  'animals-letters_24_animal_sentence.mp3': 's-xenops.mp3',
  'animals-letters_25_animal_sentence.mp3': 's-yak.mp3',
  'animals-letters_26_animal_sentence.mp3': 's-zebra.mp3',

  // Fruits & Colors category
  'fruits-colors_1_word.mp3': 'fruits-colors_1_word.mp3',
  'fruits-colors_1_word.m4a': 'fruits-colors_1_word.mp3', // Cloudinary converted to mp3
  'fruits-colors_1_sentence.mp3': 'fruits-colors_1_sentence.mp3',
};

// Simplified audio assets - Now uses filename mapping to Cloudinary
export const audioAssets = {};

// Enhanced getAudioAsset function that maps internal names to actual Cloudinary filenames
export const getAudioAsset = (fileName: string) => {
  try {
    // Map internal filename to actual Cloudinary filename FIRST
    const actualFileName = audioFileNameMap[fileName] || fileName;
    
    RemoteLogger.log(`🗂️ Audio mapping: ${fileName} → ${actualFileName}`);
    RemoteLogger.log(`🌤️ Generating Cloudinary URL for: ${actualFileName}`);
    
    const url = getCloudinaryAudioUrl(actualFileName);
    
    if (!url) {
      RemoteLogger.error(`Failed to generate URL for: ${actualFileName}`, 'URL generation failed');
      return null;
    }
    
    RemoteLogger.log(`✅ Generated Cloudinary URL: ${url}`);
    return url;
  } catch (error) {
    RemoteLogger.error(`Error in getAudioAsset for ${fileName}`, error);
    return null;
  }
};

// Alternative function specifically for Cloudinary URLs with custom optimization
export const getCloudinaryAudioAsset = (fileName: string, optimizations: string = 'f_auto,q_auto:good') => {
  try {
    console.log(`🌤️ Generating optimized Cloudinary URL for ${fileName}`);
    return getCloudinaryAudioUrl(fileName, optimizations);
  } catch (error) {
    console.error(`❌ Error in getCloudinaryAudioAsset for ${fileName}:`, error);
    return null;
  }
};

// Helper to check if Cloudinary is configured
export const isCloudinaryConfigured = () => {
  const configured = CLOUDINARY_CLOUD_NAME === 'dapnwrxsv';
  console.log(`⚙️ Cloudinary configured: ${configured}`);
  return configured;
};

// Test function to verify a specific audio file URL
export const getTestAudioUrl = (fileName: string) => {
  try {
    const url = getCloudinaryAudioUrl(fileName);
    console.log(`🔗 Test URL for ${fileName}: ${url}`);
    return url;
  } catch (error) {
    console.error(`❌ Error generating test URL for ${fileName}:`, error);
    return null;
  }
};

// Network connectivity test for production debugging
export const testCloudinaryConnection = async () => {
  try {
    const testUrl = getCloudinaryAudioUrl('A.mp3');
    if (!testUrl) {
      throw new Error('Failed to generate test URL');
    }
    
    RemoteLogger.log(`🌍 Testing Cloudinary connection: ${testUrl}`);
    
    // Test if we can reach Cloudinary (basic connectivity check)
    const response = await fetch(testUrl, { method: 'HEAD' });
    const success = response.status === 200;
    RemoteLogger.log(`🌐 Cloudinary connectivity test: ${success ? 'SUCCESS' : 'FAILED'} (${response.status})`);
    
    if (!success) {
      RemoteLogger.log(`🚨 Network or Cloudinary issue detected in APK`);
    }
    
    return success;
  } catch (error) {
    RemoteLogger.error('Cloudinary connection test failed', error);
    return false;
  }
};