import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    console.log('🚀 Landing page mounted');
    checkProgress();
  }, []);

  const checkProgress = async () => {
    try {
      console.log('📋 Checking user progress...');
      const savedProgress = await AsyncStorage.getItem('studykey_progress');
      const savedProduct = await AsyncStorage.getItem('studykey_last_product');
      
      if (savedProgress && savedProduct) {
        console.log(`✅ Found saved progress for: ${savedProduct}`);
        setLastProduct(savedProduct);
        setHasProgress(true);
      } else {
        console.log('🎆 No saved progress found');
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
    if (lastProduct) {
      router.push(`/flashcards?product=${lastProduct}`);
    } else {
      router.push('/menu');
    }
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

        {hasProgress && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Continue Where You Left Off</Text>
            <Text style={styles.buttonSubtext}>
              {lastProduct ? `Continue with ${lastProduct}` : 'Resume your progress'}
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