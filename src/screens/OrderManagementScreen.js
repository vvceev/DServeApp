import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
} from 'react-native';

const OrderManagementScreen = () => {
  const [orders, setOrders] = useState([
    {
      id: '1',
      orderNumber: '#1001',
      table: 'Table 5',
      items: [
        { name: 'Margherita Pizza', quantity: 1 },
        { name: 'Caesar Salad', quantity: 2 },
      ],
      status: 'Preparing',
      time: '12:30 PM',
      total: 29.97,
      priority: 'Normal',
      station: 'Kitchen',
    },
    {
      id: '2',
      orderNumber: '#1002',
      table: 'Table 3',
      items: [
        { name: 'Grilled Salmon', quantity: 1 },
        { name: 'House Wine', quantity: 2 },
      ],
      status: 'Ready',
      time: '12:25 PM',
      total: 38.97,
      priority: 'High',
      station: 'Bar',
    },
    {
      id: '3',
      orderNumber: '#1003',
      table: 'Table 7',
      items: [
        { name: 'Pasta Carbonara', quantity: 2 },
        { name: 'Garlic Bread', quantity: 1 },
      ],
      status: 'Pending',
      time: '12:35 PM',
      total: 26.98,
      priority: 'Normal',
      station: 'Kitchen',
    },
  ]);

  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Pending', 'Preparing', 'Ready', 'Delivered'];

  const filteredOrders = selectedFilter === 'All' 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffeb3b';
      case 'Preparing': return '#ff9800';
      case 'Ready': return '#4caf50';
      case 'Delivered': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderTable}>{item.table}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        {item.items.map((orderItem, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.itemQuantity}>{orderItem.quantity}x</Text>
            <Text style={styles.itemName}>{orderItem.name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderMeta}>
          <Text style={styles.metaText}>Time: {item.time}</Text>
          <Text style={styles.metaText}>Station: {item.station}</Text>
          {item.priority === 'High' && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>High Priority</Text>
            </View>
          )}
        </View>
        
        <View style={styles.orderTotal}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${item.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.updateButton]}>
          <Text style={styles.actionButtonText}>Update Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.printButton]}>
          <Text style={styles.actionButtonText}>Print Ticket</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Order Management</Text>
          <Text style={styles.subtitle}>Manage orders and kitchen communication</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.selectedFilter
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.selectedFilterText
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{orders.length}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {orders.filter(order => order.status === 'Pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {orders.filter(order => order.status === 'Preparing').length}
            </Text>
            <Text style={styles.statLabel}>Preparing</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {orders.filter(order => order.status === 'Ready').length}
            </Text>
            <Text style={styles.statLabel}>Ready</Text>
          </View>
        </View>

        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.ordersList}
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
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  selectedFilter: {
    backgroundColor: '#FF6B35',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  selectedFilterText: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    gap: 10,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  ordersList: {
    gap: 15,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  orderTable: {
    fontSize: 16,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDetails: {
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
    width: 30,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  orderMeta: {
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  priorityBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  priorityText: {
    fontSize: 10,
    color: '#f44336',
    fontWeight: 'bold',
  },
  orderTotal: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  orderActions: {
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
  updateButton: {
    backgroundColor: '#e3f2fd',
  },
  printButton: {
    backgroundColor: '#e8f5e8',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default OrderManagementScreen;
