import { Audio } from "expo-av";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  TapGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { snapPoint } from "react-native-redash";

const { width: wWidth, height } = Dimensions.get("window");

const SNAP_POINTS = [-wWidth, 0, wWidth];
const aspectRatio = 722 / 368;
const CARD_WIDTH = wWidth - 128;
const CARD_HEIGHT = CARD_WIDTH * aspectRatio;
const DURATION = 120;

// ElevenLabs Configuration
const ELEVENLABS_API_KEY =
  "sk_7dd92a0cca18816518fdc32b8a4bcd910160ad3c64702ef7"; // Get free API key from elevenlabs.io
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech";

// ElevenLabs Voice IDs (these are public voice IDs)
const VOICES = {
  SPANISH: {
    FEMALE: "21m00Tcm4TlvDq8ikWAM", // Rachel - multilingual (works well for Spanish)
    MALE: "pNInz6obpgDQGcFmaJgB", // Adam - but this one is causing 404
    PREMIUM: "XB0fDUnXU5powFXDhCwa", // Charlotte - premium multilingual
  },
  ENGLISH: {
    FEMALE: "21m00Tcm4TlvDq8ikWAM", // Rachel - natural English
    MALE: "VR6AewLTigWG4xSOukaG", // Arnold - English male
    PREMIUM: "EXAVITQu4vr4xnSDxMaL", // Bella - premium English
  },
};

// Better approach - use verified public voice IDs
const VERIFIED_VOICES = {
  SPANISH: {
    FEMALE: "21m00Tcm4TlvDq8ikWAM", // Rachel - multilingual (confirmed working)
    MALE: "VR6AewLTigWG4xSOukaG", // Arnold - also works for Spanish
    PREMIUM: "XB0fDUnXU5powFXDhCwa", // Charlotte - premium multilingual
  },
  ENGLISH: {
    FEMALE: "21m00Tcm4TlvDq8ikWAM", // Rachel - natural English
    MALE: "VR6AewLTigWG4xSOukaG", // Arnold - English male
    PREMIUM: "EXAVITQu4vr4xnSDxMaL", // Bella - premium English
  },
};

