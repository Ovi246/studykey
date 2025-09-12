import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TODDLER_CATEGORIES, ToddlerCategory } from '../types/toddlerTypes';

export default function ToddlerLearningPage() {
  const handleGoBack = () => {
    router.back();
  };

  const handleCategoryPress = (category: ToddlerCategory) => {
    // Navigate to category-specific learning experience
    router.push({
      pathname: '/toddler-category',
      params: { categoryId: category.id }
    });
  };

  const renderCategoryCard = (category: ToddlerCategory) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={category.gradient}
        style={styles.categoryGradient}
      >
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.categoryBadgeText}>{category.badge}</Text>
          </View>
        </View>
        
        <View style={styles.categoryContent}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
          
          <View style={styles.categoryStats}>
            <Text style={styles.categoryCardCount}>{category.cardCount} Cards</Text>
          </View>
          
          <View style={styles.featuresList}>
            {category.features.map((feature, index) => (
              <Text key={index} style={styles.featureItem}>✓ {feature}</Text>
            ))}
          </View>
          
          <View style={styles.categoryButton}>
            <Text style={styles.categoryButtonText}>{category.buttonText}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#87CEEB', '#4682B4']} // Sky blue gradient for toddler categories
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>🎮 Choose Your Learning Adventure!</Text>
          <Text style={styles.subtitle}>Interactive learning for toddlers ages 2-5!</Text>
          
          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: '#FF4500' }]}>
              <Text style={styles.statNumber}>72</Text>
              <Text style={styles.statLabel}>Total Cards</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#32CD32' }]}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#FF6347' }]}>
              <Text style={styles.statNumber}>Ages 2-5</Text>
              <Text style={styles.statLabel}>Content</Text>
            </View>
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          {TODDLER_CATEGORIES.map(renderCategoryCard)}
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
    paddingBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FF4500',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  categoriesContainer: {
    gap: 20,
  },
  categoryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  categoryGradient: {
    padding: 20,
    minHeight: 200,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
    lineHeight: 20,
  },
  categoryStats: {
    marginBottom: 15,
  },
  categoryCardCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '500',
  },
  categoryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});