import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import OrderSummary from '../components/OrderSummary';

const OrderManagementScreen = ({ navigation }) => {
  const { orders, loadOrders } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAllOrders, setShowAllOrders] = useState(false);

  // Removed console.log to prevent looping logs on every render

  // Refresh orders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadOrders(); // Refresh orders from server
    }, [loadOrders])
  );

  useEffect(() => {
    if (showAllOrders) {
      // Show all orders
      setFilteredOrders(orders);
    } else {
      // Filter orders based on selected date
      const filtered = orders.filter(order => {
        const orderDate = new Date(order.date);
        const orderYear = orderDate.getFullYear();
        const orderMonth = orderDate.getMonth();
        const orderDay = orderDate.getDate();
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth();
        const selectedDay = selectedDate.getDate();
        return orderYear === selectedYear && orderMonth === selectedMonth && orderDay === selectedDay;
      });
      setFilteredOrders(filtered);
    }
  }, [orders, selectedDate, showAllOrders]);



  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };



  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setModalVisible(false);
  };

  const renderOrderRow = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.orderNumber}</Text>
      <Text style={styles.tableCell}>{item.customerName}</Text>
      <TouchableOpacity
        style={styles.viewOrderButton}
        onPress={() => openOrderModal(item)}
      >
        <Text style={styles.viewOrderButtonText}>View Order</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Order No.</Text>
        <Text style={styles.tableHeaderCell}>Customer Name</Text>
        <Text style={styles.tableHeaderCell}>Actions</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <Text style={styles.noOrdersText}>
      No orders found for the selected date.
    </Text>
  );

  const onDayPress = (day) => {
    const selected = new Date(day.dateString);
    setSelectedDate(selected);
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            {showAllOrders ? 'All Orders' : `Orders for ${selectedDate.toLocaleDateString()}`}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => loadOrders()}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.showAllButton}
              onPress={() => setShowAllOrders(!showAllOrders)}
            >
              <Text style={styles.showAllButtonText}>
                {showAllOrders ? 'Filter by Date' : 'Show All Orders'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerButtonText}>
                Select Date
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.underline} />
      </View>

      <Modal
        key={`calendar-modal-${showDatePicker}`}
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.calendarModalOverlay}>
          <View style={styles.calendarModalContent}>
            <Calendar
              onDayPress={onDayPress}
              markedDates={{
                [selectedDate.toISOString().split('T')[0]]: {
                  selected: true,
                  selectedColor: '#007AFF'
                }
              }}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#007AFF',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#007AFF',
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                dotColor: '#007AFF',
                selectedDotColor: '#ffffff',
                arrowColor: '#007AFF',
                monthTextColor: '#2d4150',
                indicatorColor: '#007AFF',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14
              }}
            />
            <TouchableOpacity
              style={styles.closeCalendarButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.closeCalendarButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderRow}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.scrollContainer}
      />

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeOrderModal}
      >
        <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
        <OrderSummary
          items={selectedOrder?.items?.map(item => ({
            ...item,
            name: item.menuItemName || item.name || 'Unknown Item',
            price: item.unitPrice || item.price || 0
          })) || []}
          subtotal={selectedOrder?.total || 0}
          onRemoveItem={() => {}}
          onUpdateQuantity={() => {}}
          onSaveAndPrint={() => {}}
          orderNumber={selectedOrder?.orderNumber || ''}
          onIncrementOrderNumber={() => {}}
          customerName={selectedOrder?.customerName || ''}
          orderType={selectedOrder?.orderType || 'dine-in'}
          orderDate={selectedOrder?.date || null}
          onClose={closeOrderModal}
          isModal={true}
        />
          </ScrollView>
        </View>
        </View>
      </Modal>
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
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  refreshButton: {
    backgroundColor: '#28a745',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  showAllButton: {
    backgroundColor: '#17a2b8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  showAllButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  underline: {
    height: 2,
    backgroundColor: '#333',
    width: '100%',
  },
  table: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
  },
  viewOrderButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  viewOrderButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  datePickerButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  datePickerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  noOrdersText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    width: '30%',
    height: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  closeButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeCalendarButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeCalendarButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderManagementScreen;
