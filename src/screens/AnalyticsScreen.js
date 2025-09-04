import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const AnalyticsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const periods = ['Today', 'Week', 'Month', 'Year'];

  const salesData = {
    today: { revenue: 2847.50, orders: 47, avgOrder: 60.58 },
    week: { revenue: 19832.75, orders: 329, avgOrder: 60.28 },
    month: { revenue: 79331.00, orders: 1316, avgOrder: 60.28 },
    year: { revenue: 951972.00, orders: 15792, avgOrder: 60.28 },
  };

  const topItems = [
    { name: 'Margherita Pizza', sales: 142, revenue: 1843.58 },
    { name: 'Caesar Salad', sales: 98, revenue: 880.02 },
    { name: 'Grilled Salmon', sales: 87, revenue: 1652.13 },
    { name: 'Pasta Carbonara', sales: 76, revenue: 1063.24 },
    { name: 'House Wine', sales: 234, revenue: 1868.66 },
  ];

  const performanceMetrics = [
    { label: 'Revenue', value: `$${salesData[selectedPeriod.toLowerCase()].revenue.toFixed(2)}`, change: '+12.5%' },
    { label: 'Orders', value: salesData[selectedPeriod.toLowerCase()].orders, change: '+8.3%' },
    { label: 'Avg Order', value: `$${salesData[selectedPeriod.toLowerCase()].avgOrder.toFixed(2)}`, change: '+3.2%' },
    { label: 'Customer Satisfaction', value: '4.7/5', change: '+0.2' },
  ];

  const renderMetricCard = ({ item, index }) => (
    <View style={styles.metricCard} key={index}>
      <Text style={styles.metricLabel}>{item.label}</Text>
      <Text style={styles.metricValue}>{item.value}</Text>
      <Text style={[styles.metricChange, item.change.startsWith('+') ? styles.positiveChange : styles.negativeChange]}>
        {item.change}
      </Text>
    </View>
  );

  const renderTopItem = ({ item, index }) => (
    <View style={styles.topItemCard} key={index}>
      <View style={styles.itemRank}>
        <Text style={styles.rankText}>#{index + 1}</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemSales}>{item.sales} sold</Text>
      </View>
      <Text style={styles.itemRevenue}>${item.revenue.toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics & Reports</Text>
          <Text style={styles.subtitle}>View sales reports and performance metrics</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.periodContainer}
        >
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.selectedPeriod
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.selectedPeriodText
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            {performanceMetrics.map(renderMetricCard)}
          </View>
        </View>

        <View style={styles.topItemsContainer}>
          <Text style={styles.sectionTitle}>Top Selling Items</Text>
          <View style={styles.topItemsList}>
            {topItems.map(renderTopItem)}
          </View>
        </View>

        <View style={styles.chartsContainer}>
          <Text style={styles.sectionTitle}>Sales Trends</Text>
          
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Daily Revenue</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartText}>Revenue Chart Placeholder</Text>
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Order Volume</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartText}>Order Chart Placeholder</Text>
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Popular Categories</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartText}>Category Chart Placeholder</Text>
            </View>
          </View>
        </View>

        <View style={styles.reportsContainer}>
          <Text style={styles.sectionTitle}>Generate Reports</Text>
          <View style={styles.reportOptions}>
            <TouchableOpacity style={styles.reportButton}>
              <Text style={styles.reportButtonText}>Sales Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportButton}>
              <Text style={styles.reportButtonText}>Inventory Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportButton}>
              <Text style={styles.reportButtonText}>Staff Performance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportButton}>
              <Text style={styles.reportButtonText}>Customer Feedback</Text>
            </TouchableOpacity>
          </View>
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
  periodContainer: {
    marginBottom: 20,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  selectedPeriod: {
    backgroundColor: '#FF6B35',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
  },
  selectedPeriodText: {
    color: 'white',
  },
  metricsContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  metricCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  metricChange: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  positiveChange: {
    color: '#4caf50',
  },
  negativeChange: {
    color: '#f44336',
  },
  topItemsContainer: {
    marginBottom: 25,
  },
  topItemsList: {
    gap: 10,
  },
  topItemCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemSales: {
    fontSize: 14,
    color: '#666',
  },
  itemRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  chartsContainer: {
    marginBottom: 25,
  },
  chartCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartText: {
    color: '#666',
    fontSize: 14,
  },
  reportsContainer: {
    marginBottom: 25,
  },
  reportOptions: {
    gap: 10,
  },
  reportButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AnalyticsScreen;
