# 📦 APK Build with Cloudinary Audio Optimization

This guide helps you reduce your APK build size by using Cloudinary for audio files.

## 🎯 Benefits

- **Smaller APK Size**: Reduces build from ~276MB to under 50MB
- **Faster Downloads**: Quicker app installation for users
- **Auto Optimization**: Cloudinary automatically optimizes audio quality/size
- **Global CDN**: Faster audio loading worldwide
- **Scalable**: Easy to add more audio files without increasing APK size

## 🚀 Setup Process

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com) and sign up for free
2. Note your **Cloud Name**, **API Key**, and **API Secret** from the dashboard

### 2. Configure Your App
1. Open `data/audioAssets.ts`
2. Replace `'your-cloud-name'` with your actual Cloudinary cloud name:
   ```typescript
   const CLOUDINARY_CLOUD_NAME = 'your-actual-cloud-name';
   ```

### 3. Upload Audio Files
Option A: **Using the Upload Script (Recommended)**
```bash
# Install cloudinary package
npm install cloudinary

# Set environment variables (Windows PowerShell)
$env:CLOUDINARY_CLOUD_NAME="your-cloud-name"
$env:CLOUDINARY_API_KEY="your-api-key"
$env:CLOUDINARY_API_SECRET="your-api-secret"

# Run upload script
node scripts/upload-to-cloudinary.js
```

Option B: **Manual Upload via Dashboard**
1. Go to your Cloudinary dashboard
2. Upload files to a folder called `studykey-audio`
3. Copy the URLs and update `audioAssets.ts` manually

### 4. Test Cloudinary Integration
```bash
# Test in development with Cloudinary
npm start
# Set USE_CLOUDINARY=true to test Cloudinary URLs locally
```

### 5. Build Optimized APK
```bash
# Build APK with Cloudinary
eas build --platform android --profile preview
```

## 📁 File Structure After Setup

```
studykey/
├── data/
│   └── audioAssets.ts          # ✅ Configured with your cloud name
├── scripts/
│   └── upload-to-cloudinary.js # 🔧 Upload automation script
├── .easignore                  # 🚫 Excludes audio files from build
└── eas.json                    # ⚙️ Build config with Cloudinary flag
```

## 🔧 Environment Variables

For production builds, these are set automatically:
- `NODE_ENV=production` (auto-set by EAS)
- `USE_CLOUDINARY=true` (set in eas.json)

For local testing:
- Set `USE_CLOUDINARY=true` to test Cloudinary URLs in development

## 📊 Expected Results

| Metric | Before | After |
|--------|--------|-------|
| APK Size | ~276MB | ~50MB |
| Build Time | 15-20min | 8-12min |
| Download Time | 5-10min | 1-2min |
| Audio Loading | Local | CDN-optimized |

## 🔍 Troubleshooting

### Audio Not Playing
1. Check console logs for Cloudinary URL errors
2. Verify your cloud name is correct in `audioAssets.ts`
3. Ensure audio files are uploaded with correct naming

### Build Still Large
1. Uncomment audio exclusion lines in `.easignore`:
   ```
   assets/audio/*.mp3
   assets/audio/*.m4a
   ```
2. Verify `USE_CLOUDINARY=true` is set in build profile

### Upload Script Fails
1. Double-check environment variables
2. Ensure you have upload permissions in Cloudinary
3. Check network connectivity

## 🎵 Audio File Naming Convention

Your audio files follow this pattern:
- Letters: `A.mp3`, `B.mp3`, etc.
- Letter Sentences: `S-A.mp3`, `S-B.mp3`, etc.
- Pronunciations: `p-A.mp3`, `P-B.mp3`, etc.
- Animals: `Bear.mp3`, `Cat.mp3`, etc.
- Animal Sentences: `S-Bear.mp3`, `S-cat.mp3`, etc.
- Animal Pronunciations: `P-Bear.mp3`, `p-cat.mp3`, etc.

The app will automatically map these to the correct Cloudinary URLs.

## 📞 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your Cloudinary configuration
3. Test with a few files first before uploading all audio files

Once configured, your app will:
- ✅ Use local files during development (fast iteration)
- ✅ Use Cloudinary URLs in production builds (small APK)
- ✅ Automatically fall back to text-to-speech if audio fails
- ✅ Provide optimized audio quality for your users