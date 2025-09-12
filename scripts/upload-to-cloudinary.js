#!/usr/bin/env node

/**
 * Cloudinary Audio Upload Script
 * 
 * This script helps you upload your audio files to Cloudinary
 * 
 * Setup:
 * 1. Install cloudinary: npm install cloudinary
 * 2. Set your Cloudinary credentials in environment variables:
 *    - CLOUDINARY_CLOUD_NAME=your-cloud-name
 *    - CLOUDINARY_API_KEY=your-api-key
 *    - CLOUDINARY_API_SECRET=your-api-secret
 * 3. Run: node scripts/upload-to-cloudinary.js
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if credentials are set
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables');
  process.exit(1);
}

const audioDir = path.join(__dirname, '../assets/audio');
const uploadedFiles = [];
const failedFiles = [];

async function uploadFile(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  
  try {
    console.log(`📤 Uploading ${fileName}...`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video', // Use 'video' for audio files in Cloudinary
      public_id: fileName,
      folder: 'studykey-audio', // Optional: organize in folder
      format: 'mp3', // Convert to MP3 for consistency
      audio_codec: 'mp3',
      quality: 'auto:good' // Optimize quality/size
    });
    
    uploadedFiles.push({
      original: path.basename(filePath),
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id,
      size: result.bytes
    });
    
    console.log(`✅ Uploaded ${fileName} - ${(result.bytes / 1024).toFixed(1)}KB`);
    
  } catch (error) {
    console.error(`❌ Failed to upload ${fileName}:`, error.message);
    failedFiles.push(path.basename(filePath));
  }
}

async function uploadAllFiles() {
  console.log('🚀 Starting Cloudinary upload...\n');
  
  try {
    if (!fs.existsSync(audioDir)) {
      console.error(`❌ Audio directory not found: ${audioDir}`);
      return;
    }
    
    const files = fs.readdirSync(audioDir)
      .filter(file => /\.(mp3|m4a|wav)$/i.test(file))
      .map(file => path.join(audioDir, file));
    
    console.log(`📁 Found ${files.length} audio files\n`);
    
    // Upload files in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await Promise.all(batch.map(uploadFile));
      
      if (i + batchSize < files.length) {
        console.log(`⏳ Waiting 2 seconds before next batch...\n`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n📊 Upload Summary:');
    console.log(`✅ Successfully uploaded: ${uploadedFiles.length} files`);
    console.log(`❌ Failed uploads: ${failedFiles.length} files`);
    
    if (failedFiles.length > 0) {
      console.log('\nFailed files:', failedFiles.join(', '));
    }
    
    // Generate mapping for audioAssets.ts
    if (uploadedFiles.length > 0) {
      console.log('\n📝 Generated Cloudinary URL mapping:');
      console.log('// Copy this to your audioAssets.ts file\n');
      
      uploadedFiles.forEach(file => {
        console.log(`// ${file.original} -> ${file.cloudinaryUrl}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

// Start upload
uploadAllFiles();