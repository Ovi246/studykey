import Papa from "papaparse";
import { ImageSourcePropType } from "react-native";
import { resolveAnimalImage } from "./cards";
import { studyKeyAnimalsCSV, toddlersCSV } from "./csvData";
import { getProductById } from "./products";

export interface AnimalRow {
  index?: string;
  genderGroup?: string;
  spanish?: string;
  spanishPronun?: string;
  spanishSentence?: string;
  englishAnimal?: string;
  englishPronun?: string;
  englishSentence?: string;
}

export interface StudyKeyCard {
  source: ImageSourcePropType;
  name: string;
  pronunciation: string;
  sentence: string;
  translation: {
    name: string;
    pronunciation: string;
    sentence: string;
  };
}

// Fallback data in case CSV loading fails
const fallbackCards: StudyKeyCard[] = [
  {
    source: require("../assets/images/elephhant.png"),
    name: "THE ELEPHANT",
    pronunciation: "Thuh Eh-Lih-Fiht",
    sentence: "The elephant is big.",
    translation: {
      name: "EL ELEPHANTE",
      pronunciation: "El Eh-leh-fan-teh",
      sentence: "El elefante es grande.",
    },
  },
  {
    source: require("../assets/images/lion.png"),
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
    source: require("../assets/images/tiger.png"),
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
    source: require("../assets/images/giraff.png"),
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
    source: require("../assets/images/zebra.png"),
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
    source: require("../assets/images/monkey.png"),
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
    source: require("../assets/images/bear.png"),
    name: "THE BEAR",
    pronunciation: "Thuh Behr",
    sentence: "The bear is strong.",
    translation: {
      name: "EL OSO",
      pronunciation: "El Oh-soh",
      sentence: "El oso es fuerte.",
    },
  },
];

// Cache for parsed CSV data to avoid re-parsing - now supports multiple products
const csvCaches: { [productId: string]: StudyKeyCard[] } = {};
const csvTotalRows: { [productId: string]: number } = {};

// Parse CSV row into a card
const parseRowToCard = (
  row: string[],
  rowIndex: number
): StudyKeyCard | null => {
  if (!row || row.length < 8) return null;

  // Skip rows that don't have proper data
  if (rowIndex === 0 || rowIndex === 1) return null; // Skip header rows

  const englishAnimal = (row[5] || "").trim();
  const englishPronun = (row[6] || "").trim();
  const englishSentence = (row[7] || "").trim();

  const spanish = (row[2] || "").trim();
  const spanishPronun = (row[3] || "").trim();
  const spanishSentence = (row[4] || "").trim();

  // Only create cards if we have both English and Spanish names
  if (!englishAnimal || !spanish || englishAnimal === "" || spanish === "") {
    return null;
  }

  // Skip rows that look like metadata
  if (
    englishAnimal.match(/^\d+$/) ||
    englishAnimal.includes("rule") ||
    englishAnimal.includes("p")
  ) {
    return null;
  }

  const source = resolveAnimalImage(englishAnimal);

  return {
    source,
    name: `THE ${englishAnimal.toUpperCase()}`,
    pronunciation: englishPronun.replace(/[()]/g, "").trim() || englishAnimal,
    sentence: englishSentence || `The ${englishAnimal.toLowerCase()} is here.`,
    translation: {
      name: spanish.toUpperCase(),
      pronunciation: spanishPronun.replace(/[()]/g, "").trim() || spanish,
      sentence: spanishSentence || `El ${spanish.toLowerCase()} está aquí.`,
    },
  };
};

// Load and parse CSV once, cache the results - now product-aware
export const initializeCSV = async (productId: string = 'animals'): Promise<number> => {
  if (csvCaches[productId]) {
    return csvCaches[productId].length; // Already initialized
  }

  try {
    console.log('Initializing CSV cache for product:', productId);
    
    // Get product config
    const productConfig = getProductById(productId);
    const csvFile = productConfig?.csvFile || 'studykey_animals.csv';
    
    // Use bundled CSV data for production reliability
    let csvContent: string = '';
    
    if (csvFile === 'studykey_animals.csv' || productId === 'animals') {
      // Use bundled animals CSV data
      csvContent = studyKeyAnimalsCSV;
      console.log('Using bundled animals CSV data');
    } else if (csvFile === 'toddlers.csv' || productId === 'family') {
      // Use bundled toddlers CSV data
      csvContent = toddlersCSV;
      console.log('Using bundled toddlers CSV data');
    } else {
      // For other products, try fetch as fallback (development mode)
      console.log('Trying fetch for', csvFile);
      try {
        const response = await fetch(`/${csvFile}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        csvContent = await response.text();
      } catch (fetchError) {
        console.error('Fetch failed, using fallback data:', fetchError);
        // Use fallback data if both bundled and fetch fail
        csvContent = studyKeyAnimalsCSV;
      }
    }
    
    if (!csvContent) {
      throw new Error('CSV content is empty');
    }
    
    const parsed = Papa.parse<string[]>(csvContent, { skipEmptyLines: true });
    const rows: string[][] = (parsed.data as unknown as string[][]) || [];

    console.log(`CSV loaded for ${productId}, total rows:`, rows.length);

    // Parse all rows into cards
    const cards: StudyKeyCard[] = [];
    for (let i = 0; i < rows.length; i++) {
      const card = parseRowToCard(rows[i], i);
      if (card) {
        cards.push(card);
      }
    }

    csvCaches[productId] = cards;
    csvTotalRows[productId] = cards.length;
    console.log(`CSV cache initialized for ${productId} with`, cards.length, 'cards');

    return cards.length;
  } catch (error) {
    console.error(`Error initializing CSV for ${productId}:`, error);
    csvCaches[productId] = fallbackCards;
    csvTotalRows[productId] = fallbackCards.length;
    console.log(`Using fallback data for ${productId} with`, fallbackCards.length, 'cards');
    return fallbackCards.length;
  }
};

// Get cards for a specific range (for pagination) - now product-aware
export const getCardsRange = (
  startIndex: number,
  count: number,
  productId: string = 'animals'
): StudyKeyCard[] => {
  const cache = csvCaches[productId];
  if (!cache) {
    console.warn(`CSV not initialized for product ${productId}, returning fallback`);
    return fallbackCards.slice(startIndex, startIndex + count);
  }

  const endIndex = Math.min(startIndex + count, cache.length);
  const cards = cache.slice(startIndex, endIndex);

  console.log(
    `Getting cards ${startIndex} to ${endIndex - 1} for ${productId} (${cards.length} cards)`
  );
  return cards;
};

// Get total number of available cards - now product-aware
export const getTotalCardCount = (productId: string = 'animals'): number => {
  return csvTotalRows[productId] || 0;
};

// Legacy function for backward compatibility
export const loadAnimalsFromCSV = async (productId: string = 'animals'): Promise<StudyKeyCard[]> => {
  await initializeCSV(productId);
  return csvCaches[productId] || fallbackCards;
};
