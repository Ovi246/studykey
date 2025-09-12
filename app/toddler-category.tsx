import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAudioAsset, getCloudinaryAudioAsset } from '../data/audioAssets';
import { loadToddlerCards } from '../data/loadToddlers';
import { TODDLER_CATEGORIES, ToddlerCard } from '../types/toddlerTypes';
import RemoteLogger from '../utils/RemoteLogger';

export default function ToddlerCategoryPage() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const [cards, setCards] = useState<ToddlerCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);

  // Create wrapper for setCurrentIndex to sync with ref
  const setCurrentIndexWithRef = (index: number) => {
    console.log(`📍 Setting currentIndex to: ${index}`);
    setCurrentIndex(index);
    currentIndexRef.current = index;
  };
  const [isLoading, setIsLoading] = useState(true);
  const [showBack, setShowBack] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const isAutoPlayingRef = useRef(false);

  // Create a wrapper for setIsAutoPlaying to add debugging and sync ref
  const setIsAutoPlayingWithDebug = (value: boolean) => {
    console.log(`🎛️ Setting isAutoPlaying to: ${value}`);
    console.trace('Stack trace for isAutoPlaying change:');
    setIsAutoPlaying(value);
    isAutoPlayingRef.current = value;
  };
  const [autoPlayInterval, setAutoPlayInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoPlayStep, setAutoPlayStep] = useState<'front' | 'front-sentence' | 'front-pronunciation' | 'back' | 'back-sentence' | 'back-pronunciation'>('front');
  const autoPlayStepRef = useRef<'front' | 'front-sentence' | 'front-pronunciation' | 'back' | 'back-sentence' | 'back-pronunciation'>('front');

  // Auto play state persistence
  const [pausedAutoPlayState, setPausedAutoPlayState] = useState<{
    cardIndex: number;
    step: 'front' | 'front-sentence' | 'front-pronunciation' | 'back' | 'back-sentence' | 'back-pronunciation';
    showBack: boolean;
  } | null>(null);

  // Create wrapper for setAutoPlayStep to sync with ref
  const setAutoPlayStepWithRef = (step: 'front' | 'front-sentence' | 'front-pronunciation' | 'back' | 'back-sentence' | 'back-pronunciation') => {
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
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

      case 'front-pronunciation':
        if (currentCard?.front.text) {
          playAutoAudio('pronunciation', currentCard.front.text, currentCard.id);
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

      case 'back-pronunciation':
        if (currentCard?.back.text) {
          const pronunciationAudioType = categoryId === 'animals-letters' ? 'animal_pronunciation' : 'pronunciation';
          playAutoAudio(pronunciationAudioType as any, currentCard.back.text, currentCard.id);
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

    // Save current state for resuming later
    if (isAutoPlayingRef.current) {
      const currentState = {
        cardIndex: currentIndexRef.current,
        step: autoPlayStepRef.current,
        showBack: showBack
      };
      setPausedAutoPlayState(currentState);
      console.log('💾 Saved auto play state:', currentState);
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
  const playAutoAudio = async (audioType: 'word' | 'sentence' | 'pronunciation' | 'animal' | 'animal_sentence' | 'animal_pronunciation', text: string, cardId: number) => {
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

    // Set highlighting based on audio type
    if (audioType === 'pronunciation') {
      // For front pronunciation, highlight the pronunciation text itself
      setHighlightedText(`[${text.toLowerCase()}]`);
    } else if (audioType === 'animal_pronunciation') {
      // For back pronunciation, highlight the pronunciation text itself
      setHighlightedText(`[${text.toLowerCase()}]`);
    } else {
      // For word, sentence, animal - highlight the text itself
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
        hasBackSentence: !!currentCard?.back.sentence,
        hasPronunciation: true // Always true for animals-letters
      });

      if (currentStep === 'front') {
        // Play front pronunciation right after word
        console.log('🎬 Playing front pronunciation');
        setAutoPlayStepWithRef('front-pronunciation');
        setTimeout(() => {
          if (isAutoPlayingRef.current) {
            const freshCard = cards[currentIndexRef.current];
            playAutoAudio('pronunciation', freshCard?.front.text || '', freshCard?.id || 0);
          }
        }, 800);

      } else if (currentStep === 'front-pronunciation') {
        // Check if there's a sentence to play after pronunciation
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
        // Play back pronunciation right after back word
        console.log('🎬 Playing back pronunciation');
        setAutoPlayStepWithRef('back-pronunciation');
        setTimeout(() => {
          if (isAutoPlayingRef.current) {
            const freshCard = cards[currentIndexRef.current];
            // For animals-letters category, use 'animal_pronunciation' audio type for back side pronunciations
            const pronunciationAudioType = categoryId === 'animals-letters' ? 'animal_pronunciation' : 'pronunciation';
            playAutoAudio(pronunciationAudioType as any, freshCard?.back.text || '', freshCard?.id || 0);
          }
        }, 500);

      } else if (currentStep === 'back-pronunciation') {
        // Check if there's a back sentence to play after pronunciation
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

      } else if (currentStep === 'back-pronunciation') {
        console.log('🎬 Back pronunciation completed, moving to next card');
        // Move to next card
        moveToNextCard();
      }
    }, 1000); // 1 second pause between steps
  };

  const moveToNextCard = () => {
    const nextIndex = currentIndexRef.current + 1;
    console.log(`🔄 Moving to next card: ${nextIndex}/${cards.length}`);

    if (nextIndex >= cards.length) {
      console.log('🏁 Reached end of cards, stopping auto play');
      // Clear saved state when completed
      setPausedAutoPlayState(null);
      // End of cards, stop auto play
      stopAutoPlay();
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
    if (currentIndex < cards.length - 1) {
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

  const playAudioWithHighlight = async (audioType: 'word' | 'sentence' | 'pronunciation' | 'animal' | 'animal_sentence' | 'animal_pronunciation', text: string, cardId: number) => {
    if (isPlayingAudio) return;

    setIsPlayingAudio(true);

    // Set highlighting based on audio type
    if (audioType === 'pronunciation') {
      // For front pronunciation, highlight the pronunciation text itself
      setHighlightedText(`[${text.toLowerCase()}]`);
    } else if (audioType === 'animal_pronunciation') {
      // For back pronunciation, highlight the pronunciation text itself
      setHighlightedText(`[${text.toLowerCase()}]`);
    } else {
      // For word, sentence, animal - highlight the text itself
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
          setHighlightedText('');
          setIsPlayingAudio(false);
        },
        onError: () => {
          setHighlightedText('');
          setIsPlayingAudio(false);
        }
      });
    }
  };

  const renderHighlightedText = (text: string, isHighlighted: boolean, textStyle = styles.cardMainText) => {
    if (!isHighlighted) {
      return <Text style={textStyle}>{text}</Text>;
    }

    return (
      <View style={styles.highlightedTextContainer}>
        <Text style={[textStyle, styles.highlightedText]}>{text}</Text>
      </View>
    );
  };

  const handleRestart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Clear saved state when restarting
    setPausedAutoPlayState(null);

    setCurrentIndexWithRef(0);
    setShowBack(false);
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
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Category not found</Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <LinearGradient colors={category.gradient} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading {category.name}...</Text>
        </View>
      </LinearGradient>
    );
  }

  const currentCard = cards[currentIndex];
  const isCompleted = currentIndex >= cards.length;

  return (
    <LinearGradient colors={category.gradient} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={styles.categoryName}>{category.name}</Text>
        </View>
        <TouchableOpacity
          onPress={toggleAutoPlay}
          style={[styles.autoPlayButton, isAutoPlaying && styles.autoPlayButtonActive]}
        >
          <Text style={styles.autoPlayButtonText}>
            {isAutoPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Card {currentIndex + 1} of {cards.length}
          </Text>
          {isAutoPlaying && (
            <View style={styles.autoPlayIndicator}>
              <Text style={styles.autoPlayIndicatorText}>🎥 Auto Play</Text>
            </View>
          )}
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / cards.length) * 100}%` }
            ]}
          />
        </View>
      </View>

      {isCompleted ? (
        <View style={styles.completionContainer}>
          <Text style={styles.completionIcon}>🎉</Text>
          <Text style={styles.completionTitle}>Great Job!</Text>
          <Text style={styles.completionText}>
            You've completed all {cards.length} cards in {category.name}!
          </Text>
          <TouchableOpacity onPress={handleRestart} style={styles.restartButton}>
            <Text style={styles.restartButtonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cardContainer}>
          {currentCard && (
            <TouchableOpacity
              onPress={isAutoPlaying ? undefined : handleFlipCard}
              activeOpacity={isAutoPlaying ? 1 : 0.8}
              style={styles.flashcardWrapper}
            >
              <View style={[styles.flashcard, showBack && styles.flashcardFlipped]}>
                {!showBack ? (
                  <View style={styles.cardContent}>
                    {renderHighlightedText(currentCard.front.text, highlightedText === currentCard.front.text)}
                    {/* Show pronunciation for letter - dynamically create it */}
                    <View style={styles.pronunciationContainer}>
                      <Text style={[
                        styles.cardPronunciation,
                        highlightedText === `[${currentCard.front.text.toLowerCase()}]` && styles.highlightedText
                      ]}>
                        [{currentCard.front.text.toLowerCase()}]
                      </Text>
                    </View>
                    {currentCard.front.sentence && (
                      renderHighlightedText(
                        currentCard.front.sentence,
                        highlightedText === currentCard.front.sentence,
                        styles.cardSentence
                      )
                    )}

                    {!isAutoPlaying && (
                      <View style={styles.audioButtons}>
                        <TouchableOpacity
                          onPress={() => playAudioWithHighlight('word', currentCard.front.text, currentCard.id)}
                          style={styles.audioButton}
                          disabled={isPlayingAudio}
                        >
                          <Text style={styles.audioButtonText}>🔊 Say Word</Text>
                        </TouchableOpacity>
                        {currentCard.front.sentence && (
                          <TouchableOpacity
                            onPress={() => playAudioWithHighlight('sentence', currentCard.front.sentence!, currentCard.id)}
                            style={styles.audioButton}
                            disabled={isPlayingAudio}
                          >
                            <Text style={styles.audioButtonText}>🗣️ Say Sentence</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => playAudioWithHighlight('pronunciation', currentCard.front.text, currentCard.id)}
                          style={styles.audioButton}
                          disabled={isPlayingAudio}
                        >
                          <Text style={styles.audioButtonText}>🔠 Pronunciation</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <Text style={styles.tapHint}>
                      {isAutoPlaying ? 'Auto Play Active 🎥' : 'Tap card to see answer'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.cardContent}>
                    {renderHighlightedText(currentCard.back.text, highlightedText === currentCard.back.text)}
                    {/* Show pronunciation for animal - dynamically create it */}
                    <View style={styles.pronunciationContainer}>
                      <Text style={[
                        styles.cardPronunciation,
                        highlightedText === `[${currentCard.back.text.toLowerCase()}]` && styles.highlightedText
                      ]}>
                        [{currentCard.back.text.toLowerCase()}]
                      </Text>
                    </View>
                    {currentCard.back.sentence && (
                      renderHighlightedText(
                        currentCard.back.sentence,
                        highlightedText === currentCard.back.sentence,
                        styles.cardSentence
                      )
                    )}

                    {!isAutoPlaying && (
                      <View style={styles.audioButtons}>
                        <TouchableOpacity
                          onPress={() => {
                            // For animals-letters category, use 'animal' audio type for back side
                            const audioType = categoryId === 'animals-letters' ? 'animal' : 'word';
                            playAudioWithHighlight(audioType as any, currentCard.back.text, currentCard.id);
                          }}
                          style={styles.audioButton}
                          disabled={isPlayingAudio}
                        >
                          <Text style={styles.audioButtonText}>🔊 Say Answer</Text>
                        </TouchableOpacity>
                        {currentCard.back.sentence && (
                          <TouchableOpacity
                            onPress={() => {
                              // For animals-letters category, use 'animal_sentence' audio type for back side sentences
                              const sentenceAudioType = categoryId === 'animals-letters' ? 'animal_sentence' : 'sentence';
                              playAudioWithHighlight(sentenceAudioType as any, currentCard.back.sentence!, currentCard.id);
                            }}
                            style={styles.audioButton}
                            disabled={isPlayingAudio}
                          >
                            <Text style={styles.audioButtonText}>🗣️ Say Sentence</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => {
                            // For animals-letters category, use 'animal_pronunciation' audio type for back side pronunciations
                            const pronunciationAudioType = categoryId === 'animals-letters' ? 'animal_pronunciation' : 'pronunciation';
                            playAudioWithHighlight(pronunciationAudioType as any, currentCard.back.text, currentCard.id);
                          }}
                          style={styles.audioButton}
                          disabled={isPlayingAudio}
                        >
                          <Text style={styles.audioButtonText}>🔠 Pronunciation</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!isCompleted && (
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={handlePreviousCard}
            disabled={currentIndex === 0 || isAutoPlaying}
            style={[styles.navButton, (currentIndex === 0 || isAutoPlaying) && styles.navButtonDisabled]}
          >
            <Text style={[
              styles.navButtonText,
              (currentIndex === 0 || isAutoPlaying) && styles.navButtonTextDisabled
            ]}>← Previous</Text>
          </TouchableOpacity>

          {!isAutoPlaying && (
            <TouchableOpacity
              onPress={toggleAutoPlay}
              style={styles.autoPlayToggle}
            >
              <Text style={styles.autoPlayToggleText}>🎥 Auto Play</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleNextCard}
            disabled={currentIndex === cards.length - 1 || isAutoPlaying}
            style={[styles.navButton, (currentIndex === cards.length - 1 || isAutoPlaying) && styles.navButtonDisabled]}
          >
            <Text style={[
              styles.navButtonText,
              (currentIndex === cards.length - 1 || isAutoPlaying) && styles.navButtonTextDisabled
            ]}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  categoryInfo: {
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  autoPlayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  autoPlayButtonActive: {
    backgroundColor: '#FF4500',
    borderColor: 'white',
  },
  autoPlayButtonText: {
    fontSize: 20,
    color: 'white',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  autoPlayIndicator: {
    backgroundColor: 'rgba(255,69,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  autoPlayIndicatorText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  flashcardWrapper: {
    alignItems: 'center',
  },
  flashcard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    minHeight: 300,
    width: '100%',
    maxWidth: 350,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  flashcardFlipped: {
    backgroundColor: '#f8f9fa',
  },
  cardContent: {
    alignItems: 'center',
    width: '100%',
  },
  cardMainText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  cardPronunciation: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  pronunciationContainer: {
    marginVertical: 5,
  },
  cardSentence: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  cardSound: {
    fontSize: 18,
    color: '#FF4500',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 10,
  },
  tapHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  audioButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
    gap: 10,
  },
  audioButton: {
    backgroundColor: '#FF4500',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 2,
  },
  audioButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  autoPlayToggle: {
    backgroundColor: '#FF4500',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  autoPlayToggleText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  navButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  completionIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  completionText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  restartButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderWidth: 2,
    borderColor: 'white',
  },
  restartButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  highlightedTextContainer: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  highlightedText: {
    color: '#333',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});