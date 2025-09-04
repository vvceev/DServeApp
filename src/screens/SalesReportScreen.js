import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const SalesReportScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState('daily');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Sales Report</Text>
          <Text style={styles.subtitle}>Generate detailed sales reports</Text>
        </View>

        {/* Date Picker and Time Range Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.dateButton} onPress={showDatePickerModal}>
            <View style={styles.dateButtonContent}>
              <Icon name="date-range" size={16} color="white" style={styles.dateIcon} />
              <Text style={styles.dateButtonText}>
                {selectedDate.toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.timeRangeContainer}>
            {['daily', 'weekly', 'monthly'].map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.rangeButton,
                  timeRange === range && styles.activeRangeButton,
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Text
                  style={[
                    styles.rangeButtonText,
                    timeRange === range && styles.activeRangeButtonText,
                  ]}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Main Card Container */}
        <View style={styles.mainCard}>
          {/* Left Side - Chart */}
          <View style={styles.chartSection}>
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Sales Analytics</Text>
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartText}>Line Chart</Text>
                <Text style={styles.chartSubtitle}>
                  Showing {timeRange} performance
                </Text>
              </View>
            </View>
          </View>

          {/* Right Side - Metrics */}
          <View style={styles.metricsSection}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Orders</Text>
              <Text style={styles.metricValue}>156</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Sales</Text>
              <Text style={styles.metricValue}>$11,750</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Average Sales</Text>
              <Text style={styles.metricValue}>$75.32</Text>
            </View>

            <View style={[styles.metricCard, styles.topItemsCard]}>
              <Text style={styles.metricLabel}>Top Selling Items</Text>
              <View style={styles.topItemsList}>
                <Text style={styles.topItemText}>1. Margherita Pizza</Text>
                <Text style={styles.topItemText}>2. Caesar Salad</Text>
                <Text style={styles.topItemText}>3. Grilled Salmon</Text>
                <Text style={styles.topItemText}>4. Pasta Carbonara</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    flexWrap: 'wrap',
  },
  dateButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 8,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#ecf0f1',
    borderRadius: 25,
    padding: 4,
  },
  rangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  activeRangeButton: {
    backgroundColor: '#3498db',
  },
  rangeButtonText: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeRangeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  mainCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    minHeight: 400,
  },
  chartSection: {
    flex: 1.5,
    marginRight: 15,
  },
  chartContainer: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  chartPlaceholder: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  chartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
  },
  metricsSection: {
    flex: 1,
    marginLeft: 15,
  },
  metricCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  topItemsCard: {
    marginBottom: 0,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 5,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  topItemsList: {
    marginTop: 5,
  },
  topItemText: {
    fontSize: 11,
    color: '#495057',
    marginBottom: 3,
    lineHeight: 14,
  },
});

export default SalesReportScreen;
