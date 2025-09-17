import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import app from '../database/firebaseConfig';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const db = getFirestore(app);
const storage = getStorage(app);

const MenuManagementScreen = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['coffee', 'coolers', 'alcohol', 'snacks'];

  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: '',
    image: null,
  });

  const [editingItem, setEditingItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showEditCategoryDropdown, setShowEditCategoryDropdown] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, 'newMenuItems'));
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setMenuItems(items);
      } catch (err) {
        setError('Failed to load menu items.');
      }
      setLoading(false);
    };
    fetchMenuItems();
  }, []);



  const pickImageFromCamera = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
        return;
      }
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: [ImagePicker.MediaType.image],
      quality: 1,
    });

    if (!result.cancelled) {
      setNewItem({ ...newItem, image: result.uri });
    }
  };

  const pickImageFromCameraForEdit = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
        return;
      }
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: [ImagePicker.MediaType.image],
      quality: 1,
    });

    if (!result.cancelled) {
      setEditingItem({ ...editingItem, image: result.uri });
    }
  };

  const pickImageFromGallery = async () => {
    console.log('pickImageFromGallery called');
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Permission status:', status);
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Sorry, we need gallery permissions to make this work!');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      console.log('Image picker result:', result);

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const filename = extractFilename(uri);
        const extension = filename.split('.').pop().toLowerCase();

        if (!['png', 'jpg', 'jpeg'].includes(extension)) {
          Alert.alert('Invalid File Type', 'Please select a PNG, JPG, or JPEG image.');
          return;
        }

        console.log('Selected image URI:', uri);
        setNewItem({ ...newItem, image: uri });
      } else {
        console.log('Image selection was canceled');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const pickImageFromGalleryForEdit = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need gallery permissions to make this work!');
        return;
      }
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const filename = extractFilename(uri);
      const extension = filename.split('.').pop().toLowerCase();

      if (!['png', 'jpg', 'jpeg'].includes(extension)) {
        Alert.alert('Invalid File Type', 'Please select a PNG, JPG, or JPEG image.');
        return;
      }

      setEditingItem({ ...editingItem, image: uri });
    }
  };

  const extractFilename = (uri) => {
    if (!uri) return null;
    return uri.split('/').pop();
  };



  const formatPrice = (price) => {
    let num = parseInt(price, 10);
    if (isNaN(num)) return '0';
    return num.toString();
  };

  const addItem = async () => {
    if (!newItem.name.trim()) {
      Alert.alert('Validation Error', 'Please enter the item name.');
      return;
    }
    if (!newItem.price || isNaN(newItem.price)) {
      Alert.alert('Validation Error', 'Please enter a valid price.');
      return;
    }

    let imageUrl = null;
    if (newItem.image) {
      try {
        console.log('Starting image save locally for:', newItem.image);
        const filename = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
        const localUri = FileSystem.documentDirectory + filename;
        await FileSystem.copyAsync({ from: newItem.image, to: localUri });
        imageUrl = localUri;
        console.log('Image saved locally at:', imageUrl);
      } catch (error) {
        console.error('Image save error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        Alert.alert('Error', `Failed to save image: ${error.message}`);
        return;
      }
    }

    const itemToAdd = {
      name: newItem.name,
      price: formatPrice(newItem.price),
      category: newItem.category,
      image: imageUrl,
    };
    try {
      const docRef = await addDoc(collection(db, 'newMenuItems'), itemToAdd);
      setMenuItems([{ id: docRef.id, ...itemToAdd }, ...menuItems]);
      setNewItem({ name: '', price: '', category: '', image: null });
    } catch (err) {
      Alert.alert('Error', 'Failed to add item.');
    }
  };

  const updateItem = async (id, updatedFields) => {
    try {
      const itemRef = doc(db, 'newMenuItems', id);

      if (updatedFields.price) {
        updatedFields.price = formatPrice(updatedFields.price);
      }

      if (updatedFields.image && !updatedFields.image.startsWith('http') && !updatedFields.image.startsWith(FileSystem.documentDirectory)) {
        try {
          console.log('Starting image save locally for update:', updatedFields.image);
          const filename = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
          const localUri = FileSystem.documentDirectory + filename;
          await FileSystem.copyAsync({ from: updatedFields.image, to: localUri });
          updatedFields.image = localUri;
          console.log('Image saved locally for update at:', localUri);
        } catch (error) {
          console.error('Image save error details for update:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
          });
          Alert.alert('Error', 'Failed to save image.');
          return;
        }
      }

      await updateDoc(itemRef, updatedFields);
      setMenuItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to update item.');
    }
  };

  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'newMenuItems', id));
      setMenuItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete item.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.leftColumn}>
          <Text style={styles.title}>Add New Menu Item</Text>
          <Text style={styles.inputLabel}>Category</Text>
          <TouchableOpacity
            style={[styles.input, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text>{newItem.category || 'Pick a category'}</Text>
            <Text>▼</Text>
          </TouchableOpacity>
          {showCategoryDropdown && (
            <View style={styles.dropdown}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setNewItem({ ...newItem, category: cat });
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <Text style={styles.inputLabel}>Item Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Item Name"
            value={newItem.name}
            onChangeText={(text) => setNewItem({ ...newItem, name: text })}
          />
          <Text style={styles.inputLabel}>{newItem.category === 'coffee' || newItem.category === 'coolers' ? 'Price (PHP) - Medium size, Large is +10' : 'Price (PHP)'}</Text>
          <TextInput
            style={styles.input}
            placeholder={newItem.category === 'coffee' || newItem.category === 'coolers' ? 'Price (PHP) - Medium' : 'Price (PHP)'}
            keyboardType="numeric"
            value={newItem.price}
            onChangeText={(text) => setNewItem({ ...newItem, price: text })}
          />
          <TouchableOpacity style={styles.imagePicker} onPress={pickImageFromGallery}>
            <Text style={styles.imagePickerText}>
              {newItem.image ? extractFilename(newItem.image) : 'Upload an Image'}
            </Text>
          </TouchableOpacity>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setNewItem({ name: '', price: '', category: '', image: null })}
            >
              <Text style={styles.closeButtonText}>Reset Fields</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.currentItemsTitle}>Current Items</Text>
          <ScrollView>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.idColumn]}>ID</Text>
                <Text style={[styles.tableCell, styles.picColumn]}>IMAGE</Text>
                <Text style={[styles.tableCell, styles.nameColumn]}>ITEM NAME</Text>
                <Text style={[styles.tableCell, styles.priceColumn]}>Price (₱)</Text>
                <Text style={[styles.tableCell, styles.actionColumn]}>Action</Text>
              </View>
              {menuItems.map((item, index) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.idColumn]}>{index + 1}</Text>
                  <View style={[styles.tableCell, styles.picColumn]}>
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text>No Image</Text>
                    )}
                  </View>
                  <Text style={[styles.tableCell, styles.nameColumn]}>{item.name}</Text>
                  <Text style={[styles.tableCell, styles.priceColumn]}>
                    {item.category === 'coffee' || item.category === 'coolers'
                      ? `₱${item.price} (M), ₱${parseInt(item.price) + 10} (L)`
                      : `₱${item.price}`}
                  </Text>
                  <View style={[styles.tableCell, styles.actionColumn]}>
                    <TouchableOpacity
                      style={styles.updateButton}
                      onPress={() => {
                        setEditingItem(item);
                        setModalVisible(true);
                      }}
                    >
                      <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() =>
                        Alert.alert(
                          'Confirm Delete',
                          `Are you sure you want to delete ${item.name}?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.id) },
                          ]
                        )
                      }
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Item</Text>
            {editingItem && (
              <>
                <TouchableOpacity style={[styles.imagePicker, { width: '100%' }]} onPress={pickImageFromGalleryForEdit}>
                  <Text style={styles.imagePickerText}>
                    {editingItem.image ? extractFilename(editingItem.image) : 'Upload an Image'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <TouchableOpacity
                      style={[styles.input, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', width: 180 }]}
                      onPress={() => setShowEditCategoryDropdown(!showEditCategoryDropdown)}
                    >
                      <Text>{editingItem.category || 'Pick a category'}</Text>
                      <Text>▼</Text>
                    </TouchableOpacity>
                    {showEditCategoryDropdown && (
                      <View style={[styles.dropdown, { width: 180 }]}>
                        {categories.map((cat) => (
                          <TouchableOpacity
                            key={cat}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setEditingItem({ ...editingItem, category: cat });
                              setShowEditCategoryDropdown(false);
                            }}
                          >
                            <Text>{cat}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={styles.column}>
                    <Text style={styles.inputLabel}>Item Name</Text>
                    <TextInput
                      style={[styles.input, { width: 180 }]}
                      placeholder="Item Name"
                      value={editingItem.name}
                      onChangeText={(text) => setEditingItem({ ...editingItem, name: text })}
                    />
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.inputLabel}>Price (PHP)</Text>
                    <TextInput
                      style={[styles.input, { width: 180 }]}
                      placeholder="Price (PHP)"
                      keyboardType="numeric"
                      value={editingItem.price}
                      onChangeText={(text) => setEditingItem({ ...editingItem, price: text })}
                    />
                  </View>
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={async () => {
                      if (!editingItem.name.trim()) {
                        Alert.alert('Validation Error', 'Please enter the item name.');
                        return;
                      }
                      if (!editingItem.price || isNaN(editingItem.price)) {
                        Alert.alert('Validation Error', 'Please enter a valid price.');
                        return;
                      }
                      await updateItem(editingItem.id, editingItem);
                      setModalVisible(false);
                      setEditingItem(null);
                    }}
                  >
                    <Text style={styles.addButtonText}>Update</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setModalVisible(false);
                      setEditingItem(null);
                    }}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },
  leftColumn: {
    flex: 1,
    paddingRight: 10,
  },
  rightColumn: {
    flex: 3,
    paddingLeft: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  column: {
    flex: 1,
    marginHorizontal: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    marginBottom: 15,
  },
  imagePicker: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#333',
  },
  addButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  currentItemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    alignItems: 'center',
  },
  tableCell: {
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  idColumn: {
    flex: 0.5,
  },
  picColumn: {
    flex: 1,
    alignItems: 'center',
  },
  nameColumn: {
    flex: 3,
  },
  priceColumn: {
    flex: 1,
  },
  actionColumn: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  itemImage: {
    width: 60,
    height: 40,
  },
  updateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default MenuManagementScreen;
