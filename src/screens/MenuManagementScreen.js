import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  FlatList,
  Image,
} from 'react-native';

const MenuManagementScreen = () => {
  const [menuItems, setMenuItems] = useState([
    {
      id: '1',
      name: 'Margherita Pizza',
      price: 12.99,
      category: 'Pizza',
      description: 'Classic pizza with fresh mozzarella, tomatoes, and basil',
      image: 'https://via.placeholder.com/150',
      isAvailable: true,
      isSpecial: false,
      preparationTime: '15-20 min',
    },
    {
      id: '2',
      name: 'Caesar Salad',
      price: 8.99,
      category: 'Salads',
      description: 'Fresh romaine lettuce with Caesar dressing and croutons',
      image: 'https://via.placeholder.com/150',
      isAvailable: true,
      isSpecial: true,
      preparationTime: '5-10 min',
    },
    {
      id: '3',
      name: 'Grilled Salmon',
      price: 18.99,
      category: 'Main Course',
      description: 'Atlantic salmon with lemon butter sauce and seasonal vegetables',
      image: 'https://via.placeholder.com/150',
      isAvailable: false,
      isSpecial: false,
      preparationTime: '20-25 min',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Pizza', 'Salads', 'Main Course', 'Desserts', 'Beverages'];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItemCard}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.itemPrice}>${item.price}</Text>
          </View>
        </View>
        
        <Text style={styles.itemDescription}>{item.description}</Text>
        
        <View style={styles.itemDetails}>
          <Text style={styles.detailText}>Category: {item.category}</Text>
          <Text style={styles.detailText}>Prep Time: {item.preparationTime}</Text>
        </View>
        
        <View style={styles.itemStatus}>
          <View style={[styles.statusBadge, item.isAvailable ? styles.available : styles.unavailable]}>
            <Text style={styles.statusText}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
          </View>
          {item.isSpecial && (
            <View style={styles.specialBadge}>
              <Text style={styles.specialText}>Special</Text>
            </View>
          )}
        </View>
        
        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, item.isAvailable ? styles.unavailableButton : styles.availableButton]}>
            <Text style={styles.actionButtonText}>
              {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Menu Management</Text>
          <Text style={styles.subtitle}>Customize your restaurant menu</Text>
        </View>

        <View style={styles.controlsContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add New Item</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{menuItems.length}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {menuItems.filter(item => item.isAvailable).length}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {menuItems.filter(item => item.isSpecial).length}
            </Text>
            <Text style={styles.statLabel}>Specials</Text>
          </View>
        </View>

        <FlatList
          data={filteredItems}
          renderItem={renderMenuItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.itemsList}
        />
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
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  controlsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  selectedCategory: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  itemsList: {
    gap: 15,
  },
  menuItemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImage: {
    width: '100%',
    height: 150,
  },
  itemContent: {
    padding: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priceContainer: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  itemDetails: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemStatus: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  available: {
    backgroundColor: '#e8f5e8',
  },
  unavailable: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  specialBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  specialText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  unavailableButton: {
    backgroundColor: '#e3f2fd',
  },
  availableButton: {
    backgroundColor: '#e8f5e8',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default MenuManagementScreen;