interface CardProps {
  card: {
    source: ImageSourcePropType;
    name: string;
    subtitle?: string; // Optional subtitle like "LA YEGUA"
    pronunciation: string;
    sentence: string;
    translation: {
      name: string;
      subtitle?: string;
      pronunciation: string;
      sentence: string;
    };
  };
  shuffleBack: Animated.SharedValue<boolean>;
  index: number;
  cardIndex: number;
  onSwipedTopCard?: () => void;
  isNewCard?: boolean;
}
export const FlashCard = ({
  card: { source, name, pronunciation, sentence, translation },
  shuffleBack,
  index,
  cardIndex,
  onSwipedTopCard,
  isNewCard = false,
}: CardProps) => {
  const offset = useSharedValue({ x: 0, y: 0 });
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(isNewCard ? -height : -height);
  const scale = useSharedValue(1);
  const rotateZ = useSharedValue(0);
  const flip = useSharedValue(0);

  const [isFront, setIsFront] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const theta = -10 + Math.random() * 20;
  const delay = index * DURATION;

  // ElevenLabs TTS Function
  const speakText = async (text: string, isSpanish: boolean = false) => {
    if (isPlaying) return;

    try {
      setIsPlaying(true);

      // Use verified voice IDs with fallback
      let voiceId = isSpanish
        ? VERIFIED_VOICES.SPANISH.FEMALE
        : VERIFIED_VOICES.ENGLISH.FEMALE;

      // Fallback voice IDs in case primary ones fail
      const fallbackVoices = isSpanish
        ? [
            "21m00Tcm4TlvDq8ikWAM", // Rachel - multilingual
            "VR6AewLTigWG4xSOukaG", // Arnold
            "XB0fDUnXU5powFXDhCwa", // Charlotte
          ]
        : [
            "21m00Tcm4TlvDq8ikWAM", // Rachel
            "EXAVITQu4vr4xnSDxMaL", // Bella
            "VR6AewLTigWG4xSOukaG", // Arnold
          ];

      console.log(
        `ElevenLabs TTS: Speaking "${text.substring(0, 30)}..." in ${
          isSpanish ? "Spanish" : "English"
        } with voice ${voiceId}`
      );

      const requestBody = {
        text: text,
        model_id: "eleven_multilingual_v2", // Best model for multilingual content
        voice_settings: {
          stability: 0.5, // Lower = more expressive
          similarity_boost: 0.8, // Higher = more like original voice
          style: 0.5, // Emotional range
          use_speaker_boost: true, // Enhance voice clarity
          speed: 0.8,
        },
      };

      let response;
      let currentVoiceIndex = 0;

      // Try primary voice, then fallbacks
      do {
        try {
          response = await fetch(`${ELEVENLABS_BASE_URL}/${voiceId}`, {
            method: "POST",
            headers: {
              Accept: "audio/mpeg",
              "Content-Type": "application/json",
              "xi-api-key": ELEVENLABS_API_KEY,
            },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            break; // Success, exit retry loop
          } else if (
            response.status === 404 &&
            currentVoiceIndex < fallbackVoices.length
          ) {
            console.warn(`Voice ${voiceId} not found, trying fallback...`);
            voiceId = fallbackVoices[currentVoiceIndex];
            currentVoiceIndex++;
          } else {
            throw new Error(`API error! Status: ${response.status}`);
          }
        } catch (fetchError) {
          if (currentVoiceIndex < fallbackVoices.length) {
            console.warn(`Failed with voice ${voiceId}, trying fallback...`);
            voiceId = fallbackVoices[currentVoiceIndex];
            currentVoiceIndex++;
          } else {
            throw fetchError;
          }
        }
      } while (currentVoiceIndex <= fallbackVoices.length);

      if (!response || !response.ok) {
        if (response && response.status === 401) {
          throw new Error(
            "Invalid ElevenLabs API key. Please check your API key."
          );
        } else if (response && response.status === 429) {
          throw new Error(
            "ElevenLabs rate limit exceeded. Please try again later."
          );
        } else {
          throw new Error(
            `ElevenLabs API error! Status: ${response?.status || "unknown"}`
          );
        }
      }

      // Rest of your existing audio processing code remains the same
      const audioBlob = await response.blob();

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result as string;

          if (sound) {
            await sound.unloadAsync();
          }

          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: base64Audio },
            {
              shouldPlay: true,
              isLooping: false,
              volume: 1.0,
            }
          );

          setSound(newSound);

          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              console.log("ElevenLabs audio finished playing");
              setIsPlaying(false);
            }
            if (status.isLoaded === false && status.error) {
              console.error("Audio playback error:", status.error);
              setIsPlaying(false);
            }
          });

          await newSound.playAsync();
          console.log(`ElevenLabs audio started playing with voice ${voiceId}`);
        } catch (audioError) {
          console.error("Audio processing error:", audioError);
          setIsPlaying(false);
          Alert.alert("Audio Error", "Failed to play generated audio.");
        }
      };

      reader.onerror = () => {
        console.error("Failed to convert audio blob to base64");
        setIsPlaying(false);
        Alert.alert("Audio Error", "Failed to process audio data.");
      };

      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("ElevenLabs TTS Error:", error);
      setIsPlaying(false);

      if (error.message.includes("API key")) {
        Alert.alert(
          "API Key Error",
          "Please set your ElevenLabs API key in the code."
        );
      } else if (error.message.includes("rate limit")) {
        Alert.alert(
          "Rate Limit",
          "Too many requests. Please wait a moment and try again."
        );
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        Alert.alert(
          "Network Error",
          "Please check your internet connection and try again."
        );
      } else {
        Alert.alert(
          "TTS Error",
          "Unable to generate speech. Please try again."
        );
      }
    }
  };

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Initial entrance animation - only runs once on mount or reshuffle
  useEffect(() => {
    if (!hasInitialized) {
      if (isNewCard) {
        translateY.value = withTiming(0, {
          duration: DURATION * 2,
          easing: Easing.out(Easing.ease),
        });
      } else {
        translateY.value = withDelay(
          delay,
          withTiming(0, {
            duration: DURATION,
            easing: Easing.inOut(Easing.ease),
          })
        );
      }

      rotateZ.value = withDelay(isNewCard ? 0 : delay, withSpring(theta));

      setHasInitialized(true);
    }
  }, [hasInitialized, isNewCard, delay, theta]);

  // Reshuffle animation
  useAnimatedReaction(
    () => shuffleBack.value,
    (v) => {
      if (v) {
        translateY.value = -height;
        translateX.value = 0;

        const duration = 150 * index;
        translateY.value = withDelay(
          duration,
          withTiming(0, {
            duration: DURATION * 2,
            easing: Easing.inOut(Easing.ease),
          })
        );
        rotateZ.value = withDelay(duration, withSpring(theta));
      }
    }
  );

  const gesture = Gesture.Pan()
    .onBegin(() => {
      offset.value = { x: translateX.value, y: translateY.value };
      rotateZ.value = withTiming(0);
      scale.value = withTiming(1.1);
    })
    .onUpdate(({ translationX, translationY }) => {
      const flipSign = isFront ? 1 : -1;
      translateX.value = offset.value.x + flipSign * translationX;
      translateY.value = offset.value.y + translationY;
    })
    .onEnd(({ velocityX, velocityY }) => {
      const flipSign = isFront ? 1 : -1;
      const dest = snapPoint(
        translateX.value,
        flipSign * velocityX,
        SNAP_POINTS
      );

      translateX.value = withSpring(dest, {
        velocity: flipSign * velocityX,
        damping: 15,
        mass: 0.8,
        stiffness: 120,
      });

      translateY.value = withSpring(0, {
        velocity: velocityY,
        damping: 15,
        mass: 0.8,
        stiffness: 120,
      });

      scale.value = withTiming(1, {}, () => {
        const isTopCard = index === 0;
        const isSwipedLeftOrRight = dest !== 0;
        if (isTopCard && isSwipedLeftOrRight && onSwipedTopCard) {
          runOnJS(onSwipedTopCard)();
        }
      });
    });

  // Flip animation handler
  useAnimatedReaction(
    () => flip.value,
    (v) => {
      if (v < 90 && !isFront) {
        runOnJS(setIsFront)(true);
      } else if (v >= 90 && isFront) {
        runOnJS(setIsFront)(false);
      }
    },
    [isFront]
  );

  const onDoubleTap = useCallback(() => {
    flip.value = withTiming(flip.value === 0 ? 180 : 0, { duration: 350 });
  }, [flip]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1500 },
      { rotateY: `${flip.value}deg` },
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateZ: `${rotateZ.value}deg` },
      { scale: scale.value },
    ],
  }));

  const SpeakButton = ({
    text,
    isSpanish,
  }: {
    text: string;
    isSpanish?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.speakButton, isPlaying && styles.speakButtonActive]}
      onPress={() => speakText(text, isSpanish)}
      disabled={isPlaying}
    >
      <Text
        style={[
          styles.speakButtonText,
          isPlaying && styles.speakButtonDisabled,
        ]}
      >
        {isPlaying ? "🔊" : "🔉"}
      </Text>
    </TouchableOpacity>
  );

  // Updated CardContent component with better layout - works with existing data structure
  const CardContent = ({ isBack = false }: { isBack?: boolean }) => {
    // Parse the name to handle cases like "EL CABALLO\nLA YEGUA"
    const currentName = isBack ? translation.name : name;
    const nameLines = currentName.split("\n");
    const hasMultipleLines = nameLines.length > 1;

    return (
      <View
        style={[styles.card, isBack && { transform: [{ rotateY: "180deg" }] }]}
      >
        <View style={styles.whiteHalf} />
        <View style={styles.redBorder}>
          <View style={styles.redCircle} />
          <Image
            source={source}
            style={styles.elephantImage}
            resizeMode="contain"
          />

          <View style={styles.textContainer}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              {hasMultipleLines ? (
                // Handle multiple lines in name (like "EL CABALLO\nLA YEGUA")
                nameLines.map((line, index) => (
                  <View key={index} style={styles.titleRow}>
                    <Text
                      style={styles.title}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {line.trim()}
                    </Text>
                    {index === nameLines.length - 1 && (
                      <SpeakButton text={currentName} isSpanish={isBack} />
                    )}
                  </View>
                ))
              ) : (
                // Single line name
                <View style={styles.titleRow}>
                  <Text
                    style={styles.title}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {currentName}
                  </Text>
                  <SpeakButton text={currentName} isSpanish={isBack} />
                </View>
              )}
            </View>

            {/* Pronunciation Section */}
            <View style={styles.pronunciationSection}>
              <Text style={styles.pronounce} numberOfLines={2}>
                {isBack ? translation.pronunciation : pronunciation}
              </Text>
            </View>

            {/* Sentence Section */}
            <View style={styles.sentenceSection}>
              <View style={styles.sentenceRow}>
                <Text style={styles.sentence} numberOfLines={3}>
                  {(isBack ? translation.sentence : sentence)
                    .split("\n")
                    .map((line, i) => (
                      <Text key={i}>
                        {line}
                        {i <
                        (isBack ? translation.sentence : sentence).split("\n")
                          .length -
                          1
                          ? "\n"
                          : ""}
                      </Text>
                    ))}
                </Text>
                <SpeakButton
                  text={isBack ? translation.sentence : sentence}
                  isSpanish={isBack}
                />
              </View>
            </View>
          </View>

          <Image
            source={require("../assets/images/favicon.webp")}
            style={styles.logoPlaceholder}
            resizeMode="contain"
          />

          <View style={styles.cardIndexContainer}>
            <Text style={styles.cardIndexText}>{cardIndex}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <GestureDetector gesture={gesture}>
        <TapGestureHandler numberOfTaps={2} onActivated={onDoubleTap}>
          <Animated.View
            style={[styles.cardWrapper, cardAnimatedStyle, styles.shadow]}
          >
            <CardContent isBack={!isFront} />
          </Animated.View>
        </TapGestureHandler>
      </GestureDetector>
    </View>
  );
};

