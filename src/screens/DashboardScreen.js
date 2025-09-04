import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';

const DashboardScreen = () => {
  const navigation = useNavigation();

  const features = [
    {
      title: 'Inventory & Stock Control',
      description: 'Real-time ingredient tracking and automated stock updates',
      screen: 'Inventory',
      icon: '📦',
    },
    {
      title: 'Menu Management',
      description: 'Customize menu items, prices, and specials',
      screen: 'MenuManagement',
      icon: '🍽️',
    },
    {
      title: 'Order Management',
      description: 'Manage orders and kitchen communication',
      screen: 'OrderManagement',
      icon: '📋',
    },
    {
      title: 'Sales & Billing',
      description: 'Process payments and track sales',
      screen: 'SalesBilling',
      icon: '💰',
    },
    {
      title: 'Analytics & Reports',
      description: 'View sales reports and performance metrics',
      screen: 'Analytics',
      icon: '📊',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Restaurant Management System</Text>
          <Text style={styles.subtitle}>Select a feature to get started</Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={styles.featureCard}
              onPress={() => navigation.navigate(feature.screen)}
            >
              <View style={styles.featureIcon}>
                <Text style={styles.iconText}>{feature.icon}</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  featuresContainer: {
    gap: 15,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureIcon: {
    marginRight: 15,
  },
  iconText: {
    fontSize: 30,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default DashboardScreen;
