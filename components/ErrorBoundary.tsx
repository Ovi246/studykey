import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RemoteLogger from '../utils/RemoteLogger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 ERROR BOUNDARY CAUGHT:', error);
    
    // Log crash to device storage for APK debugging
    RemoteLogger.error('App crashed - Error Boundary triggered', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      platform: require('react-native').Platform.OS,
      isDev: __DEV__
    });
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 ERROR BOUNDARY DETAILS:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    // Log detailed crash info to device storage
    RemoteLogger.error('Detailed crash information', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>🚨 App Crashed</Text>
          <Text style={styles.message}>
            The app encountered an error and crashed.
          </Text>
          <Text style={styles.error}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#d32f2f',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  error: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#ffe6e6',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    color: '#d32f2f',
  },
  button: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});