import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DailyAffirmationsPage() {
  const handleGoBack = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={['#E91E63', '#AD1457']} // Pink gradient for mindfulness
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>🧘 Daily Affirmations</Text>
        <Text style={styles.subtitle}>Mindfulness and personal growth journey</Text>
        
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonIcon}>✨</Text>
          <Text style={styles.comingSoonTitle}>Mindful Experience Coming Soon!</Text>
          <Text style={styles.comingSoonText}>
            We're crafting a beautiful mindfulness experience to help you start each day with positivity and intention.
          </Text>
          
          <View style={styles.featuresList}>
            <Text style={styles.featureTitle}>What's Coming:</Text>
            <Text style={styles.featureItem}>🌅 Daily morning affirmations</Text>
            <Text style={styles.featureItem}>🎵 Soothing background sounds</Text>
            <Text style={styles.featureItem}>📝 Personal growth tracking</Text>
            <Text style={styles.featureItem}>💫 Customizable affirmation sets</Text>
          </View>
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 40,
  },
  comingSoonCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
  },
  comingSoonIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  featuresList: {
    alignSelf: 'stretch',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    textAlign: 'left',
  },
});