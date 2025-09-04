import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MenuGalleryNew = ({ categories, onAddItem }) => {
  const [selectedCategory, setSelectedCategory] = useState('coffee');

  // Category mapping
  const categoryMap = {
    'Coffee & More': { icon: 'local-cafe', key: 'coffee' },
    'Beverages': { icon: 'emoji-food-beverage', key: 'coolers' },
    'Alcohol': { icon: 'local-bar', key: 'alcohol' },
    'Snacks': { icon: 'restaurant', key: 'snacks' },
  };

  // Get current category items
  const getCurrentItems = () => {
    const currentCategory = categories.find(cat => 
      categoryMap[cat.name]?.key === selectedCategory
    );
    return currentCategory ? currentCategory.items : [];
  };

  const currentItems = getCurrentItems();

  const renderCategoryTab = (category) => {
    const categoryInfo = categoryMap[category.name];
    if (!categoryInfo) return null;

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryTab,
          selectedCategory === categoryInfo.key && styles.selectedTab
        ]}
        onPress={() => setSelectedCategory(categoryInfo.key)}
      >
        <Icon 
          name={categoryInfo.icon} 
          size={24} 
          color={selectedCategory === categoryInfo.key ? '#FF6B35' : '#666'} 
        />
        <Text style={[
          styles.tabText,
          selectedCategory === categoryInfo.key && styles.selectedTabText
        ]}>
          {category.name.split(' ')[0]}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItemCard}>
      <Image 
        source={{ uri: `https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=${encodeURIComponent(item.name)}` }} 
        style={styles.itemImage} 
      />
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>₱{item.price}</Text>
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => onAddItem(item)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Items</Text>
        <TouchableOpacity>
          <Text style={styles.customizeText}>Customize Menu</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        {categories.map(renderCategoryTab)}
      </View>

      {/* Menu Grid */}
      <FlatList
        data={currentItems.slice(0, 10)} // Limit to 10 items for 2x5 grid
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.menuGrid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  customizeText: {
    fontSize: 14,
    color: '#FF6B35',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryTab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  selectedTab: {
    backgroundColor: '#FFF0E6',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  selectedTabText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  menuGrid: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  menuItemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    margin: 6,
    width: '45%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default MenuGalleryNew;
