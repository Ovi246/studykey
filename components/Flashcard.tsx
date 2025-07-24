import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
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
const IMAGE_WIDTH = CARD_WIDTH * 0.9;
const DURATION = 120; // was 250

interface CardProps {
  card: {
    source: ImageSourcePropType;
    name: string;
    pronunciation: string;
    sentence: string;
    translation: {
      name: string;
      pronunciation: string;
      sentence: string;
    };
  };
  shuffleBack: Animated.SharedValue<boolean>;
  index: number;
}

export const FlashCard = ({
  card: { source, name, pronunciation, sentence, translation },
  shuffleBack,
  index,
}: CardProps) => {
  const offset = useSharedValue({ x: 0, y: 0 });
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(-height);
  const scale = useSharedValue(1);
  const rotateZ = useSharedValue(0);
  const delay = index * DURATION;
  const theta = -10 + Math.random() * 20;
  const flip = useSharedValue(0); // 0 = front, 180 = back
  const [isFront, setIsFront] = useState(true);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: DURATION, easing: Easing.inOut(Easing.ease) })
    );
    rotateZ.value = withDelay(delay, withSpring(theta));
  }, [delay, index, rotateZ, theta, translateY]);
  useAnimatedReaction(
    () => shuffleBack.value,
    (v) => {
      if (v) {
        const duration = 150 * index;
        translateX.value = withDelay(
          duration,
          withSpring(0, {}, () => {
            shuffleBack.value = false;
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
        const isLast = index === 0;
        const isSwipedLeftOrRight = dest !== 0;
        if (isLast && isSwipedLeftOrRight) {
          shuffleBack.value = true;
        }
      });
    });

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

  const onDoubleTap = () => {
    flip.value = withTiming(flip.value === 0 ? 180 : 0, { duration: 350 });
  };

  // Compose all transforms in a single array
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

  return (
    <View style={styles.container} pointerEvents="box-none">
      <GestureDetector gesture={gesture}>
        <TapGestureHandler numberOfTaps={2} onActivated={onDoubleTap}>
          <Animated.View style={[styles.cardWrapper, cardAnimatedStyle]}>
            {isFront ? (
              <View style={styles.card}>
                <View style={styles.redBorder}>
                  <View style={styles.redCircle} />
                  <Image
                    source={source}
                    style={styles.elephantImage}
                    resizeMode="contain"
                  />
                  <View style={styles.yellowHalf} />
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{name}</Text>
                    <Text style={styles.pronounce}>{pronunciation}</Text>
                    <Text style={styles.sentence}>
                      {sentence.split("\n").map((line, i) => (
                        <Text key={i}>
                          {line}
                          {"\n"}
                        </Text>
                      ))}
                    </Text>
                  </View>
                  <View style={styles.logoPlaceholder} />
                </View>
              </View>
            ) : (
              <View
                style={[styles.card, { transform: [{ rotateY: "180deg" }] }]}
              >
                <View style={styles.redBorder}>
                  <View style={styles.redCircle} />
                  <Image
                    source={source}
                    style={styles.elephantImage}
                    resizeMode="contain"
                  />
                  <View style={styles.yellowHalf} />
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{translation.name}</Text>
                    <Text style={styles.pronounce}>
                      {translation.pronunciation}
                    </Text>
                    <Text style={styles.sentence}>
                      {translation.sentence.split("\n").map((line, i) => (
                        <Text key={i}>
                          {line}
                          {"\n"}
                        </Text>
                      ))}
                    </Text>
                  </View>
                  <View style={styles.logoPlaceholder} />
                </View>
              </View>
            )}
          </Animated.View>
        </TapGestureHandler>
      </GestureDetector>
    </View>
  );
};

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
    position: "absolute",
    backgroundColor: "#0002", // lighter shadow for performance
    borderRadius: 12,
    // Removed heavy shadow props for performance
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.2,
    // shadowRadius: 8,
    // elevation: 8,
    top: 0,
    left: 0,
  },
  card: {
    backgroundColor: "white", // ensure white background for both sides
    borderRadius: 16,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 5,
    left: 5,
    overflow: "hidden", // prevent rendering artifacts
  },
  redBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E53935",
    borderRadius: 16,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    alignItems: "center",
  },
  redCircle: {
    position: "absolute",
    top: 12,
    left: "50%",
    marginLeft: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#E53935",
    backgroundColor: "white",
    zIndex: 2,
  },
  elephantImage: {
    marginTop: 36,
    width: "60%",
    height: CARD_HEIGHT * 0.32,
    alignSelf: "center",
    zIndex: 3,
  },
  yellowHalf: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "52%",
    backgroundColor: "#FFD54F",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 1,
  },
  textContainer: {
    position: "absolute",
    bottom: 54,
    left: 0,
    width: "100%",
    alignItems: "center",
    zIndex: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  pronounce: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 10,
  },
  sentence: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    textAlign: "center",
  },
  logoPlaceholder: {
    position: "absolute",
    bottom: 10,
    right: 12,
    width: 32,
    height: 20,
    backgroundColor: "#2222",
    borderRadius: 4,
    zIndex: 5,
  },
});
