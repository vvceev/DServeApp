import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { clearLoginSessions } from '../database/users';
import { useUser } from '../contexts/UserContext';

const CustomHeader = ({ activeScreen }) => {
  const navigation = useNavigation();
  const { user, logout } = useUser();

  const allNavigationItems = [
    { name: 'Dashboard', icon: '🏠', screen: 'Dashboard' },
    { name: 'Sales Report', icon: '📊', screen: 'SalesReport' },
    { name: 'Menu', icon: '🍽️', screen: 'MenuManagement' },
    { name: 'Inventory', icon: '📦', screen: 'Inventory' },
    { name: 'Orders', icon: '📋', screen: 'OrderManagement' },
    { name: 'Order Taking', icon: '🛒', screen: 'OrderTaking' },
  ];

  const getAllowedNavigationItems = () => {
    if (!user || !user.role) return [];

    const role = user.role.toLowerCase();

    if (role === 'admin') {
      return allNavigationItems;
    } else if (role === 'owner') {
      return allNavigationItems.filter(item => item.screen !== 'OrderTaking');
    } else if (role === 'cashier') {
      return allNavigationItems.filter(item =>
        ['OrderTaking', 'OrderManagement', 'Inventory'].includes(item.screen)
      );
    }
    return [];
  };

  const navigationItems = getAllowedNavigationItems();

  const handleNavigation = (screenName) => {
    navigation.navigate(screenName);
  };

  const handleLogout = async () => {
    clearLoginSessions();
    await logout();  // Clear user from context and storage
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.navigationContainer}
          >
            {navigationItems.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.navItem,
                  activeScreen === item.screen && styles.activeNavItem,
                ]}
                onPress={() => handleNavigation(item.screen)}
              >
                <Text style={styles.iconText}>{item.icon}</Text>
                <Text
                  style={[
                    styles.navText,
                    activeScreen === item.screen && styles.activeNavText,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.title}>DServe</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.newLogoutButton}>
            <Text style={styles.newLogoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    minWidth: 50,
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  iconText: {
    fontSize: 24,
    marginBottom: 2,
    textAlign: 'center',
  },
  navText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  activeNavText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  newLogoutButton: {
    marginLeft: 8,
    backgroundColor: '#FF6B35',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  newLogoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CustomHeader;
