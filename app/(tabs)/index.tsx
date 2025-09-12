import { FlashCard } from "@/components/Flashcard";
import { getCardsRange, initializeCSV, StudyKeyCard } from "@/data/loadAnimals";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

const DECK_SIZE = 7;

interface DeckItem {
  card: StudyKeyCard;
  globalIndex: number; // The actual position in CSV (1-based)
  deckPosition: number; // Position in the circular buffer (0-6)
}

const Index = () => {
  const shuffleBack = useSharedValue(false);
  const [deck, setDeck] = React.useState<DeckItem[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0); // Current card being viewed
  const [isLoading, setIsLoading] = React.useState(true);
  const [totalCards, setTotalCards] = React.useState(0);
  const [hasCompletedCycle, setHasCompletedCycle] = React.useState(false);

  // Refs to prevent unnecessary re-renders
  const currentIndexRef = React.useRef(0);
  const totalCardsRef = React.useRef(0);

  React.useEffect(() => {
    (async () => {
      try {
        console.log("Initializing CSV...");
        const total = await initializeCSV();
        setTotalCards(total);
        totalCardsRef.current = total;

        // Load initial 7 cards
        const initialCards = getCardsRange(0, DECK_SIZE);
        console.log("Initial cards loaded:", initialCards.length);

        const initialDeck: DeckItem[] = initialCards.map((card, index) => ({
          card,
          globalIndex: index + 1, // 1-based indexing for display
          deckPosition: index,
        }));

        setDeck(initialDeck);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in useEffect:", error);
        setIsLoading(false);
      }
    })();
  }, []);

  const onSwipedTopCard = React.useCallback(() => {
    const nextIndex = currentIndexRef.current + 1;
    console.log(
      "Top card swiped, moving to index:",
      nextIndex,
      "total:",
      totalCardsRef.current
    );

    // Update current index
    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);

    // Check if we've completed all cards
    if (nextIndex >= totalCardsRef.current) {
      // Completed all cards - trigger reshuffle
      console.log("All cards completed! Reshuffling...");

      // Small delay before reshuffle to let the last card animation complete
      setTimeout(() => {
        setHasCompletedCycle(true);
        currentIndexRef.current = 0;
        setCurrentIndex(0);

        // Reset deck to initial state
        const initialCards = getCardsRange(0, DECK_SIZE);
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
        const newCard = getCardsRange(nextCardToLoad, 1)[0];
        if (newCard) {
          newDeck.push({
            card: newCard,
            globalIndex: nextCardToLoad + 1,
            deckPosition: DECK_SIZE - 1,
          });
          console.log("Added new card at global index:", nextCardToLoad + 1);
        }
      }

      console.log("Deck size after update:", newDeck.length);
      return newDeck;
    });
  }, []);

  // Reset completion flag after reshuffle
  React.useEffect(() => {
    if (hasCompletedCycle) {
      const timer = setTimeout(() => {
        setHasCompletedCycle(false);
        // Reset shuffleBack after animations
        shuffleBack.value = false;
      }, 2000); // Give enough time for reshuffle animations

      return () => clearTimeout(timer);
    }
  }, [hasCompletedCycle, shuffleBack]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading flashcards...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
                isNewCard={false} // We'll add this prop to control animations
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
        <Text style={styles.errorText}>No cards loaded</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightblue",
  },
  loadingText: {
    fontSize: 20,
    textAlign: "center",
    marginTop: "50%",
  },
  errorText: {
    fontSize: 20,
    textAlign: "center",
    marginTop: "50%",
  },
  progressContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 5,
  },
  progressText: {
    color: "white",
    fontSize: 16,
  },
  reshuffleText: {
    color: "#FFD54F",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
});

export default Index;