// Device logging for production APK debugging
// This stores logs on device storage for manual inspection

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

class RemoteLogger {
  private static logs: string[] = [];
  private static maxLogs = 200; // Store more logs for debugging
  private static isInitialized = false;

  private static async initializeLogging() {
    if (this.isInitialized) return;
    
    try {
      // Create logs directory
      const logDir = `${FileSystem.documentDirectory}studykey_logs/`;
      const dirInfo = await FileSystem.getInfoAsync(logDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(logDir, { intermediates: true });
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize logging:', error);
    }
  }

  static async log(message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    const logEntry = `[${timestamp}] ${message} ${formattedArgs}`;
    
    // Always log to console for immediate viewing
    console.log(`[DEVICE LOG] ${message}`, ...args);
    
    // Store in memory
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }
    
    // Save to device storage (both AsyncStorage and file)
    await this.saveToStorage(logEntry);
  }

  static async error(message: string, error: any) {
    const errorMsg = `ERROR: ${message} - ${error?.message || error}`;
    await this.log(errorMsg);
  }

  private static async saveToStorage(logEntry: string) {
    try {
      await this.initializeLogging();
      
      // Save to AsyncStorage
      await this.saveToAsyncStorage();
      
      // Save to file system
      await this.saveToFile(logEntry);
    } catch (error) {
      console.error('Failed to save log:', error);
    }
  }

  private static async saveToAsyncStorage() {
    try {
      await AsyncStorage.setItem('studykey_debug_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save to AsyncStorage:', error);
    }
  }

  private static async saveToFile(logEntry: string) {
    try {
      const logFile = `${FileSystem.documentDirectory}studykey_logs/debug_log.txt`;
      
      // Append to file
      await FileSystem.writeAsStringAsync(logFile, logEntry + '\n', {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (error) {
      console.error('Failed to save to file:', error);
    }
  }

  // Get logs from AsyncStorage
  static async getLogs(): Promise<string[]> {
    try {
      const logs = await AsyncStorage.getItem('studykey_debug_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to get logs:', error);
      return [];
    }
  }

  // Get logs from file system
  static async getLogsFromFile(): Promise<string> {
    try {
      const logFile = `${FileSystem.documentDirectory}studykey_logs/debug_log.txt`;
      const fileInfo = await FileSystem.getInfoAsync(logFile);
      
      if (fileInfo.exists) {
        return await FileSystem.readAsStringAsync(logFile);
      }
      return 'No log file found';
    } catch (error) {
      console.error('Failed to read log file:', error);
      return 'Error reading log file';
    }
  }

  // Get log file path for sharing
  static async getLogFilePath(): Promise<string> {
    return `${FileSystem.documentDirectory}studykey_logs/debug_log.txt`;
  }

  // Clear all logs
  static async clearLogs() {
    try {
      // Clear memory
      this.logs = [];
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('studykey_debug_logs');
      
      // Clear file
      const logFile = `${FileSystem.documentDirectory}studykey_logs/debug_log.txt`;
      const fileInfo = await FileSystem.getInfoAsync(logFile);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(logFile);
      }
      
      console.log('All debug logs cleared from device');
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  // Get storage information for debugging
  static async getStorageInfo() {
    try {
      const logs = await AsyncStorage.getItem('studykey_debug_logs');
      const logCount = logs ? JSON.parse(logs).length : 0;
      
      const logFile = `${FileSystem.documentDirectory}studykey_logs/debug_log.txt`;
      const fileInfo = await FileSystem.getInfoAsync(logFile);
      
      return {
        memoryLogs: this.logs.length,
        asyncStorageLogs: logCount,
        fileExists: fileInfo.exists,
        fileSize: fileInfo.exists ? fileInfo.size : 0,
        filePath: logFile
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return null;
    }
  }

  // Export logs as formatted string for sharing
  static async exportAllLogs(): Promise<string> {
    try {
      const fileContent = await this.getLogsFromFile();
      const storageInfo = await this.getStorageInfo();
      
      return `=== StudyKey Debug Logs ===\n` +
             `Generated: ${new Date().toISOString()}\n` +
             `Storage Info: ${JSON.stringify(storageInfo, null, 2)}\n` +
             `\n=== File Logs ===\n` +
             fileContent;
    } catch (error) {
      return `Error exporting logs: ${error}`;
    }
  }
}

export default RemoteLogger;