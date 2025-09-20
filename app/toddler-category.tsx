import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { getAudioAsset, getCloudinaryAudioAsset } from '../data/audioAssets';
import { loadToddlerCards } from '../data/loadToddlers';
import "../global.css";
import { TODDLER_CATEGORIES, ToddlerCard } from '../types/toddlerTypes';
import RemoteLogger from '../utils/RemoteLogger';
import { ProgressTracker } from '../utils/progressTracker';

// Import the image resolver
import { resolveAnimalImage } from '../data/cards';

// Function to get letter images from online source
const getLetterImage = (letter: string) => {
  // Using dummyimage.com which is reliable for generating text images
  return { uri: `https://dummyimage.com/600x600/FFD700/000000&text=${encodeURIComponent(letter.toUpperCase())}` };
};

// Function to get animal images from local assets
const getAnimalImage = (animalName: string) => {
  return resolveAnimalImage(animalName);
};

export default function ToddlerCategoryPage() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const [cards, setCards] = useState<ToddlerCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);

  // Animated values for text highlighting
  const highlightAnimation = useSharedValue(0);
  const highlightColor = useSharedValue(0);

  // Create animated style for smooth highlighting
  const animatedHighlightStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      highlightAnimation.value,
      [0, 1],
      ['transparent', '#FFD700'] // Transparent to yellow
    );
    
    const shadowOpacity = highlightAnimation.value * 0.5; // 0 to 0.5 opacity for shadow
    
    return {
      backgroundColor,
      shadowOpacity,
      transform: [{ scale: 1 + (highlightAnimation.value * 0.05) }], // Subtle scale animation
    };
  });

  // Create animated style for text color transition
  const animatedTextStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      highlightColor.value,
      [0, 1],
      ['#4B5563', '#1F2937'] // Gray to darker gray
    );
    
    return {
      color: textColor,
    };
  });

  // Create wrapper for setCurrentIndex to sync with ref
  const setCurrentIndexWithRef = (index: number) => {
    console.log(`📍 Setting currentIndex to: ${index}`);
    setCurrentIndex(index);
    currentIndexRef.current = index;
  };
  
  // Save last accessed category when component mounts
  useEffect(() => {
    if (categoryId) {
      // Save this as the last accessed category
      AsyncStorage.setItem('toddler_last_category', categoryId);
      
      // Also save as the last visited product for unified continue functionality
      AsyncStorage.setItem('studykey_last_visited', JSON.stringify({
        type: 'toddler',
        id: categoryId,
        timestamp: Date.now()
      }));
    }
  }, [categoryId]);

  const [isLoading, setIsLoading] = useState(true);
  const [showBack, setShowBack] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const isAutoPlayingRef = useRef(false);

  // Create a wrapper for setIsAutoPlaying to add debugging and sync ref
  const setIsAutoPlayingWithDebug = (value: boolean) => {
    console.log(`🎛️ Setting isAutoPlaying to: ${value}`);
    console.trace('Stack trace for isAutoPlay change:');
    setIsAutoPlaying(value);
    isAutoPlayingRef.current = value;
  };
  const [autoPlayInterval, setAutoPlayInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoPlayStep, setAutoPlayStep] = useState<'front' | 'front-sentence' | 'back' | 'back-sentence'>('front');
  const autoPlayStepRef = useRef<'front' | 'front-sentence' | 'back' | 'back-sentence'>('front');

  // Auto play state persistence
  const [pausedAutoPlayState, setPausedAutoPlayState] = useState<{
    cardIndex: number;
    step: 'front' | 'front-sentence' | 'back' | 'back-sentence';
    showBack: boolean;
  } | null>(null);

  // Create wrapper for setAutoPlayStep to sync with ref
  const setAutoPlayStepWithRef = (step: 'front' | 'front-sentence' | 'back' | 'back-sentence') => {
    console.log(`🎯 Setting autoPlayStep to: ${step}`);
    setAutoPlayStep(step);
    autoPlayStepRef.current = step;
  };

  const category = TODDLER_CATEGORIES.find(cat => cat.id === categoryId);

  // Handle hardware back button (Android only)
  useEffect(() => {
    // Only register back handler on Android
    if (Platform.OS !== 'android') {
      return;
    }

    const onBackPress = () => {
      console.log('🔙 Hardware back button pressed, force stopping auto play');

      // Force stop auto play and cleanup
      if (isAutoPlayingRef.current) {
        stopAutoPlay();

        // Additional cleanup for any lingering audio
        if (currentSound) {
          currentSound.unloadAsync().catch(console.warn);
          setCurrentSound(null);
        }

        // Stop any ongoing TTS
        Speech.stop();

        // Reset all audio states
        setIsPlayingAudio(false);
        setHighlightedText('');

        // Clear any intervals that might be running
        if (autoPlayInterval) {
          clearInterval(autoPlayInterval);
          setAutoPlayInterval(null);
        }
      }

      // Let the default back behavior happen
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      backHandler.remove();
    };
  }, [isAutoPlayingRef, currentSound, autoPlayInterval]);

  useEffect(() => {
    if (categoryId) {
      loadCards();
    }
  }, [categoryId]);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const loadedCards = await loadToddlerCards(categoryId!);
      setCards(loadedCards);
      
      // After loading cards, check if we should load progress
      const savedIndex = await ProgressTracker.loadProgress(categoryId!);
      if (savedIndex !== null && savedIndex > 0 && savedIndex < loadedCards.length) {
        console.log(`🔄 Auto-loading progress for ${categoryId}: card ${savedIndex + 1}`);
        setCurrentIndexWithRef(savedIndex);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Progress tracking useEffect
  useEffect(() => {
    const loadProgress = async () => {
      if (!categoryId) return;
      
      try {
        const savedIndex = await ProgressTracker.loadProgress(categoryId);
        
        // Ensure saved index is within valid bounds
        if (savedIndex !== null && savedIndex > 0 && savedIndex < cards.length) {
          console.log(`🔄 Loaded progress for ${categoryId}: card ${savedIndex + 1}`);
          setCurrentIndexWithRef(savedIndex);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };

    // Load progress when cards are loaded
    if (cards.length > 0) {
      loadProgress();
    }
  }, [categoryId, cards.length]);

  // Save progress whenever currentIndex changes
  useEffect(() => {
    const saveProgress = async () => {
      if (!categoryId || cards.length === 0) return;
      await ProgressTracker.saveProgress(categoryId, currentIndex);
    };

    saveProgress();
  }, [currentIndex, categoryId, cards.length]);

  // Handle back button press with progress saving
  const handleGoBack = () => {
    console.log('🔙 Going back, force stopping auto play');

    // Force stop auto play and cleanup (always call stopAutoPlay)
    stopAutoPlay();

    // Additional cleanup for any lingering audio
    if (currentSound) {
      currentSound.unloadAsync().catch(console.warn);
      setCurrentSound(null);
    }

    // Stop any ongoing TTS
    Speech.stop();

    // Reset all audio states
    setIsPlayingAudio(false);
    setHighlightedText('');

    // Clear any intervals that might be running
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }

    router.back();
  };

  const startAutoPlay = () => {
    if (isAutoPlaying || cards.length === 0) {
      console.log('Cannot start auto play: already playing or no cards loaded');
      return;
    }

    console.log(`Starting auto play with ${cards.length} cards`);

    // Check if we have saved state to resume from
    if (pausedAutoPlayState) {
      console.log('🔄 Resuming auto play from saved state:', pausedAutoPlayState);

      // Restore saved state
      setCurrentIndexWithRef(pausedAutoPlayState.cardIndex);
      setShowBack(pausedAutoPlayState.showBack);
      setAutoPlayStepWithRef(pausedAutoPlayState.step);

      // Clear saved state
      setPausedAutoPlayState(null);

      const currentCard = cards[pausedAutoPlayState.cardIndex];
      console.log(`Resuming card: ${currentCard?.front.text || currentCard?.back.text}, step: ${pausedAutoPlayState.step}`);
    } else {
      console.log('Starting auto play from beginning');
      setAutoPlayStepWithRef('front');
      setShowBack(false);
    }

    // Set auto play state
    setIsAutoPlayingWithDebug(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Start playing from current state
    setTimeout(() => {
      proceedWithCurrentStep();
    }, 300);
  };

  // Function to proceed with current step (used for resuming)
  const proceedWithCurrentStep = () => {
    if (!isAutoPlayingRef.current) {
      console.log('❌ Auto play stopped, not proceeding');
      return;
    }

    const currentCard = cards[currentIndexRef.current];
    const currentStep = autoPlayStepRef.current;

    console.log(`🎬 Proceeding with current step: ${currentStep} for card ${currentCard?.id}`);

    switch (currentStep) {
      case 'front':
        if (currentCard?.front.text) {
          playAutoAudio('word', currentCard.front.text, currentCard.id);
        }
        break;

      case 'front-sentence':
        if (currentCard?.front.sentence) {
          playAutoAudio('sentence', currentCard.front.sentence, currentCard.id);
        }
        break;

      case 'back':
        if (currentCard?.back.text) {
          const audioType = categoryId === 'animals-letters' ? 'animal' : 'word';
          playAutoAudio(audioType as any, currentCard.back.text, currentCard.id);
        }
        break;

      case 'back-sentence':
        if (currentCard?.back.sentence) {
          const sentenceAudioType = categoryId === 'animals-letters' ? 'animal_sentence' : 'sentence';
          playAutoAudio(sentenceAudioType as any, currentCard.back.sentence, currentCard.id);
        }
        break;

      default:
        console.log(`Unknown step: ${currentStep}`);
        break;
    }
  };

  const stopAutoPlay = () => {
    console.log('🛑 Stopping auto play');

    // Save current state for resuming later, but only if we're not at the end
    if (isAutoPlayingRef.current && currentIndexRef.current < cards.length - 1) {
      const currentState = {
        cardIndex: currentIndexRef.current,
        step: autoPlayStepRef.current,
        showBack: showBack
      };
      setPausedAutoPlayState(currentState);
      console.log('💾 Saved auto play state:', currentState);
    } else if (isAutoPlayingRef.current) {
      // Clear saved state when we're at the end
      setPausedAutoPlayState(null);
      console.log('🧹 Cleared auto play state at end of cards');
    }

    // Stop any intervals
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }

    // Update state and refs
    setIsAutoPlayingWithDebug(false);
    setIsPlayingAudio(false);
    setHighlightedText('');

    // Stop any currently playing audio
    if (currentSound) {
      currentSound.unloadAsync().catch(console.warn);
      setCurrentSound(null);
    }

    // Stop any ongoing TTS
    Speech.stop();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  };

  // Auto play audio function that waits for completion
  const playAutoAudio = async (audioType: 'word' | 'sentence' | 'animal' | 'animal_sentence', text: string, cardId: number) => {
    console.log(`🎧 Auto play audio: ${audioType} for card ${cardId}, text: "${text}", step: ${autoPlayStep}`);
    
    // Enhanced device logging for APK debugging
    await RemoteLogger.log(`🎧 Audio Request: ${audioType} for card ${cardId}`, {
      text,
      step: autoPlayStep,
      categoryId,
      isAutoPlaying: isAutoPlayingRef.current,
      platform: require('react-native').Platform.OS,
      isDev: __DEV__
    });

    setIsPlayingAudio(true);

    // Start smooth highlighting animation
    highlightAnimation.value = withTiming(1, { duration: 300, easing: Easing.inOut(Easing.quad) });
    highlightColor.value = withTiming(1, { duration: 300, easing: Easing.inOut(Easing.quad) });

    // Set highlighting based on audio type
    if (audioType === 'animal_sentence') {
      // For animal sentences, highlight the sentence text
      setHighlightedText(text);
    } else {
      // For word and sentence - highlight the text itself
      setHighlightedText(text);
    }

    const audioFileName = `${categoryId}_${cardId}_${audioType}.mp3`;
    console.log(`🎧 Looking for audio file: ${audioFileName}`);
    
    // Device logging for audio file mapping debugging
    await RemoteLogger.log(`📱 Audio file mapping: ${audioFileName}`, {
      categoryId,
      cardId,
      audioType,
      expectedFile: audioFileName
    });

    let timeoutCleared = false;

    // Safety timeout - always proceed after 4 seconds if nothing happens
    const safetyTimeout = setTimeout(() => {
      if (!timeoutCleared && isAutoPlayingRef.current) {
        console.log(`⚠️ Safety timeout triggered for: "${text}", proceeding anyway`);
        // Stop highlighting animation
        highlightAnimation.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) });
        highlightColor.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) });
        setHighlightedText('');
        setIsPlayingAudio(false);
        proceedToNextAutoStep();
        timeoutCleared = true;
      }
    }, 4000);

    try {
      // Clean up previous sound
      if (currentSound) {
        await currentSound.unloadAsync();
        setCurrentSound(null);
      }

      // Try to load audio file from assets or Cloudinary
      let audioSource = getAudioAsset(audioFileName);

      // If no local asset found, try Cloudinary URL
      if (!audioSource) {
        audioSource = getCloudinaryAudioAsset(audioFileName);
        console.log(`🌤️ Using Cloudinary URL: ${audioSource}`);
      }

      if (audioSource) {
        console.log(`✅ Found audio file: ${audioFileName}`);

        // Handle both local files (require) and URLs (string)
        const audioSourceToUse = typeof audioSource === 'string' ? { uri: audioSource } : audioSource;

        const { sound } = await Audio.Sound.createAsync(
          audioSourceToUse,
          { shouldPlay: true }
        );

        setCurrentSound(sound);

        // Wait for audio to finish, then proceed to next step
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish && !timeoutCleared && isAutoPlayingRef.current) {
            console.log(`✅ Audio finished: ${audioFileName}, ref isAutoPlaying: ${isAutoPlayingRef.current}`);
            clearTimeout(safetyTimeout);
            timeoutCleared = true;
            // Stop highlighting animation
            highlightAnimation.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) });
            highlightColor.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) });
            setHighlightedText('');
            setIsPlayingAudio(false);
            proceedToNextAutoStep();
          }
        });
      } else {
        console.log(`❌ No audio file found for: ${audioFileName}, using TTS`);
        throw new Error('Audio file not found');
      }

    } catch (error) {
      console.log(`🤖 Using TTS for: "${text}"`);
      await RemoteLogger.error(`Audio loading failed for: ${audioFileName}`, error);
      
      // Fallback to TTS with completion callback
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.2,
        rate: 0.8,
        onDone: () => {
          if (!timeoutCleared && isAutoPlayingRef.current) {
            console.log(`✅ TTS finished: "${text}", proceeding to next step`);
            clearTimeout(safetyTimeout);
            timeoutCleared = true;
            // Stop highlighting animation
            highlightAnimation.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) });
            highlightColor.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) });
            setHighlightedText('');
            setIsPlayingAudio(false);
            proceedToNextAutoStep();
          }
        },
        onError: () => {
          if (!timeoutCleared && isAutoPlayingRef.current) {
            console.log(`❌ TTS error for: "${text}", proceeding to next step anyway`);
            clearTimeout(safetyTimeout);
            timeoutCleared = true;
            // Stop highlighting animation
            highlightAnimation.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) });
            highlightColor.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) });
            setHighlightedText('');
            setIsPlayingAudio(false);
            proceedToNextAutoStep();
          }
        }
      });
    }
  };

  // Handle auto play step progression
  const proceedToNextAutoStep = () => {
    console.log(`🎬 proceedToNextAutoStep called, isAutoPlaying: ${isAutoPlaying}, ref: ${isAutoPlayingRef.current}`);
    if (!isAutoPlayingRef.current) {
      console.log('❌ Auto play stopped, not proceeding');
      return;
    }

    const currentStep = autoPlayStepRef.current;
    console.log(`🎬 Proceeding from step: ${currentStep}`);

    setTimeout(() => {
      if (!isAutoPlayingRef.current) {
        console.log('❌ Auto play stopped during timeout, not proceeding');
        return;
      }

      // Get current card data fresh from current ref (not state)
      const currentCard = cards[currentIndexRef.current];
      console.log(`🎬 Current card in proceedToNextAutoStep:`, {
        id: currentCard?.id,
        front: currentCard?.front.text,
        back: currentCard?.back.text,
        currentIndex: currentIndexRef.current,
        hasfrontSentence: !!currentCard?.front.sentence,
        hasBackSentence: !!currentCard?.back.sentence
      });

      if (currentStep === 'front') {
        // Check if there's a sentence to play after word
        if (currentCard?.front.sentence) {
          console.log('🎬 Playing front sentence');
          setAutoPlayStepWithRef('front-sentence');
          setTimeout(() => {
            if (isAutoPlayingRef.current) {
              const freshCard = cards[currentIndexRef.current];
              playAutoAudio('sentence', freshCard?.front.sentence || '', freshCard?.id || 0);
            }
          }, 800);
        } else {
          console.log('🎬 No front sentence, moving from front to back');
          // Move from front to back
          setShowBack(true);
          setAutoPlayStepWithRef('back');

          // Play back audio after a short delay
          setTimeout(() => {
            if (isAutoPlayingRef.current) {
              const freshCard = cards[currentIndexRef.current];
              if (freshCard?.back.text) {
                // For animals-letters category, use 'animal' audio type for back side
                const audioType = categoryId === 'animals-letters' ? 'animal' : 'word';
                playAutoAudio(audioType as any, freshCard.back.text, freshCard.id);
              }
            }
          }, 800);
        }

      } else if (currentStep === 'front-sentence') {
        console.log('🎬 Front sentence completed, moving from front to back');
        // Move from front to back
        setShowBack(true);
        setAutoPlayStepWithRef('back');

        // Play back audio after a short delay
        setTimeout(() => {
          if (isAutoPlayingRef.current) {
            const freshCard = cards[currentIndexRef.current];
            if (freshCard?.back.text) {
              // For animals-letters category, use 'animal' audio type for back side
              const audioType = categoryId === 'animals-letters' ? 'animal' : 'word';
              playAutoAudio(audioType as any, freshCard.back.text, freshCard.id);
            }
          }
        }, 800);

      } else if (currentStep === 'back') {
        // Check if there's a back sentence to play after word
        if (currentCard?.back.sentence) {
          console.log('🎬 Playing back sentence');
          setAutoPlayStepWithRef('back-sentence');
          setTimeout(() => {
            if (isAutoPlayingRef.current) {
              const freshCard = cards[currentIndexRef.current];
              // For animals-letters category, use 'animal_sentence' audio type for back side sentences
              const sentenceAudioType = categoryId === 'animals-letters' ? 'animal_sentence' : 'sentence';
              playAutoAudio(sentenceAudioType as any, freshCard?.back.sentence || '', freshCard?.id || 0);
            }
          }, 500);
        } else {
          console.log('🎬 No back sentence, moving to next card');
          // Move to next card
          moveToNextCard();
        }

      } else if (currentStep === 'back-sentence') {
        console.log('🎬 Back sentence completed, moving to next card');
        // Move to next card
        moveToNextCard();
      }
    }, 1000); // 1 second pause between steps
  };

  const moveToNextCard = () => {
    const nextIndex = currentIndexRef.current + 1;
    console.log(`🔄 Moving to next card: ${nextIndex}/${cards.length}`);

    if (nextIndex >= cards.length) {
      console.log('🏁 Reached end of cards, stopping auto play and showing celebration');
      // Clear saved state when completed (don't save state at the end)
      setPausedAutoPlayState(null);
      // End of cards, stop auto play
      stopAutoPlay();
      
      // Move to completion state
      setCurrentIndexWithRef(nextIndex);
      setShowBack(false);
      
      // Celebrate completion
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 100);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 300);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 500);
      
      return;
    }

    setCurrentIndexWithRef(nextIndex);
    setShowBack(false);
    setAutoPlayStepWithRef('front');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Start playing the next card after a short delay
    setTimeout(() => {
      const nextCard = cards[nextIndex];
      if (nextCard?.front.text) {
        console.log(`🎬 Starting next card: ${nextCard.front.text}`);
        playAutoAudio('word', nextCard.front.text, nextCard.id);
      }
    }, 1500);
  };

  const handleNextCard = () => {
    // If we're on the last card, move to the completion state
    if (currentIndex === cards.length - 1) {
      // Move to the completion state
      setCurrentIndexWithRef(currentIndex + 1);
      setShowBack(false);
      
      // Celebrate completion
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 100);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 300);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 500);
    } 
    // Otherwise, move to the next card normally
    else if (currentIndex < cards.length - 1) {
      // Stop auto play on manual navigation
      if (isAutoPlaying) {
        console.log('👆 Manual next card, stopping auto play');
        stopAutoPlay();
      }

      // Clear saved state since user manually navigated
      setPausedAutoPlayState(null);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentIndexWithRef(currentIndex + 1);
      setShowBack(false);
    }
  };

  const handlePreviousCard = () => {
    if (currentIndex > 0) {
      // Stop auto play on manual navigation
      if (isAutoPlaying) {
        console.log('👇 Manual previous card, stopping auto play');
        stopAutoPlay();
      }

      // Clear saved state since user manually navigated
      setPausedAutoPlayState(null);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentIndexWithRef(currentIndex - 1);
      setShowBack(false);
    }
  };

  const handleFlipCard = () => {
    // Stop auto play on manual card flip
    if (isAutoPlaying) {
      console.log('🔄 Manual card flip, stopping auto play');
      stopAutoPlay();
    }

    // Clear saved state since user manually flipped
    setPausedAutoPlayState(null);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowBack(!showBack);
  };

  const handleSpeakText = (text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.2,
      rate: 0.8,
      voice: undefined
    });
  };

  const playAudioWithHighlight = async (audioType: 'word' | 'sentence' | 'animal' | 'animal_sentence', text: string, cardId: number) => {
    if (isPlayingAudio) return;

    setIsPlayingAudio(true);

    // Start smooth highlighting animation
    highlightAnimation.value = withTiming(1, { duration: 300, easing: Easing.inOut(Easing.quad) });
    highlightColor.value = withTiming(1, { duration: 300, easing: Easing.inOut(Easing.quad) });

    // Set highlighting based on audio type
    if (audioType === 'animal_sentence') {
      // For animal sentences, highlight the sentence text
      setHighlightedText(text);
    } else {
      // For word and sentence - highlight the text itself
      setHighlightedText(text);
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const audioFileName = `${categoryId}_${cardId}_${audioType}.mp3`;

    console.log(`Trying to load audio: ${audioFileName}`);

    try {
      // Clean up previous sound
      if (currentSound) {
        await currentSound.unloadAsync();
        setCurrentSound(null);
      }

      // Try to load audio file from assets or Cloudinary
      let audioSource = getAudioAsset(audioFileName);

      // If no local asset found, try Cloudinary URL
      if (!audioSource) {
        audioSource = getCloudinaryAudioAsset(audioFileName);
        console.log(`🌤️ Using Cloudinary URL: ${audioSource}`);
      }

      if (audioSource) {
        console.log(`✅ Found audio: ${audioFileName}`);

        // Handle both local files (require) and URLs (string)
        const audioSourceToUse = typeof audioSource === 'string' ? { uri: audioSource } : audioSource;

        const { sound } = await Audio.Sound.createAsync(
          audioSourceToUse,
          { shouldPlay: true }
        );

        setCurrentSound(sound);

        // Listen for playback status
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            // Stop highlighting animation
            highlightAnimation.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) });
            highlightColor.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) });
            setHighlightedText('');
            setIsPlayingAudio(false);
          }
        });

        console.log(`Successfully loaded audio: ${audioFileName}`);

      }
    } catch (error) {
      // Fallback to TTS if audio file not found
      console.log(`Audio file ${audioFileName} not found, falling back to TTS`);
      console.error('Audio loading error:', error);

      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.2,
        rate: 0.8,
        onDone: () => {
          // Stop highlighting animation
          highlightAnimation.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) });
          highlightColor.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) });
          setHighlightedText('');
          setIsPlayingAudio(false);
        },
        onError: () => {
          // Stop highlighting animation
          highlightAnimation.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) });
          highlightColor.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) });
          setHighlightedText('');
          setIsPlayingAudio(false);
        }
      });
    }
  };

  // Separate rendering function for words with optimized sizing
  const renderWordText = (text: string, isHighlighted: boolean) => {
    const baseClasses = "font-semibold text-gray-800 text-center text-5xl";
    
    if (isHighlighted) {
      return (
        <Animated.View 
          className="rounded-lg px-4 py-3 my-2 shadow-md"
          style={animatedHighlightStyle}
        >
          <Animated.Text 
            className={`${baseClasses} font-comic`}
            style={[{ fontFamily: 'ComicSansMSBold', lineHeight: 60 }, animatedTextStyle]}
          >
            {text}
          </Animated.Text>
        </Animated.View>
      );
    }
    
    return (
      <Text 
        className={`${baseClasses} font-comic my-2`}
        style={{ fontFamily: 'ComicSansMSBold', lineHeight: 60 }}
      >
        {text}
      </Text>
    );
  };

  // Separate rendering function for sentences with proper wrapping and scrolling
  const renderSentenceText = (text: string, isHighlighted: boolean) => {
    const baseClasses = "font-semibold text-gray-800 text-center text-3xl";
    
    if (isHighlighted) {
      return (
        <Animated.View 
          className="rounded-lg px-4 py-3 my-2 shadow-md w-full"
          style={[animatedHighlightStyle, { maxHeight: 120 }]}
        >
          <Animated.Text 
            className={`${baseClasses} font-comic`}
            style={[
              { fontFamily: 'ComicSansMSBold', lineHeight: 40, flexWrap: 'wrap' }, 
              animatedTextStyle
            ]}
          >
            {text}
          </Animated.Text>
        </Animated.View>
      );
    }
    
    return (
      <Text 
        className={`${baseClasses} font-comic my-2`}
        style={{ fontFamily: 'ComicSansMSBold', lineHeight: 40, flexWrap: 'wrap' }}
      >
        {text}
      </Text>
    );
  };

  const handleRestart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Clear saved state when restarting
    setPausedAutoPlayState(null);

    setCurrentIndexWithRef(0);
    setShowBack(false);
    
    // Clear progress for this category
    if (categoryId) {
      ProgressTracker.clearProgress(categoryId);
    }
  };

  // Celebrate completion with haptic feedback
  useEffect(() => {
    if (currentIndex >= cards.length && cards.length > 0) {
      // Stop auto play when completed
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        setAutoPlayInterval(null);
        setIsAutoPlayingWithDebug(false);
      }

      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 100);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 300);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 500);
    }
  }, [currentIndex, cards.length, autoPlayInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, cleaning up auto play');
      // Stop auto play and clean up resources
      if (isAutoPlayingRef.current) {
        Speech.stop();
      }

      if (currentSound) {
        currentSound.unloadAsync().catch(console.warn);
      }

      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    };
  }, []);

  if (!category) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg text-gray-800 mb-5">Category not found</Text>
        <TouchableOpacity onPress={handleGoBack} className="py-2 px-4 bg-white rounded-full shadow">
          <Text className="text-base text-gray-800 font-semibold">← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <LinearGradient colors={category.gradient} className="flex-1">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-lg text-white mt-5">Loading {category.name}...</Text>
        </View>
      </LinearGradient>
    );
  }

  const currentCard = cards[currentIndex];
  const isCompleted = currentIndex >= cards.length;

  return (
    <LinearGradient colors={category.gradient} className="flex-1">
      <View className="pt-16 px-5 pb-5 flex-row items-center justify-between">
        <TouchableOpacity onPress={handleGoBack} className="py-2 px-3 bg-white/20 rounded-full">
          <Text className="text-base text-white font-semibold">← Back</Text>
        </TouchableOpacity>
        <View className="items-center flex-1">
          <Text className="text-2xl mb-1">{category.icon}</Text>
          <Text className="text-lg font-semibold text-white font-comic">{category.name}</Text>
        </View>
        <TouchableOpacity
          onPress={toggleAutoPlay}
          className={`w-12 h-12 rounded-full bg-white/20 justify-center items-center border-2 ${isAutoPlaying ? 'bg-orange-500 border-white' : 'border-white/30'}`}
        >
          <Text className="text-xl text-white">{isAutoPlaying ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>
      </View>

      <View className="px-5 mb-5">
        <View className="flex-row justify-between items-center mb-2.5">
          <Text className="text-base text-white font-semibold">
            Card {currentIndex + 1} of {cards.length}
          </Text>
          {isAutoPlaying && (
            <View className="bg-orange-500/80 px-3 py-1 rounded-full">
              <Text className="text-xs text-white font-bold">🎥 Auto Play</Text>
            </View>
          )}
        </View>
        <View className="h-2 bg-white/30 rounded-full overflow-hidden">
          <View
            className="h-full bg-white rounded-full"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </View>
      </View>

      {isCompleted ? (
        <View className="flex-1 justify-center items-center px-10">
          <Text className="text-6xl mb-5">🎉</Text>
          <Text className="text-4xl font-bold text-white text-center mb-3">Great Job!</Text>
          <Text className="text-lg text-white text-center leading-6 mb-10">
            You've completed all {cards.length} cards in {category.name}!
          </Text>
          <TouchableOpacity onPress={handleRestart} className="bg-white/20 rounded-full py-3.5 px-7 border-2 border-white">
            <Text className="text-lg text-white font-bold">Play Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Use flex-1 to take all available space between progress bar and nav buttons
        <View className="flex-1 justify-center px-5 mb-5">
          {currentCard && (
            <TouchableOpacity
              onPress={isAutoPlaying ? undefined : handleFlipCard}
              activeOpacity={isAutoPlaying ? 1 : 0.8}
              className="items-center h-full"
            >
              {/* Card takes full available height */}
              <View className="bg-[#ffc842] rounded-2xl w-full max-w-[350px] h-full shadow-lg overflow-hidden">
                {!showBack ? (
                  // Front side - 60% image, 40% content
                  <>
                    {/* Image container - 60% of card height */}
                    <View className="h-3/5 w-full items-center justify-center">
                      <Image 
                        source={getLetterImage(currentCard.front.text)} 
                        className="w-full h-full" 
                        resizeMode="contain" 
                      />
                    </View>
                    
                    {/* Content container - 40% of card height */}
                    <View className="h-2/5 w-full flex-col justify-around">
                      <View className="justify-center items-center">
                        <View className="bg-[#ffd886] w-full py-2">
                          {renderWordText(
                            currentCard.front.text, 
                            highlightedText === currentCard.front.text
                          )}
                        </View>
                      </View>
                     
                      {currentCard.front.sentence && (
                        <View className="mb-3 p-3 items-center">
                          {renderSentenceText(
                            currentCard.front.sentence, 
                            highlightedText === currentCard.front.sentence
                          )}
                        </View>
                      )}

                      {!isAutoPlaying && (
                        <View className="flex-row flex-wrap justify-center gap-2">
                          <TouchableOpacity
                            onPress={() => playAudioWithHighlight('word', currentCard.front.text, currentCard.id)}
                            className="bg-orange-500 rounded-full py-2 px-3"
                            disabled={isPlayingAudio}
                          >
                            <Text className="text-xs text-white font-bold text-center">🔊 Say</Text>
                          </TouchableOpacity>
                          {currentCard.front.sentence && (
                            <TouchableOpacity
                              onPress={() => playAudioWithHighlight('sentence', currentCard.front.sentence!, currentCard.id)}
                              className="bg-orange-500 rounded-full py-2 px-3"
                              disabled={isPlayingAudio}
                            >
                              <Text className="text-xs text-white font-bold text-center">🗣️ Sentence</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}

                      <Text className="text-xs text-gray-400 text-center italic mt-2">
                        {isAutoPlaying ? 'Auto Play Active 🎥' : 'Tap card to see answer'}
                      </Text>
                    </View>
                  </>
                ) : (
                  // Back side - 60% image, 40% content
                  <>
                    {/* Image container - 60% of card height */}
                    <View className="h-3/5 w-full items-center justify-center">
                      <Image 
                        source={getAnimalImage(currentCard.back.text)} 
                        className="w-full h-full" 
                        resizeMode="contain" 
                      />
                    </View>
                    
                    {/* Content container - 40% of card height */}
                    <View className="h-2/5 w-full  flex-col justify-around">
                      <View className="justify-center items-center">
                        <View className="bg-[#ffd886] w-full py-2">
                          {renderWordText(
                            currentCard.back.text, 
                            highlightedText === currentCard.back.text
                          )}
                        </View>
                      </View>
                     
                      {currentCard.back.sentence && (
                        <View className="mb-3 p-3 items-center">
                          {renderSentenceText(
                            currentCard.back.sentence, 
                            highlightedText === currentCard.back.sentence
                          )}
                        </View>
                      )}

                      {!isAutoPlaying && (
                        <View className="flex-row flex-wrap justify-center gap-2">
                          <TouchableOpacity
                            onPress={() => {
                              // For animals-letters category, use 'animal' audio type for back side
                              const audioType = categoryId === 'animals-letters' ? 'animal' : 'word';
                              playAudioWithHighlight(audioType as any, currentCard.back.text, currentCard.id);
                            }}
                            className="bg-orange-500 rounded-full py-2 px-3"
                            disabled={isPlayingAudio}
                          >
                            <Text className="text-xs text-white font-bold text-center">🔊 Say</Text>
                          </TouchableOpacity>
                          {currentCard.back.sentence && (
                            <TouchableOpacity
                              onPress={() => {
                                // For animals-letters category, use 'animal_sentence' audio type for back side sentences
                                const sentenceAudioType = categoryId === 'animals-letters' ? 'animal_sentence' : 'sentence';
                                playAudioWithHighlight(sentenceAudioType as any, currentCard.back.sentence!, currentCard.id);
                              }}
                              className="bg-orange-500 rounded-full py-2 px-3"
                              disabled={isPlayingAudio}
                            >
                              <Text className="text-xs text-white font-bold text-center">🗣️ Sentence</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!isCompleted && (
        <View className="flex-row justify-between items-center px-5 pb-10">
          <TouchableOpacity
            onPress={handlePreviousCard}
            disabled={currentIndex === 0 || isAutoPlaying}
            className={`py-3 px-5 bg-white/20 rounded-full min-w-[100px] items-center ${currentIndex === 0 || isAutoPlaying ? 'bg-white/10' : ''}`}
          >
            <Text className={`text-base text-white font-semibold ${currentIndex === 0 || isAutoPlaying ? 'text-white/50' : ''}`}>← Previous</Text>
          </TouchableOpacity>

          {!isAutoPlaying && (
            <TouchableOpacity
              onPress={toggleAutoPlay}
              className="bg-orange-500 rounded-full py-3 px-5 items-center"
            >
              <Text className="text-sm text-white font-bold">🎥 Auto Play</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleNextCard}
            disabled={isAutoPlaying}
            className={`py-3 px-5 bg-white/20 rounded-full min-w-[100px] items-center ${isAutoPlaying ? 'bg-white/10' : ''}`}
          >
            <Text className={`text-base text-white font-semibold ${isAutoPlaying ? 'text-white/50' : ''}`}>
              {currentIndex === cards.length - 1 ? 'Finish ✓' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}