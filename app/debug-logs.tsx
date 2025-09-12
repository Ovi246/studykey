import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import RemoteLogger from '@/utils/RemoteLogger';

const { width: screenWidth } = Dimensions.get('window');

export default function DebugLogsScreen() {
  const [logs, setLogs] = useState<string>('Loading logs...');
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const fileContent = await RemoteLogger.getLogsFromFile();
      const info = await RemoteLogger.getStorageInfo();
      
      setLogs(fileContent);
      setStorageInfo(info);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      setLogs(`Error loading logs: ${error}`);
    }
  };

  const clearLogs = async () => {
    Alert.alert(
      'Clear Debug Logs',
      'Are you sure you want to clear all debug logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await RemoteLogger.clearLogs();
            loadLogs();
          },
        },
      ]
    );
  };

  const shareLogs = async () => {
    try {
      const allLogs = await RemoteLogger.exportAllLogs();
      await Share.share({
        message: allLogs,
        title: 'StudyKey Debug Logs',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share logs');
    }
  };

  const testLogging = async () => {
    await RemoteLogger.log('🧪 Test log entry from debug screen');
    await RemoteLogger.error('Test error entry', new Error('This is a test error'));
    loadLogs();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Debug Logs</Text>
        <TouchableOpacity onPress={loadLogs} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Storage Info */}
      {storageInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Memory: {storageInfo.memoryLogs} | Storage: {storageInfo.asyncStorageLogs} | 
            File: {storageInfo.fileExists ? `${(storageInfo.fileSize / 1024).toFixed(1)}KB` : 'None'}
          </Text>
          <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={testLogging} style={[styles.button, styles.testButton]}>
          <Text style={styles.buttonText}>Test Logging</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={shareLogs} style={[styles.button, styles.shareButton]}>
          <Text style={styles.buttonText}>Share Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={clearLogs} style={[styles.button, styles.clearButton]}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      {/* Logs Display */}
      <ScrollView style={styles.logsContainer} showsVerticalScrollIndicator={true}>
        <Text style={styles.logsText}>{logs}</Text>
      </ScrollView>

      {/* Footer Help */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Logs are automatically saved to device storage. Share logs to send via email/messages.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#4A90E2',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 10,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#2196F3',
  },
  shareButton: {
    backgroundColor: '#4CAF50',
  },
  clearButton: {
    backgroundColor: '#FF5722',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    margin: 10,
    borderRadius: 8,
    padding: 15,
  },
  logsText: {
    color: '#00ff00',
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  footer: {
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});