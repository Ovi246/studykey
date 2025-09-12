import { ToddlerCard } from '../types/toddlerTypes';

// Sample fallback data for each category
const fallbackData = {
  'fruits-colors': [
    {
      id: 1,
      front: { text: 'Apple', pronunciation: 'AP-uhl', sentence: 'What color is the apple?' },
      back: { text: 'Red', pronunciation: 'RED', sentence: 'The apple is red.' },
      category: 'fruits-colors' as const
    },
    {
      id: 2,
      front: { text: 'Banana', pronunciation: 'Buh-NAN-uh', sentence: 'What color are the bananas?' },
      back: { text: 'Yellow', pronunciation: 'YEL-oh', sentence: 'The bananas are yellow.' },
      category: 'fruits-colors' as const
    }
  ],
  'numbers-objects': [
    {
      id: 1,
      front: { text: 'Plane', pronunciation: 'PLAYN', sentence: 'How many planes do you see?' },
      back: { text: 'One', pronunciation: 'WUN', sentence: 'I see 1 plane!' },
      category: 'numbers-objects' as const
    },
    {
      id: 2,
      front: { text: 'Train', pronunciation: 'TRAYN', sentence: 'How many trains do you see?' },
      back: { text: 'Two', pronunciation: 'TOO', sentence: 'I see 2 trains!' },
      category: 'numbers-objects' as const
    }
  ],
  'animals-letters': [
    {
      id: 1,
      front: { text: 'A', pronunciation: '[ey]', sentence: 'A is for alligator.' },
      back: { text: 'Alligator', pronunciation: 'AL-ih-gay-ter', sentence: 'The alligator goes snap, snap!', sound: 'Snap!' },
      category: 'animals-letters' as const
    },
    {
      id: 2,
      front: { text: 'B', pronunciation: '[bee]', sentence: 'B is for bear.' },
      back: { text: 'Bear', pronunciation: 'BAYR', sentence: 'The bear says grr, grr!', sound: 'Grrr!' },
      category: 'animals-letters' as const
    }
  ],
  'shapes': [
    {
      id: 1,
      front: { text: 'Circle', pronunciation: 'SUR-kuhl', sentence: 'A circle is round like a ball!' },
      back: { text: 'Circle', pronunciation: 'SUR-kuhl', sentence: 'A circle is round like a ball!' },
      category: 'shapes' as const
    },
    {
      id: 2,
      front: { text: 'Square', pronunciation: 'SK-WAIR', sentence: 'A square has 4 same sides, like a window!' },
      back: { text: 'Square', pronunciation: 'SK-WAIR', sentence: 'A square has 4 same sides, like a window!' },
      category: 'shapes' as const
    }
  ]
};

// Helper function to clean CSV cell data
const cleanCell = (cell: string): string => {
  return cell?.toString().trim().replace(/^"|"/g, '') || '';
};

// Parse fruits and colors section (11 cards)
const parseFruitsColors = (rows: string[][]): ToddlerCard[] => {
  const cards: ToddlerCard[] = [];
  let startIndex = -1;
  
  // Find the start of fruits section
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][1] === 'Name of Fruit') {
      startIndex = i + 1;
      break;
    }
  }
  
  if (startIndex === -1) return fallbackData['fruits-colors'];
  
  // Parse fruit cards (rows 1-11)
  for (let i = startIndex; i < rows.length && i < startIndex + 11; i++) {
    const row = rows[i];
    if (row[0] && row[1] && row[4] && cleanCell(row[0]).match(/^\d+$/)) {
      cards.push({
        id: parseInt(cleanCell(row[0])) || cards.length + 1,
        front: {
          text: cleanCell(row[1]),
          pronunciation: cleanCell(row[2]),
          sentence: cleanCell(row[3])
        },
        back: {
          text: cleanCell(row[4]),
          pronunciation: cleanCell(row[5]),
          sentence: cleanCell(row[6])
        },
        category: 'fruits-colors'
      });
    }
  }
  
  return cards.length > 0 ? cards : fallbackData['fruits-colors'];
};

// Parse numbers and objects section (20 cards)
const parseNumbersObjects = (rows: string[][]): ToddlerCard[] => {
  const cards: ToddlerCard[] = [];
  let startIndex = -1;
  
  // Find the start of numbers section (after fruits)
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][1] === 'Object') {
      startIndex = i + 1;
      break;
    }
  }
  
  if (startIndex === -1) return fallbackData['numbers-objects'];
  
  // Parse number cards (rows 1-20)
  for (let i = startIndex; i < rows.length && i < startIndex + 20; i++) {
    const row = rows[i];
    if (row[0] && row[1] && row[4] && cleanCell(row[0]).match(/^\d+$/)) {
      cards.push({
        id: parseInt(cleanCell(row[0])) || cards.length + 1,
        front: {
          text: cleanCell(row[1]),
          pronunciation: cleanCell(row[2]),
          sentence: cleanCell(row[3])
        },
        back: {
          text: cleanCell(row[4]),
          pronunciation: cleanCell(row[5]),
          sentence: cleanCell(row[6])
        },
        category: 'numbers-objects'
      });
    }
  }
  
  return cards.length > 0 ? cards : fallbackData['numbers-objects'];
};

