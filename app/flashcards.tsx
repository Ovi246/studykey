import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { FlashCard } from '@/components/Flashcard';
import { getCardsRange, initializeCSV, StudyKeyCard } from '@/data/loadAnimals';

const DECK_SIZE = 7;

interface DeckItem {
  card: StudyKeyCard;
  globalIndex: number; // The actual position in CSV (1-based)
  deckPosition: number; // Position in the circular buffer (0-6)
}

const FlashcardsPage = () => {
  const { product } = useLocalSearchParams<{ product: string }>();
  const shuffleBack = useSharedValue(false);
  const [deck, setDeck] = React.useState<DeckItem[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [totalCards, setTotalCards] = React.useState(0);
  const [hasCompletedCycle, setHasCompletedCycle] = React.useState(false);

  // Refs to prevent unnecessary re-renders
  const currentIndexRef = React.useRef(0);
  const totalCardsRef = React.useRef(0);

  useEffect(() => {
    initializeFlashcards();
  }, [product]);

  const initializeFlashcards = async () => {
    try {
      console.log('Initializing flashcards for product:', product);
      
      // Save the current product
      if (product) {
        await AsyncStorage.setItem('studykey_last_product', product);
      }

      // Load progress for this product
      const progressKey = `studykey_progress_${product}`;
      const savedProgress = await AsyncStorage.getItem(progressKey);
      const startIndex = savedProgress ? parseInt(savedProgress, 10) : 0;

      console.log('Starting from index:', startIndex);

      const total = await initializeCSV(product || 'animals');
      setTotalCards(total);
      totalCardsRef.current = total;

      // Load initial cards starting from saved progress
      const initialCards = getCardsRange(startIndex, DECK_SIZE, product || 'animals');
      console.log('Initial cards loaded:', initialCards.length);

      const initialDeck: DeckItem[] = initialCards.map((card, index) => ({
        card,
        globalIndex: startIndex + index + 1, // 1-based indexing for display
        deckPosition: index,
      }));

      setDeck(initialDeck);
      setCurrentIndex(startIndex);
      currentIndexRef.current = startIndex;
      setIsLoading(false);
    } catch (error) {
      console.error('Error in initializeFlashcards:', error);
      setIsLoading(false);
    }
  };

  const saveProgress = async (index: number) => {
    try {
      const progressKey = `studykey_progress_${product}`;
      await AsyncStorage.setItem(progressKey, index.toString());
      await AsyncStorage.setItem('studykey_progress', 'true'); // General progress flag
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const onSwipedTopCard = React.useCallback(() => {
    const nextIndex = currentIndexRef.current + 1;
    console.log(
      'Top card swiped, moving to index:',
      nextIndex,
      'total:',
      totalCardsRef.current
    );

    // Update current index
    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);

    // Save progress
    saveProgress(nextIndex);

    // Check if we've completed all cards
    if (nextIndex >= totalCardsRef.current) {
      // Completed all cards - trigger reshuffle
      console.log('All cards completed! Reshuffling...');

      // Small delay before reshuffle to let the last card animation complete
      setTimeout(() => {
        setHasCompletedCycle(true);
        currentIndexRef.current = 0;
        setCurrentIndex(0);
        saveProgress(0);

        // Reset deck to initial state
        const initialCards = getCardsRange(0, DECK_SIZE, product || 'animals');
        const resetDeck: DeckItem[] = initialCards.map((card, index) => ({
          card,
          globalIndex: index + 1,
          deckPosition: index,
        }));

        setDeck(resetDeck);

        // Trigger reshuffle animation
        shuffleBack.value = true;
      }, 300);

      return;
    }

    // Continue with normal card management
    setDeck((prevDeck) => {
      const newDeck = [...prevDeck];

      // Remove the first card and shift positions
      newDeck.shift();

      // Update positions for remaining cards
      newDeck.forEach((item) => {
        item.deckPosition = item.deckPosition - 1;
      });

      // Calculate next card to load
      const nextCardToLoad = nextIndex + DECK_SIZE - 1;

      // Add new card if available
      if (nextCardToLoad < totalCardsRef.current) {
        const newCard = getCardsRange(nextCardToLoad, 1, product || 'animals')[0];
        if (newCard) {
          newDeck.push({
            card: newCard,
            globalIndex: nextCardToLoad + 1,
            deckPosition: DECK_SIZE - 1,
          });
          console.log('Added new card at global index:', nextCardToLoad + 1);
        }
      }

      console.log('Deck size after update:', newDeck.length);
      return newDeck;
    });
  }, [product]);

  // Reset completion flag after reshuffle
  useEffect(() => {
    if (hasCompletedCycle) {
      const timer = setTimeout(() => {
        setHasCompletedCycle(false);
        // Reset shuffleBack after animations
        shuffleBack.value = false;
      }, 2000); // Give enough time for reshuffle animations

      return () => clearTimeout(timer);
    }
  }, [hasCompletedCycle, shuffleBack]);

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading flashcards...</Text>
          <Text style={styles.productText}>Product: {product || 'Default'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.productTitle}>{product || 'Animals'}</Text>
      </View>

      {/* Flashcards */}
      {deck.length > 0 ? (
        <>
          {deck
            .slice()
            .sort((a, b) => b.deckPosition - a.deckPosition)
            .map((deckItem) => (
              <FlashCard
                card={deckItem.card}
                key={`${deckItem.card.name}-${deckItem.globalIndex}`}
                index={deckItem.deckPosition}
                cardIndex={deckItem.globalIndex}
                shuffleBack={shuffleBack}
                onSwipedTopCard={
                  deckItem.deckPosition === 0 ? onSwipedTopCard : undefined
                }
                isNewCard={false}
              />
            ))}

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {Math.min(currentIndex + 1, totalCards)} / {totalCards} cards
            </Text>
            {hasCompletedCycle && (
              <Text style={styles.reshuffleText}>Reshuffling...</Text>
            )}
          </View>
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No cards loaded</Text>
          <Text style={styles.errorSubtext}>Product: {product || 'Default'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightblue',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  productText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  progressText: {
    color: 'white',
    fontSize: 16,
  },
  reshuffleText: {
    color: '#FFD54F',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default FlashcardsPage;