// Updated styles with proper spacing and text sizing
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  cardWrapper: {
    width: CARD_WIDTH + 10,
    height: CARD_HEIGHT + 10,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  shadow: {
    backgroundColor: "#0002",
    borderRadius: 12,
  },
  card: {
    backgroundColor: "#FFD54F",
    borderRadius: 16,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 5,
    left: 5,
    overflow: "hidden",
  },
  whiteHalf: {
    backgroundColor: "white",
    borderBottomRightRadius: 70,
    borderBottomLeftRadius: 70,
    width: CARD_WIDTH,
    height: CARD_HEIGHT * 0.48, // Reduced to give more yellow space
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
  redBorder: {
    flex: 1,
    width: CARD_WIDTH - CARD_WIDTH * 0.06,
    height: CARD_HEIGHT - CARD_HEIGHT * 0.06,
    margin: CARD_WIDTH * 0.03,
    overflow: "hidden",
    alignItems: "center",
    position: "relative",
  },
  redCircle: {
    position: "absolute",
    top: CARD_HEIGHT * 0.025,
    left: "50%",
    marginLeft: -(CARD_WIDTH * 0.06) / 2,
    width: CARD_WIDTH * 0.12,
    height: CARD_WIDTH * 0.12,
    borderRadius: (CARD_WIDTH * 0.12) / 2,
    borderWidth: Math.max(2, CARD_WIDTH * 0.012),
    borderColor: "#E53935",
    backgroundColor: "white",
    zIndex: 2,
  },
  elephantImage: {
    marginTop: CARD_HEIGHT * 0.1, // Reduced margin
    width: CARD_WIDTH * 0.65, // Slightly smaller
    height: CARD_HEIGHT * 0.32, // Reduced height
    alignSelf: "center",
    zIndex: 3,
  },
  textContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT * 0.48, // Yellow area height
    paddingHorizontal: CARD_WIDTH * 0.05,
    paddingVertical: CARD_HEIGHT * 0.03,
    justifyContent: "space-evenly",
    alignItems: "center",
    zIndex: 4,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: CARD_HEIGHT * 0.02,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: CARD_HEIGHT * 0.008,
    maxWidth: CARD_WIDTH * 0.85,
  },
  title: {
    fontSize: Math.min(CARD_WIDTH * 0.095, 28), // Responsive with max
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    lineHeight: Math.min(CARD_WIDTH * 0.11, 32),
    flexShrink: 1,
    marginRight: 8,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: CARD_HEIGHT * 0.015,
    maxWidth: CARD_WIDTH * 0.85,
  },
  subtitle: {
    fontSize: Math.min(CARD_WIDTH * 0.08, 24), // Secondary title
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    lineHeight: Math.min(CARD_WIDTH * 0.095, 28),
    flexShrink: 1,
    marginRight: 8,
  },
  pronunciationSection: {
    alignItems: "center",
    marginBottom: CARD_HEIGHT * 0.02,
  },
  pronounce: {
    fontSize: Math.min(CARD_WIDTH * 0.055, 16), // Smaller pronunciation
    fontWeight: "500",
    color: "#555",
    textAlign: "center",
    fontStyle: "italic",
    paddingHorizontal: CARD_WIDTH * 0.02,
  },
  sentenceSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: CARD_WIDTH * 0.02,
  },
  sentenceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    width: "100%",
  },
  sentence: {
    fontSize: Math.min(CARD_WIDTH * 0.45, 24), // Smaller sentence
    fontWeight: "500",
    color: "#444",
    textAlign: "center",
    lineHeight: Math.min(CARD_WIDTH * 0.055, 18),
    flex: 1,
    paddingRight: 8,
  },
  speakButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    minWidth: 28,
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    flexShrink: 0,
  },
  speakButtonActive: {
    backgroundColor: "rgba(139, 69, 19, 0.2)",
  },
  speakButtonText: {
    fontSize: 12,
  },
  speakButtonDisabled: {
    opacity: 0.5,
  },
  logoPlaceholder: {
    position: "absolute",
    bottom: CARD_HEIGHT * 0.02,
    right: CARD_WIDTH * 0.04,
    width: CARD_WIDTH * 0.1, // Smaller logo
    height: CARD_WIDTH * 0.1,
    zIndex: 5,
  },
  cardIndexContainer: {
    position: "absolute",
    bottom: CARD_HEIGHT * 0.02,
    left: CARD_WIDTH * 0.04,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    zIndex: 6,
  },
  cardIndexText: {
    color: "white",
    fontSize: Math.min(CARD_WIDTH * 0.035, 12),
    fontWeight: "bold",
  },
});