// Parse animals and letters section (26 cards)
const parseAnimalsLetters = (rows: string[][]): ToddlerCard[] => {
  const cards: ToddlerCard[] = [];
  let startIndex = -1;
  
  // Find the start of letters section
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][1] === 'Letter') {
      startIndex = i + 1;
      break;
    }
  }
  
  if (startIndex === -1) return fallbackData['animals-letters'];
  
  // Parse letter cards (rows 1-26)
  for (let i = startIndex; i < rows.length && i < startIndex + 26; i++) {
    const row = rows[i];
    if (row[0] && row[1] && row[4] && cleanCell(row[0]).match(/^\d+$/)) {
      cards.push({
        id: parseInt(cleanCell(row[0])) || cards.length + 1,
        front: {
          text: cleanCell(row[1]),
          pronunciation: cleanCell(row[2]),
          sentence: cleanCell(row[3])
        },
        back: {
          text: cleanCell(row[4]),
          pronunciation: cleanCell(row[5]),
          sentence: cleanCell(row[6]),
          sound: cleanCell(row[8]) || cleanCell(row[7]) // Sound from column 8 or 7
        },
        category: 'animals-letters'
      });
    }
  }
  
  return cards.length > 0 ? cards : fallbackData['animals-letters'];
};

// Parse shapes section (15 cards)
const parseShapes = (rows: string[][]): ToddlerCard[] => {
  const cards: ToddlerCard[] = [];
  let startIndex = -1;
  
  // Find the start of shapes section
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][1] === 'Shape') {
      startIndex = i + 1;
      break;
    }
  }
  
  if (startIndex === -1) return fallbackData['shapes'];
  
  // Parse shape cards (rows 1-15)
  for (let i = startIndex; i < rows.length && i < startIndex + 15; i++) {
    const row = rows[i];
    if (row[0] && row[1] && cleanCell(row[0]).match(/^\d+$/)) {
      const shapeText = cleanCell(row[1]);
      const shapeSentence = cleanCell(row[3]);
      cards.push({
        id: parseInt(cleanCell(row[0])) || cards.length + 1,
        front: {
          text: shapeText,
          pronunciation: cleanCell(row[2]),
          sentence: shapeSentence
        },
        back: {
          text: shapeText,
          pronunciation: cleanCell(row[2]),
          sentence: shapeSentence
        },
        category: 'shapes'
      });
    }
  }
  
  return cards.length > 0 ? cards : fallbackData['shapes'];
};

// Main function to load toddler cards by category
export const loadToddlerCards = async (categoryId: string): Promise<ToddlerCard[]> => {
  try {
    // Import bundled CSV data for production reliability
    const { toddlersCSV } = await import('./csvData');
    const csvText = toddlersCSV;
    
    console.log(`Loading ${categoryId} from bundled CSV data...`);
    
    // Simple CSV parsing (handling the complex structure of this file)
    const rows = csvText.split('\n').map(row => {
      // Handle quoted fields that might contain commas
      const fields: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current);
      
      return fields;
    });
    
    console.log(`Parsed ${rows.length} rows from CSV`);
    
    // Parse different sections based on category
    let result: ToddlerCard[] = [];
    switch (categoryId) {
      case 'fruits-colors':
        result = parseFruitsColors(rows);
        break;
      case 'numbers-objects':
        result = parseNumbersObjects(rows);
        break;
      case 'animals-letters':
        result = parseAnimalsLetters(rows);
        break;
      case 'shapes':
        result = parseShapes(rows);
        break;
      default:
        result = [];
    }
    
    console.log(`Loaded ${result.length} cards for ${categoryId}`);
    return result;
    
  } catch (error) {
    console.error('Error loading toddler cards:', error);
    return fallbackData[categoryId as keyof typeof fallbackData] || [];
  }
};

// Function to load all categories at once
export const loadAllToddlerCards = async (): Promise<Record<string, ToddlerCard[]>> => {
  const categories = ['fruits-colors', 'numbers-objects', 'animals-letters', 'shapes'];
  const result: Record<string, ToddlerCard[]> = {};
  
  for (const categoryId of categories) {
    result[categoryId] = await loadToddlerCards(categoryId);
  }
  
  console.log('Loaded all categories:', Object.keys(result).map(key => `${key}: ${result[key].length} cards`));
  return result;
};