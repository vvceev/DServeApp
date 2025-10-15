import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import app from '../database/firebaseConfig';

const db = getFirestore(app);

const ActivityLogsScreen = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logsRef = collection(db, 'userLogs');
    const q = query(logsRef, orderBy('loginTime', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logsData = [];
      querySnapshot.forEach((doc) => {
        logsData.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching logs:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderLogItem = ({ item }) => (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.role}>{item.loggedinAs}</Text>
      </View>
      <View style={styles.logDetails}>
        <Text style={styles.dateTime}>
          {new Date(item.loginTime.seconds * 1000).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading activity logs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Logs</Text>
        <Text style={styles.subtitle}>Recent user login activities</Text>
      </View>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={renderLogItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 10,
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  role: {
    fontSize: 14,
    color: '#FF6B35',
    textTransform: 'capitalize',
  },
  logDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTime: {
    fontSize: 14,
    color: '#666',
  },
});

export default ActivityLogsScreen;
