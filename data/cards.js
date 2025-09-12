// CSV-driven cards will be loaded at runtime; keep default export for compatibility
const cards = [];

export const resolveAnimalImage = (name) => {
  const key = String(name || "")
    .toLowerCase()
    .trim();
  switch (key) {
    case "dog":
      return require("../assets/images/dog.png");
    case "cat":
      return require("../assets/images/cat.png");
    case "horse":
      return require("../assets/images/horse.png");
    case "cow":
      return require("../assets/images/cow.png");
    case "elephant":
      return require("../assets/images/elephhant.png");
    case "lion":
      return require("../assets/images/lion.png");
    case "tiger":
      return require("../assets/images/tiger.png");
    case "bear":
      return require("../assets/images/bear.png");
    case "fox":
      return require("../assets/images/fox.png");
    case "wolf":
      return require("../assets/images/wolf.png");
    case "squirrel":
      return require("../assets/images/squerell.png");
    case "rabbit":
      return require("../assets/images/rabbit.png");
    case "mouse":
      return require("../assets/images/mouse.png");
    case "snake":
      return require("../assets/images/snake.png");
    case "kangaroo":
      return require("../assets/images/kangaroo.png");
    case "monkey":
      return require("../assets/images/monkey.png");
    case "giraffe":
      return require("../assets/images/giraff.png");
    case "hippopotamus":
      return require("../assets/images/hipo.png");
    case "rhinoceros":
      return require("../assets/images/rhino.png");
    case "zebra":
      return require("../assets/images/zebra.png");
    case "camel":
      return require("../assets/images/camel.png");
    case "crocodile":
      return require("../assets/images/crocodile.png");
    case "duck":
      return require("../assets/images/duck.png");
    case "eagle":
      return require("../assets/images/eagle.png");
    case "fish":
      return require("../assets/images/fish.png");
    case "whale":
      return require("../assets/images/whale.png");
    case "dolphin":
      return require("../assets/images/dolphin.png");
    case "octopus":
      return require("../assets/images/octopus.png");
    case "goat":
      return require("../assets/images/goat.png");
    case "frog":
      return require("../assets/images/frog.png");
    case "owl":
      return require("../assets/images/owl.png");
    case "bat":
      return require("../assets/images/bat.png");
    case "swan":
      return require("../assets/images/swan.png");
    case "gorilla":
      return require("../assets/images/gorilla.png");
    case "crab":
      return require("../assets/images/crab.png");
    case "butterfly":
      return require("../assets/images/butterfly.png");
    case "ant":
      return require("../assets/images/ant.png");
    case "spider":
      return require("../assets/images/spider.png");
    case "turtle":
      return require("../assets/images/turtle.png");
    case "alligator":
      return require("../assets/images/alligator.png");
    case "flamingo":
      return require("../assets/images/flamingo.png");
    case "chimpanzee":
      return require("../assets/images/chimpanzee.png");
    case "sheep":
      return require("../assets/images/sheep.png");
    case "rat":
      return require("../assets/images/rat.png");
    default:
      return require("../assets/images/favicon.webp");
  }
};

export default cards;
