import { getProductById, getProductRoute, PRODUCTS } from '@/data/products';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function MenuPage() {
  const products = PRODUCTS; // Show all products, not just enabled ones
  const [debugTaps, setDebugTaps] = useState(0);
  
  const handleProductSelect = (productId: string) => {
    const product = getProductById(productId);
    if (product && product.enabled) {
      // Use the new routing system that supports different component types
      const routePath = getProductRoute(product);
      router.push(routePath as any); // Type assertion needed for dynamic routes
    }
    // Do nothing if product is disabled
  };

  const handleGoBack = () => {
    router.back();
  };

  const getProductIcon = (productId: string) => {
    switch (productId) {
      case 'animals': return '🎯';
      case 'food': return '📚';
      case 'family': return '😊';
      case 'travel': return '✈️';
      case 'business': return '⭐';
      default: return '📖';
    }
  };

  const getCategoryColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#FF4500'; // Deep Orange
      case 'Intermediate': return '#87CEEB'; // Sky Blue
      case 'Advanced': return '#FF6347'; // Tomato (orange-red)
      default: return '#9E9E9E';
    }
  };

  const getCategoryLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'AGES 2-5';
      case 'Intermediate': return 'VOCABULARY BUILDER';
      case 'Advanced': return 'PREMIUM COLLECTION';
      default: return 'ALL AGES';
    }
  };

  const getFeaturesList = (productId: string, cardCount: number) => {
    switch (productId) {
      case 'animals': // Multi-Set Master
        return [
          `${cardCount} Premium Cards`,
          'Game Rules & Challenges',
          'Continuous Audio Play',
          'Advanced Learning'
        ];
      case 'food': // Noun Flashcards
        return [
          `${cardCount} Noun Cards`,
          'Audio Pronunciation',
          'Visual Learning',
          'Perfect for Students'
        ];
      case 'family': // Toddler Learning
        return [
          'Fun Animal Cards',
          'Colors & Shapes',
          'Interactive Audio',
          'Safe & Engaging'
        ];
      case 'business': // Daily Affirmations
        return [
          'Positive Affirmations',
          'Daily Motivation',
          'Mindfulness Practice',
          'Personal Growth'
        ];
      default:
        return [
          `${cardCount} Cards`,
          'Audio Pronunciation',
          'Visual Learning',
          'Perfect for Students'
        ];
    }
  };

  const getComponentTypeLabel = (componentType: string) => {
    switch (componentType) {
      case 'flashcards': return '📚 Flashcards';
      case 'interactive': return '🎮 Interactive';
      case 'game': return '🕹️ Adventure Game';
      case 'quiz': return '❓ Quiz Mode';
      case 'mindfulness': return '🧘 Mindfulness';
      case 'custom': return '✨ Custom Experience';
      default: return '📖 Learning';
    }
  };

  const getComponentTypeColor = (componentType: string) => {
    switch (componentType) {
      case 'flashcards': return '#2196F3'; // Blue
      case 'interactive': return '#4CAF50'; // Green  
      case 'game': return '#FF5722'; // Deep Orange
      case 'quiz': return '#9C27B0'; // Purple
      case 'mindfulness': return '#E91E63'; // Pink
      case 'custom': return '#607D8B'; // Blue Grey
      default: return '#9E9E9E';
    }
  };

  const getButtonText = (product: any) => {
    switch (product.componentType) {
      case 'flashcards': return 'Start Learning! →';
      case 'interactive': return "Let's Play! →";
      case 'game': return 'Start Adventure! →';
      case 'quiz': return 'Take Quiz! →';
      case 'mindfulness': return 'Begin Journey! →';
      case 'custom': return 'Explore Now! →';
      default: return 'Start Learning! →';
    }
  };

  const handleStatsPress = () => {
    setDebugTaps(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        // Reset counter and navigate to debug logs
        setDebugTaps(0);
        router.push('/debug-logs');
      }
      return newCount;
    });
  };



  return (
    <LinearGradient
      colors={['#87CEEB', '#4A90E2']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Choose Your Learning Adventure!</Text>
        <Text style={styles.subtitle}>Interactive flashcards for learners of all ages.{"\n"}Perfect learning experience for everyone!</Text>
        
        {/* Quick stats */}
        <TouchableOpacity onPress={handleStatsPress} activeOpacity={0.8}>
          <View style={styles.statsContainer}>
            <View style={[styles.statBox, styles.statBox1]}>
              <Text style={styles.statNumber}>1100+</Text>
              <Text style={styles.statLabel}>Total Cards</Text>
            </View>
            <View style={[styles.statBox, styles.statBox2]}>
              <Text style={styles.statNumber}>{products.length}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={[styles.statBox, styles.statBox3]}>
              <Text style={styles.statNumber}>All Ages</Text>
              <Text style={styles.statLabel}>Content</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Product Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {products.map((product) => (
          <View key={product.id} style={styles.cardContainer}>
            <View style={styles.productCard}>
              {/* Card Header with Icon */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{getProductIcon(product.id)}</Text>
              </View>
              
              {/* Card Content */}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{product.name}</Text>
                
                {/* Component Type Badge */}
                <View style={[
                  styles.componentTypeBadge,
                  { backgroundColor: getComponentTypeColor(product.componentType) }
                ]}>
                  <Text style={styles.componentTypeText}>{getComponentTypeLabel(product.componentType)}</Text>
                </View>
                
                {/* Category Badge */}
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(product.difficulty) }
                ]}>
                  <Text style={styles.categoryText}>{getCategoryLabel(product.difficulty)}</Text>
                </View>
                
                {/* Features List */}
                <View style={styles.featuresList}>
                  {getFeaturesList(product.id, product.cardCount).map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Text style={styles.checkmark}>✓</Text>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
                
                {/* Action Button */}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: product.enabled ? '#FF4500' : '#cccccc' } // Deep Orange for enabled
                  ]}
                  onPress={() => handleProductSelect(product.id)}
                  disabled={!product.enabled}
                >
                  <Text style={styles.actionButtonText}>
                    {product.enabled ? getButtonText(product) : 'Coming Soon 🔒'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        
        {/* Why Choose Section */}
        <View style={styles.whyChooseSection}>
          <Text style={styles.whyChooseTitle}>Why Choose StudyKey?</Text>
          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>🎆</Text>
            <Text style={styles.benefitTitle}>Beautiful Design</Text>
            <Text style={styles.benefitDesc}>Engaging visuals that make learning fun</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: 'transparent',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
    gap: 8,
  },
  statBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statBox1: {
    backgroundColor: '#FF4500', // Deep Orange
  },
  statBox2: {
    backgroundColor: '#32CD32', // Lime Green
  },
  statBox3: {
    backgroundColor: '#FF6347', // Tomato Orange
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 10,
    color: 'white',
    marginTop: 2,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  cardContainer: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  cardIcon: {
    fontSize: 40,
  },
  cardContent: {
    padding: 20,
    paddingTop: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 15,
  },
  componentTypeBadge: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
  },
  componentTypeText: {
    fontSize: 9,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkmark: {
    fontSize: 14,
    color: '#FF4500', // Deep Orange checkmarks
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  whyChooseSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  whyChooseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  benefitCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#87CEEB', // Sky Blue border
  },
  benefitIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  benefitDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});