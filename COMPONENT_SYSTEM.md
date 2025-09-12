# Product Component System

## Overview
The StudyKey app now supports multiple component types for different learning experiences. Each product can now route to a specialized component instead of only using flashcards.

## Component Types

### 1. **Flashcards** (`componentType: 'flashcards'`)
- Traditional flashcard learning experience
- Routes to: `/flashcards?product={productId}`
- Used by: Multi-Set Master, Noun Flashcards

### 2. **Interactive** (`componentType: 'interactive'`)
- Interactive learning games and activities
- Routes to: Custom route path (e.g., `/toddler-learning`)
- Used by: Toddler Learning
- Features: Child-friendly interface, interactive games

### 3. **Game** (`componentType: 'game'`)
- Gamified learning adventures
- Routes to: Custom route path (e.g., `/travel-adventure`)
- Used by: Travel & Places (coming soon)
- Features: Adventure-style gameplay, achievements

### 4. **Mindfulness** (`componentType: 'mindfulness'`)
- Mindfulness and affirmation experiences
- Routes to: Custom route path (e.g., `/daily-affirmations`)
- Used by: Daily Affirmations
- Features: Calming interface, personal growth tracking

### 5. **Quiz** (`componentType: 'quiz'`)
- Interactive quiz and assessment modes
- Routes to: Custom route path
- Features: Testing, progress tracking

### 6. **Custom** (`componentType: 'custom'`)
- Fully custom learning experiences
- Routes to: Custom route path
- Features: Completely flexible implementation

## Adding New Products

To add a new product with a custom component:

1. **Update products.ts**:
```typescript
{
  id: 'new-product',
  name: 'New Product Name',
  description: 'Product description',
  cardCount: 100,
  difficulty: 'Intermediate',
  image: require('../assets/images/image.png'),
  color: '#FF4500',
  enabled: true,
  componentType: 'custom', // Choose appropriate type
  routePath: '/custom-component', // Custom route path
}
```

2. **Create the component**:
- Create a new file: `app/custom-component.tsx`
- Implement your custom UI/UX
- Include navigation back to menu

3. **Component will automatically appear** in the menu with appropriate styling and routing

## Menu System Features

The menu now displays:
- **Component Type Badge**: Shows what type of experience each product offers
- **Dynamic Button Text**: Button text changes based on component type
- **Color-coded UI**: Different colors for different component types
- **Automatic Routing**: Each product routes to its appropriate component

## Technical Implementation

### Routing System
The `getProductRoute()` function in `products.ts` handles routing logic:
- Flashcard components use the traditional route with product parameter
- Custom components use their specified `routePath`
- Fallback to flashcards if no custom route is specified

### Menu Integration
The menu automatically:
- Detects component types and displays appropriate badges
- Updates button text based on component type
- Handles routing to the correct component
- Shows disabled state for unavailable products

## Future Expansion

To add new component types:
1. Add the type to the `componentType` union in `ProductConfig`
2. Update helper functions in `products.ts`
3. Add styling and labels in `menu.tsx`
4. Create the corresponding component file

This system allows for unlimited expansion while maintaining a consistent user experience.