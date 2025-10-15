import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { clearLoginSessions } from '../database/users';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';

const CustomHeader = ({ activeScreen, hasNotifications = false }) => {
  const navigation = useNavigation();
  const { user, logout } = useUser();
  const { notifications, removeNotification } = useNotification();
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState('all');

  const dismissNotification = (id) => {
    removeNotification(id);
  };

  const allNavigationItems = [
    { name: 'Dashboard', icon: 'home', screen: 'Dashboard' },
    { name: 'Sales Report', icon: 'bar-chart', screen: 'SalesReport' },
    { name: 'Inventory', icon: 'inventory', screen: 'Inventory' },
    { name: 'Orders', icon: 'assignment', screen: 'OrderManagement' },
    { name: 'Order Taking', icon: 'shopping-cart', screen: 'OrderTaking' },
    { name: 'Activity Logs', icon: 'history', screen: 'ActivityLogs' },

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
        ['Dashboard', 'OrderTaking', 'OrderManagement', 'Inventory'].includes(item.screen)
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
          <Image source={require('../../assets/app_images/DServeLogo2.png')} style={styles.logo} />
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
                <Icon name={item.icon} size={24} color="#333" />
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
          <View style={styles.notificationWrapper}>
            <TouchableOpacity
              style={styles.notificationContainer}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <View style={styles.bellWithDot}>
                <Ionicons name="notifications-outline" size={24} color="#333" />
                {notifications.length > 0 && <View style={styles.notificationDot} />}
              </View>
            </TouchableOpacity>
            {showDropdown && (
              <View style={styles.dropdown}>
                <Text style={styles.dropdownTitle}>Low Stock and Expiry Alerts</Text>
                <View style={styles.filterButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      filter === 'low_stock' && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilter('low_stock')}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        filter === 'low_stock' && styles.filterButtonTextActive,
                      ]}
                    >
                      Low Stock
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      filter === 'expiry' && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilter('expiry')}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        filter === 'expiry' && styles.filterButtonTextActive,
                      ]}
                    >
                      Expiry
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      filter === 'all' && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilter('all')}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        filter === 'all' && styles.filterButtonTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={notifications.filter((notification) => filter === 'all' || notification.type === filter)}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.notificationItem}>
                      <Ionicons name="warning" size={16} color="#FFA500" />
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationText}>{item.message}</Text>
                        <Text style={styles.notificationTime}>
                          {new Date(item.timestamp).toLocaleString()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.dismissButton}
                        onPress={() => dismissNotification(item.id)}
                      >
                        <Ionicons name="close" size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                  )}
                  style={styles.notificationsScrollView}
                  showsVerticalScrollIndicator={true}
                  scrollEnabled={true}
                  pointerEvents="auto"
                />
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowDropdown(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <Text style={styles.title}>{user && user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'DServe'}</Text>
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
  notificationContainer: {
    position: 'relative',
    marginRight: 8,
  },
  bellWithDot: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
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
  logo: {
    width: 45,
    height: 45,
    marginRight: 10,
    marginTop: 5,
    resizeMode: 'contain',
    zIndex: 1,
  },
  notificationWrapper: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    width: 250,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 6,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 8,
  },
  dismissButton: {
    marginLeft: 8,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  closeText: {
    color: '#007AFF',
    fontSize: 14,
  },
  notificationsScrollView: {
    flex: 1,
  },

});

export default CustomHeader;
