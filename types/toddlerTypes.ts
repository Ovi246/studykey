export interface ToddlerCard {
  id: number;
  front: {
    text: string;
    pronunciation?: string;
    sentence?: string;
  };
  back: {
    text: string;
    pronunciation?: string;
    sentence?: string;
    sound?: string;
  };
  category: 'fruits-colors' | 'numbers-objects' | 'animals-letters' | 'shapes';
}

export interface ToddlerCategory {
  id: 'fruits-colors' | 'numbers-objects' | 'animals-letters' | 'shapes';
  name: string;
  icon: string;
  description: string;
  cardCount: number;
  color: string;
  gradient: [string, string];
  badge: string;
  features: string[];
  buttonText: string;
}

export const TODDLER_CATEGORIES: ToddlerCategory[] = [
  {
    id: 'fruits-colors',
    name: 'Fruits & Colors',
    icon: '🍎',
    description: 'Learn fruit names and their colors',
    cardCount: 11,
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF8E8E'],
    badge: 'COLORS & FRUITS',
    features: ['11 Fruit Names', 'Color Learning', 'Audio Pronunciation', 'Visual Learning'],
    buttonText: 'Learn Colors! →'
  },
  {
    id: 'numbers-objects',
    name: 'Numbers & Objects',
    icon: '🔢',
    description: 'Count objects and learn numbers 1-20',
    cardCount: 20,
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#6EE3D6'],
    badge: 'COUNTING PRACTICE',
    features: ['Numbers 1-20', 'Object Counting', 'Interactive Questions', 'Number Recognition'],
    buttonText: 'Start Counting! →'
  },
  {
    id: 'animals-letters',
    name: 'Animals & Letters',
    icon: '🦁',
    description: 'Learn alphabet with animal friends',
    cardCount: 26,
    color: '#45B7D1',
    gradient: ['#45B7D1', '#6BC7E1'],
    badge: 'ALPHABET & ANIMALS',
    features: ['A-Z Letters', 'Animal Sounds', 'Letter Recognition', 'Fun Audio'],
    buttonText: 'Meet Animals! →'
  },
  {
    id: 'shapes',
    name: 'Shapes',
    icon: '🔷',
    description: 'Discover basic geometric shapes',
    cardCount: 15,
    color: '#96CEB4',
    gradient: ['#96CEB4', '#B6DEC4'],
    badge: 'SHAPE DISCOVERY',
    features: ['15 Basic Shapes', 'Shape Names', 'Geometry Basics', 'Visual Recognition'],
    buttonText: 'Explore Shapes! →'
  }
];