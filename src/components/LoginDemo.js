import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { getRecentLogins, getUsersByRole } from '../database/users';

const LoginDemo = () => {
  const recentLogins = getRecentLogins();
  const cashiers = getUsersByRole('cashier');
  const owners = getUsersByRole('owner');
  const admins = getUsersByRole('admin');

  const clearLogins = () => {
    // In a real app, this would clear the session storage
    console.log('Login sessions cleared');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Pre-made User Accounts</Text>
        
        <View style={styles.userSection}>
          <Text style={styles.sectionTitle}>Cashier Account:</Text>
          {cashiers.map(user => (
            <View key={user.id} style={styles.userCard}>
              <Text style={styles.userText}>Username: {user.username}</Text>
              <Text style={styles.userText}>Password: password123</Text>
              <Text style={styles.userText}>Role: {user.role}</Text>
            </View>
          ))}
        </View>

        <View style={styles.userSection}>
          <Text style={styles.sectionTitle}>Owner Account:</Text>
          {owners.map(user => (
            <View key={user.id} style={styles.userCard}>
              <Text style={styles.userText}>Username: {user.username}</Text>
              <Text style={styles.userText}>Password: password123</Text>
              <Text style={styles.userText}>Role: {user.role}</Text>
            </View>
          ))}
        </View>

        <View style={styles.userSection}>
          <Text style={styles.sectionTitle}>Admin Account:</Text>
          {admins.map(user => (
            <View key={user.id} style={styles.userCard}>
              <Text style={styles.userText}>Username: {user.username}</Text>
              <Text style={styles.userText}>Password: password123</Text>
              <Text style={styles.userText}>Role: {user.role}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Recent Login Sessions</Text>
        {recentLogins.length === 0 ? (
          <Text style={styles.noLogins}>No login sessions yet. Try logging in!</Text>
        ) : (
          recentLogins.map(session => (
            <View key={session.id} style={styles.loginCard}>
              <Text style={styles.loginText}>User: {session.username}</Text>
              <Text style={styles.loginText}>Role: {session.role}</Text>
              <Text style={styles.loginText}>Time: {session.loginTime.toLocaleString()}</Text>
            </View>
          ))
        )}
        
        <TouchableOpacity style={styles.clearButton} onPress={clearLogins}>
          <Text style={styles.clearButtonText}>Clear Sessions</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  userSection: {
    marginBottom: 15,
  },
  userCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  loginCard: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  loginText: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 3,
  },
  noLogins: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  clearButton: {
    backgroundColor: '#ff5252',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginDemo;
