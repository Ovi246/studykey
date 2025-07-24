import { FlashCard } from "@/components/Flashcard";
import { StyleSheet, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

const cards = [
  {
    source: require("../../assets/images/elephhant.png"),
    name: "THE ELEPHANT",
    pronunciation: "Thuh Eh-Lih-Fiht",
    sentence: "The elephant is big.",
    translation: {
      name: "EL ELEFANTE",
      pronunciation: "El Eh-leh-fan-teh",
      sentence: "El elefante es grande.",
    },
  },
  {
    source: require("../../assets/images/lion.png"),
    name: "THE LION",
    pronunciation: "Thuh Lai-uhn",
    sentence: "The lion roars.",
    translation: {
      name: "EL LEÓN",
      pronunciation: "El Leh-ohn",
      sentence: "El león ruge.",
    },
  },
  {
    source: require("../../assets/images/tiger.png"),
    name: "THE TIGER",
    pronunciation: "Thuh Tai-ger",
    sentence: "The tiger is fast.",
    translation: {
      name: "EL TIGRE",
      pronunciation: "El Tee-greh",
      sentence: "El tigre es rápido.",
    },
  },
  {
    source: require("../../assets/images/giraff.png"),
    name: "THE GIRAFFE",
    pronunciation: "Thuh Ji-raf",
    sentence: "The giraffe is tall.",
    translation: {
      name: "LA JIRAFA",
      pronunciation: "La Hee-rah-fah",
      sentence: "La jirafa es alta.",
    },
  },
  {
    source: require("../../assets/images/zebra.png"),
    name: "THE ZEBRA",
    pronunciation: "Thuh Zee-bruh",
    sentence: "The zebra has stripes.",
    translation: {
      name: "LA CEBRA",
      pronunciation: "La Seh-brah",
      sentence: "La cebra tiene rayas.",
    },
  },
  {
    source: require("../../assets/images/monkey.png"),
    name: "THE MONKEY",
    pronunciation: "Thuh Mun-kee",
    sentence: "The monkey climbs trees.",
    translation: {
      name: "EL MONO",
      pronunciation: "El Moh-noh",
      sentence: "El mono trepa árboles.",
    },
  },
  {
    source: require("../../assets/images/bear.png"),
    name: "THE BEAR",
    pronunciation: "Thuh Behr",
    sentence: "The bear is strong.",
    translation: {
      name: "EL OSO",
      pronunciation: "El Oh-soh",
      sentence: "El oso es fuerte.",
    },
  },
  {
    source: require("../../assets/images/fox.png"),
    name: "THE FOX",
    pronunciation: "Thuh Foks",
    sentence: "The fox is clever.",
    translation: {
      name: "EL ZORRO",
      pronunciation: "El Soh-rroh",
      sentence: "El zorro es astuto.",
    },
  },
];

export const assets = cards.map((card) => card.source);

const Index = () => {
  const shuffleBack = useSharedValue(false);
  return (
    <View style={styles.container}>
      {cards.map((card, index) => (
        <FlashCard
          card={card}
          key={index}
          index={index}
          shuffleBack={shuffleBack}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightblue",
  },
});

export default Index;
