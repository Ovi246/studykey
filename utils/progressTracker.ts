import AsyncStorage from '@react-native-async-storage/async-storage';

// Progress tracking utility functions
export const ProgressTracker = {
  // Save progress for a specific category
  saveProgress: async (categoryId: string, index: number): Promise<void> => {
    try {
      const progressKey = `toddler_progress_${categoryId}`;
      await AsyncStorage.setItem(progressKey, index.toString());
      console.log(`💾 Saved progress for ${categoryId}: card ${index + 1}`);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  },

  // Load progress for a specific category
  loadProgress: async (categoryId: string): Promise<number | null> => {
    try {
      const progressKey = `toddler_progress_${categoryId}`;
      const savedProgress = await AsyncStorage.getItem(progressKey);
      return savedProgress ? parseInt(savedProgress, 10) : null;
    } catch (error) {
      console.error('Error loading progress:', error);
      return null;
    }
  },

  // Clear progress for a specific category
  clearProgress: async (categoryId: string): Promise<void> => {
    try {
      const progressKey = `toddler_progress_${categoryId}`;
      await AsyncStorage.removeItem(progressKey);
      console.log(`🧹 Cleared progress for ${categoryId}`);
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  },

  // Clear all toddler progress
  clearAllProgress: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => key.startsWith('toddler_progress_'));
      if (progressKeys.length > 0) {
        await AsyncStorage.multiRemove(progressKeys);
        console.log(`🧹 Cleared all toddler progress (${progressKeys.length} categories)`);
      }
    } catch (error) {
      console.error('Error clearing all progress:', error);
    }
  },

  // Get progress summary for all categories
  getAllProgress: async (): Promise<Record<string, number | null>> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => key.startsWith('toddler_progress_'));
      const progress: Record<string, number | null> = {};
      
      for (const key of progressKeys) {
        const categoryId = key.replace('toddler_progress_', '');
        const savedProgress = await AsyncStorage.getItem(key);
        progress[categoryId] = savedProgress ? parseInt(savedProgress, 10) : null;
      }
      
      return progress;
    } catch (error) {
      console.error('Error getting all progress:', error);
      return {};
    }
  }
};