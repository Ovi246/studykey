import { ImageSourcePropType } from 'react-native';

export interface ProductConfig {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  image: ImageSourcePropType;
  color: string;
  csvFile?: string; // For future expansion to multiple CSV files
  enabled: boolean;
  componentType: 'flashcards' | 'custom' | 'game' | 'quiz' | 'mindfulness' | 'interactive';
  routePath?: string; // Custom route path for non-flashcard components
}

export const PRODUCTS: ProductConfig[] = [
   {
    id: 'family',
    name: 'Toddler Learning',
    description: 'Fun and safe learning for young children',
    cardCount: 72,
    difficulty: 'Beginner',
    image: require('../assets/images/favicon.webp'),
    color: '#32CD32',
    csvFile: 'toddlers.csv', // Updated to reference the correct CSV file
    enabled: true,
    componentType: 'interactive', // Custom interactive component for toddlers
    routePath: '/toddler-learning', // Custom route
  },
  {
    id: 'animals',
    name: 'Multi-Set Master',
    description: 'Premium collection with advanced learning features',
    cardCount: 500,
    difficulty: 'Advanced',
    image: require('../assets/images/elephhant.png'),
    color: '#FF4500',
    csvFile: 'studykey_animals.csv',
    enabled: true,
    componentType: 'flashcards', // Uses traditional flashcard component
  },
  {
    id: 'food',
    name: 'Noun Flashcards',
    description: 'Build your vocabulary with essential nouns',
    cardCount: 300,
    difficulty: 'Intermediate',
    image: require('../assets/images/favicon.webp'),
    color: '#6A5ACD',
    csvFile: 'studykey_food.csv', // Future expansion
    enabled: true,
    componentType: 'flashcards', // Uses traditional flashcard component
  },
 
  {
    id: 'travel',
    name: 'Travel & Places',
    description: 'Vocabulary for traveling and describing locations',
    cardCount: 45,
    difficulty: 'Intermediate',
    image: require('../assets/images/favicon.webp'),
    color: '#2196F3',
    csvFile: 'studykey_travel.csv', // Future expansion
    enabled: false, // Not yet available
    componentType: 'game', // Travel adventure game component
    routePath: '/travel-adventure', // Custom route
  },
  {
    id: 'business',
    name: 'Daily Affirmations',
    description: 'Positive mindset and personal growth',
    cardCount: 75,
    difficulty: 'Advanced',
    image: require('../assets/images/favicon.webp'),
    color: '#FF1744',
    csvFile: 'studykey_business.csv', // Future expansion
    enabled: true,
    componentType: 'mindfulness', // Mindfulness/affirmation component
    routePath: '/daily-affirmations', // Custom route
  },
];

// Helper function to get the appropriate route for a product
export const getProductRoute = (product: ProductConfig): string => {
  if (product.componentType === 'flashcards') {
    return `/flashcards?product=${product.id}`;
  } else if (product.routePath) {
    return product.routePath;
  } else {
    // Fallback to flashcards if no custom route is specified
    return `/flashcards?product=${product.id}`;
  }
};

// Helper function to get component type description
export const getComponentTypeDescription = (componentType: ProductConfig['componentType']): string => {
  switch (componentType) {
    case 'flashcards':
      return 'Traditional flashcard learning experience';
    case 'interactive':
      return 'Interactive learning games and activities';
    case 'game':
      return 'Gamified learning adventure';
    case 'quiz':
      return 'Interactive quiz and assessment';
    case 'mindfulness':
      return 'Mindfulness and affirmation experience';
    case 'custom':
      return 'Custom learning experience';
    default:
      return 'Learning experience';
  }
};

// Helper functions
export const getProductById = (id: string): ProductConfig | undefined => {
  return PRODUCTS.find(product => product.id === id);
};

export const getEnabledProducts = (): ProductConfig[] => {
  return PRODUCTS.filter(product => product.enabled);
};

export const getDifficultyColor = (difficulty: ProductConfig['difficulty']): string => {
  switch (difficulty) {
    case 'Beginner':
      return '#4CAF50';
    case 'Intermediate':
      return '#FF9800';
    case 'Advanced':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

// Progress tracking types
export interface ProductProgress {
  productId: string;
  currentIndex: number;
  totalCards: number;
  lastStudied: string; // ISO date string
  completed: boolean;
}

// Storage keys for progress tracking
export const STORAGE_KEYS = {
  LAST_PRODUCT: 'studykey_last_product',
  HAS_PROGRESS: 'studykey_progress',
  PRODUCT_PROGRESS: (productId: string) => `studykey_progress_${productId}`,
  PRODUCT_METADATA: (productId: string) => `studykey_meta_${productId}`,
} as const;