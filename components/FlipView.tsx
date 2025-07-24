import React, { ReactNode, useState } from "react";
import { StyleSheet } from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface FlipViewProps {
  front: ReactNode;
  back: ReactNode;
  style?: any; // for legacy, not used for transforms
  /**
   * outerAnimatedStyle: pass all transforms (flip, stack, drag, scale, etc.) here for correct order
   */
  outerAnimatedStyle?: any;
}

export default function FlipView({
  front,
  back,
  style,
  outerAnimatedStyle,
}: FlipViewProps) {
  const flip = useSharedValue(0);
  const [isFront, setIsFront] = useState(true);

  const flipCard = () => {
    flip.value = withTiming(isFront ? 180 : 0, { duration: 350 }, () => {
      runOnJS(setIsFront)(!isFront);
    });
  };

  const flipAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1500 }, { rotateY: `${flip.value}deg` }],
  }));

  const frontStyle = useAnimatedStyle(() => ({
    opacity: flip.value < 90 ? 1 : 0,
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: flip.value >= 90 ? 1 : 0,
  }));

  // Compose all transforms: outerAnimatedStyle (from parent) + flipAnimatedStyle
  // outerAnimatedStyle should include all stack/drag/scale transforms
  return (
    <TapGestureHandler numberOfTaps={2} onActivated={flipCard}>
      <Animated.View style={[outerAnimatedStyle, flipAnimatedStyle, style]}>
        <Animated.View style={[StyleSheet.absoluteFill, frontStyle]}>
          {front}
        </Animated.View>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            backStyle,
            { transform: [{ rotateY: "180deg" }] },
          ]}
        >
          {back}
        </Animated.View>
      </Animated.View>
    </TapGestureHandler>
  );
}
