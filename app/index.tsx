import { getProductById, PRODUCTS } from '@/data/products';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LandingPage() {
  const [lastProduct, setLastProduct] = useState<string | null>(null);
  const [hasProgress, setHasProgress] = useState(false);
  const [lastCategory, setLastCategory] = useState<string | null>(null);
  const [hasToddlerProgress, setHasToddlerProgress] = useState(false);
  const [lastVisited, setLastVisited] = useState<{type: string, id: string} | null>(null);

  // Check progress when component mounts and when it comes back into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🚀 Landing page focused - checking progress');
      checkProgress();
    }, [])
  );

  const checkProgress = async () => {
    try {
      console.log('📋 Checking user progress...');
      
      // First, check for toddler category progress and find the last accessed category
      const toddlerCategories = ['fruits-colors', 'numbers-objects', 'animals-letters', 'shapes'];
      let lastAccessedCategory: string | null = null;
      let mostRecentProgressTime = 0;
      
      // Also check for explicitly saved last category
      const savedLastCategory = await AsyncStorage.getItem('toddler_last_category');
      
      for (const category of toddlerCategories) {
        const progressKey = `toddler_progress_${category}`;
        const savedProgress = await AsyncStorage.getItem(progressKey);
        if (savedProgress) {
          const progressIndex = parseInt(savedProgress, 10);
          if (progressIndex > 0) {
            console.log(`✅ Found toddler progress for: ${category}`);
            
            // Check if this is the explicitly saved last category
            if (category === savedLastCategory) {
              lastAccessedCategory = category;
              break;
            }
            
            // Otherwise, find the category with the highest progress index
            if (progressIndex > mostRecentProgressTime) {
              mostRecentProgressTime = progressIndex;
              lastAccessedCategory = category;
            }
          }
        }
      }
      
      if (lastAccessedCategory) {
        console.log(`✅ Setting last accessed toddler category: ${lastAccessedCategory}`);
        setLastCategory(lastAccessedCategory);
        setHasToddlerProgress(true);
      } else {
        console.log('🎆 No toddler progress found');
        setLastCategory(null);
        setHasToddlerProgress(false);
      }
      
      // Then, check for flashcard progress
      const savedProgressFlag = await AsyncStorage.getItem('studykey_progress');
      const savedLastProduct = await AsyncStorage.getItem('studykey_last_product');
      
      console.log('🔍 Progress check - savedProgressFlag:', savedProgressFlag, 'savedLastProduct:', savedLastProduct);
      
      // Check if there's a specific product with progress
      let lastProductWithProgress: string | null = null;
      
      if (savedProgressFlag && savedLastProduct) {
        // Check if the last product still has progress
        const progressKey = `studykey_progress_${savedLastProduct}`;
        const productProgress = await AsyncStorage.getItem(progressKey);
        console.log('🔍 Checking last product progress -', savedLastProduct, ':', productProgress);
        if (productProgress) {
          lastProductWithProgress = savedLastProduct;
        } else {
          // If the last product doesn't have progress, check all products
          console.log('🔍 Last product has no progress, checking all products...');
          for (const product of PRODUCTS) {
            if (product.componentType === 'flashcards' && product.enabled) {
              const progressKey = `studykey_progress_${product.id}`;
              const productProgress = await AsyncStorage.getItem(progressKey);
              console.log('🔍 Checking product:', product.id, 'progress:', productProgress);
              if (productProgress) {
                lastProductWithProgress = product.id;
                break;
              }
            }
          }
        }
      } else {
        // Check all products for progress
        console.log('🔍 No saved progress flag or last product, checking all products...');
        for (const product of PRODUCTS) {
          if (product.componentType === 'flashcards' && product.enabled) {
            const progressKey = `studykey_progress_${product.id}`;
            const productProgress = await AsyncStorage.getItem(progressKey);
            console.log('🔍 Checking product:', product.id, 'progress:', productProgress);
            if (productProgress) {
              lastProductWithProgress = product.id;
              break;
            }
          }
        }
      }
      
      if (lastProductWithProgress) {
        console.log(`✅ Found saved flashcard progress for: ${lastProductWithProgress}`);
        setLastProduct(lastProductWithProgress);
        setHasProgress(true);
      } else {
        console.log('🎆 No saved flashcard progress found');
        setLastProduct(null);
        setHasProgress(false);
      }
      
      // Check for the last visited product (unified approach)
      const savedLastVisited = await AsyncStorage.getItem('studykey_last_visited');
      if (savedLastVisited) {
        try {
          const lastVisitedData = JSON.parse(savedLastVisited);
          setLastVisited(lastVisitedData);
          console.log('✅ Setting last visited product:', lastVisitedData);
        } catch (parseError) {
          console.error('❌ Error parsing last visited product:', parseError);
        }
      } else {
        console.log('🎆 No last visited product found');
        setLastVisited(null);
      }
    } catch (error) {
      console.error('❌ Error checking progress:', error);
    }
  };

  const handleStartLearning = () => {
    console.log('🎨 Start Learning button pressed');
    router.push('/menu');
  };

  const handleContinue = () => {
    console.log('⏭️ Continue button pressed');
    
    // Use the unified last visited product approach
    if (lastVisited) {
      if (lastVisited.type === 'flashcard') {
        router.push(`/flashcards?product=${lastVisited.id}`);
      } else if (lastVisited.type === 'toddler') {
        router.push({
          pathname: '/toddler-category',
          params: { categoryId: lastVisited.id }
        });
      } else {
        router.push('/menu');
      }
    } else {
      // Fallback to the previous approach
      if (hasProgress && lastProduct) {
        router.push(`/flashcards?product=${lastProduct}`);
      } else if (hasToddlerProgress && lastCategory) {
        router.push({
          pathname: '/toddler-category',
          params: { categoryId: lastCategory }
        });
      } else {
        router.push('/menu');
      }
    }
  };

  // Helper function to format category name
  const formatCategoryName = (categoryId: string) => {
    const categoryNames: Record<string, string> = {
      'fruits-colors': 'Fruits & Colors',
      'numbers-objects': 'Numbers & Objects', 
      'animals-letters': 'Animals & Letters',
      'shapes': 'Shapes'
    };
    
    return categoryNames[categoryId] || categoryId.replace('-', ' ');
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/favicon.webp')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>StudyKey</Text>
        <Text style={styles.subtitle}>Learn Spanish with Flashcards</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleStartLearning}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Start Learning</Text>
          <Text style={styles.buttonSubtext}>Choose your card set</Text>
        </TouchableOpacity>

        {(hasProgress || hasToddlerProgress) && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Continue Where You Left Off</Text>
            <Text style={styles.buttonSubtext}>
              {lastVisited
                ? `Continue with ${lastVisited.type === 'toddler' 
                    ? formatCategoryName(lastVisited.id) 
                    : getProductById(lastVisited.id)?.name || lastVisited.id}`
                : hasToddlerProgress && lastCategory
                  ? `Continue with ${formatCategoryName(lastCategory)}`
                  : hasProgress && lastProduct 
                    ? `Continue with ${getProductById(lastProduct)?.name || lastProduct}` 
                    : 'Resume your progress'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Swipe cards to learn • Double tap to flip</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '300',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  button: {
    width: screenWidth - 80,
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: '#FFD54F',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  primaryButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});