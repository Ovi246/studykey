# Audio Files for Toddler Learning

## Directory Structure

Place your audio files in the `public/audio/` directory with the following naming convention:

```
public/audio/
├── fruits-colors_1_word.mp3       # Apple pronunciation
├── fruits-colors_1_sentence.mp3   # "What color is the apple?"
├── fruits-colors_2_word.mp3       # Banana pronunciation
├── fruits-colors_2_sentence.mp3   # "What color are the bananas?"
├── numbers-objects_1_word.mp3     # Plane pronunciation
├── numbers-objects_1_sentence.mp3 # "How many planes do you see?"
├── animals-letters_1_word.mp3     # Letter A pronunciation
├── animals-letters_1_sentence.mp3 # "A is for alligator"
├── animals-letters_1_sound.mp3    # Animal sound (Snap!)
├── shapes_1_word.mp3              # Hexagon pronunciation
├── shapes_1_sentence.mp3          # "A hexagon has 6 sides..."
└── ...
```

## Naming Convention

**Format:** `{categoryId}_{cardId}_{audioType}.mp3`

- **categoryId**: fruits-colors, numbers-objects, animals-letters, shapes
- **cardId**: 1, 2, 3, 4... (matches the card ID from CSV)
- **audioType**: word, sentence, sound

## Audio Types

1. **word**: Pronunciation of the main word/letter
2. **sentence**: Full sentence or description
3. **sound**: Animal sounds or special audio effects

## Fallback Behavior

If an audio file is not found, the app will automatically fall back to text-to-speech synthesis, ensuring the learning experience continues seamlessly.

## Audio Sync Features

- **Text Highlighting**: Text glows with golden background while audio plays
- **Synchronized Playback**: Audio files are synced with text highlighting
- **Auto-Play Integration**: Audio files work with the auto-slideshow feature
- **Manual Controls**: Users can tap audio buttons to play specific sounds

## Technical Requirements

- **Format**: MP3 (recommended)
- **Quality**: 44.1kHz, 16-bit minimum
- **Duration**: Keep sentences under 10 seconds for optimal UX
- **Volume**: Normalize all files to consistent levels
- **Child-Friendly**: Clear pronunciation, appropriate pace

## Example File Names

```
fruits-colors_1_word.mp3          → "Apple"
fruits-colors_1_sentence.mp3      → "What color is the apple?"
animals-letters_1_word.mp3        → "A"
animals-letters_1_sentence.mp3    → "A is for alligator"
animals-letters_1_sound.mp3       → "Snap, snap!"
```