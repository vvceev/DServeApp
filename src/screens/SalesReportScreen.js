import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Calendar } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit';
import { useUser } from '../contexts/UserContext';

const { width } = Dimensions.get('window');

const SalesReportScreen = () => {
  const { orders, loadOrders, isLoading } = useUser();
  const [timeRange, setTimeRange] = useState('monthly');
  const [subFilter, setSubFilter] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [weekOptions, setWeekOptions] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [bestSellerItems, setBestSellerItems] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterAndCalculateMetrics();
  }, [orders, timeRange, selectedDate, subFilter, selectedWeek, selectedYear]);

  useEffect(() => {
    if (timeRange === 'monthly' && subFilter === 'weekly') {
      generateWeekOptions();
    }
  }, [timeRange, subFilter]);

  const generateWeekOptions = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const weeks = [];
    let currentWeekStart = new Date(startDate);

    // Adjust to start of week (Sunday)
    const dayOfWeek = currentWeekStart.getDay();
    currentWeekStart.setDate(currentWeekStart.getDate() - dayOfWeek);

    while (currentWeekStart <= now) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekLabel = `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      weeks.push({
        label: weekLabel,
        start: new Date(currentWeekStart),
        end: new Date(weekEnd),
        value: currentWeekStart.toISOString().split('T')[0]
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    setWeekOptions(weeks);
    if (weeks.length > 0 && !selectedWeek) {
      setSelectedWeek(weeks[0].value);
    }
  };

  const filterAndCalculateMetrics = () => {
    if (!orders || orders.length === 0) {
      setFilteredOrders([]);
      setTotalOrders(0);
      setTotalSales(0);
      setBestSellerItems([]);
      return;
    }

    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'yearly':
        startDate = new Date(selectedYear, 0, 1); // January 1st of selected year
        break;
      default:
        startDate = new Date(0);
    }

    // Filter orders by time range, selected date, or selected week if any
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.date);
      if (selectedDate) {
        // Filter by selected date only
        return orderDate.toISOString().split('T')[0] === selectedDate;
      } else if (selectedWeek && timeRange === 'monthly' && subFilter === 'weekly') {
        // Filter by selected week
        const weekStart = new Date(selectedWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return orderDate >= weekStart && orderDate <= weekEnd;
      } else {
        // Filter by time range
        if (timeRange === 'yearly') {
          return orderDate.getFullYear() === selectedYear;
        } else {
          return orderDate >= startDate && orderDate <= now;
        }
      }
    });

    setFilteredOrders(filtered);

    // Calculate total orders
    setTotalOrders(filtered.length);

    // Calculate total sales
    const salesSum = filtered.reduce((sum, order) => sum + (order.total || 0), 0);
    setTotalSales(salesSum);

    // Calculate best seller items
    const itemMap = {};
    filtered.forEach(order => {
      order.items.forEach(item => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = 0;
        }
        itemMap[item.name] += item.quantity;
      });
    });

    const sortedItems = Object.entries(itemMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, quantity]) => ({ name, quantity }));

    setBestSellerItems(sortedItems);
  };

  const generateChartData = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [] }]
      };
    }

    const now = new Date();
    let labels = [];
    let data = [];

    switch (timeRange) {
      case 'monthly':
        if (subFilter === 'daily') {
          // Last 30 days
          for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const daySales = filteredOrders
              .filter(order => new Date(order.date).toISOString().split('T')[0] === dateStr)
              .reduce((sum, order) => sum + (order.total || 0), 0);
            labels.push(date.getDate().toString());
            data.push(daySales);
          }
        } else if (subFilter === 'weekly') {
          // Last 4 weeks
          for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7) - 6);
            const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
            const weekSales = filteredOrders
              .filter(order => {
                const orderDate = new Date(order.date);
                return orderDate >= weekStart && orderDate <= weekEnd;
              })
              .reduce((sum, order) => sum + (order.total || 0), 0);
            labels.push(`W${4 - i}`);
            data.push(weekSales);
          }
        }
        break;
      case 'yearly':
        // Months of the selected year
        for (let i = 0; i < 12; i++) {
          const date = new Date(selectedYear, i, 1);
          const monthStr = date.toISOString().slice(0, 7); // YYYY-MM
          const monthSales = filteredOrders
            .filter(order => new Date(order.date).toISOString().slice(0, 7) === monthStr)
            .reduce((sum, order) => sum + (order.total || 0), 0);
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
          data.push(monthSales);
        }
        break;
      default:
        break;
    }

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  const chartConfig = {
    backgroundColor: '#f8f9fa',
    backgroundGradientFrom: '#f8f9fa',
    backgroundGradientTo: '#f8f9fa',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3498db'
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Sales Report</Text>
          <Text style={styles.subtitle}>Generate sales reports</Text>
        </View>

        {/* Time Range Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.timeRangeContainer}>
            {['monthly', 'yearly'].map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.rangeButton,
                  timeRange === range && styles.activeRangeButton,
                ]}
                onPress={() => {
                  setTimeRange(range);
                  setSelectedDate('');
                  if (range === 'monthly') {
                    setSubFilter('daily');
                  }
                }}
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
          {timeRange === 'monthly' && (
            <View style={styles.subFilterContainer}>
              {['daily', 'weekly'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.subFilterButton,
                    subFilter === filter && styles.activeSubFilterButton,
                  ]}
                  onPress={() => {
                    setSubFilter(filter);
                    if (filter === 'weekly') {
                      generateWeekOptions();
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.subFilterButtonText,
                      subFilter === filter && styles.activeSubFilterButtonText,
                    ]}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Main Card Container */}
        <View style={styles.mainCard}>
          {/* Chart and Calendar Row */}
          <View style={styles.chartSection}>
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Sales Analytics</Text>
                {filteredOrders.length === 0 ? (
                  <View style={styles.chartPlaceholder}>
                    <Text style={styles.chartText}>No data available</Text>
                  </View>
                ) : (
                  <LineChart
                    data={generateChartData()}
                    width={width * 0.55}
                    height={180}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chartStyle}
                    fromZero
                  />
                )}
              </View>
            {timeRange === 'monthly' && subFilter === 'weekly' ? (
              <View style={styles.calendarContainer}>
                <Text style={styles.calendarTitle}>Select Week</Text>
                <View style={styles.weekOptionsContainer}>
                  {weekOptions.map((week) => (
                    <TouchableOpacity
                      key={week.value}
                      style={[
                        styles.weekOptionButton,
                        selectedWeek === week.value && styles.activeWeekOptionButton,
                      ]}
                      onPress={() => setSelectedWeek(week.value)}
                    >
                      <Text
                        style={[
                          styles.weekOptionText,
                          selectedWeek === week.value && styles.activeWeekOptionText,
                        ]}
                      >
                        {week.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : timeRange === 'yearly' ? (
              <View style={styles.calendarContainer}>
                <Text style={styles.calendarTitle}>Select Year</Text>
                <View style={styles.yearOptionsContainer}>
                  {[2023, 2024, 2025, 2026, 2027].map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.yearOptionButton,
                        selectedYear === year && styles.activeYearOptionButton,
                      ]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text
                        style={[
                          styles.yearOptionText,
                          selectedYear === year && styles.activeYearOptionText,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.calendarContainer}>
                <Text style={styles.calendarTitle}>Calendar</Text>
                <Calendar
                  onDayPress={day => setSelectedDate(day.dateString)}
                  markedDates={{
                    [selectedDate]: { selected: true, selectedColor: '#3498db' }
                  }}
                  theme={{
                    backgroundColor: '#f8f9fa',
                    calendarBackground: '#f8f9fa',
                    textSectionTitleColor: '#2c3e50',
                    selectedDayBackgroundColor: '#3498db',
                    selectedDayTextColor: 'white',
                    todayTextColor: '#3498db',
                    dayTextColor: '#495057',
                    textDisabledColor: '#d9e1e8',
                    dotColor: '#3498db',
                    selectedDotColor: 'white',
                    arrowColor: '#FF6B35',
                    monthTextColor: '#2c3e50',
                    indicatorColor: '#3498db',
                    textDayFontFamily: 'monospace',
                    textMonthFontFamily: 'monospace',
                    textDayHeaderFontFamily: 'monospace',
                    textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12
                  }}
                />
              </View>
            )}
          </View>

          {/* Right Side - Metrics */}
          <View style={styles.metricsSection}>
            <View style={styles.metricsRow}>
              <View style={styles.rowMetricCard}>
                <Text style={styles.metricLabel}>Total Orders</Text>
                <Text style={styles.biggerMetricValue}>{totalOrders}</Text>
              </View>

              <View style={styles.rowMetricCard}>
                <Text style={styles.metricLabel}>Total Sales</Text>
                <Text style={styles.biggerMetricValue}>₱{totalSales.toFixed(2)}</Text>
              </View>

              <View style={[styles.rowMetricCard, { flex: 0.15, padding: 5 }]}>
                <Text style={styles.metricLabel}>Best Seller Items</Text>
                <View style={styles.topItemsList}>
                  {bestSellerItems.length === 0 ? (
                    <Text style={styles.topItemText}>No data</Text>
                  ) : (
                    bestSellerItems.map((item, index) => (
                      <Text key={index} style={styles.topItemText}>
                        {index + 1}. {item.name} ({item.quantity})
                      </Text>
                    ))
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>


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
    color: '#FF6B35',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    flexWrap: 'wrap',
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
    backgroundColor: '#FF6B35',
  },
  rangeButtonText: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '500',
  },
  activeRangeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  mainCard: {
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    // Remove minHeight to allow flexible height
  },
  chartSection: {
    flexDirection: 'row',
    height: 220,
  },
  chartContainer: {
    flex: 1,
    marginRight: 15,
  },
  calendarContainer: {
    width: 250,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 10,
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
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
    color: '#FF6B35',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
  },
  metricsSection: {
    marginTop: 10,
    maxHeight: 180,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12,
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
  rowMetricCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 0,
    marginHorizontal: 10,
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
    color: '#FF6B35',
  },
  biggerMetricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
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
  chartStyle: {
    borderRadius: 16,
  },
  subFilterContainer: {
    flexDirection: 'row',
    backgroundColor: '#ecf0f1',
    borderRadius: 25,
    padding: 4,
    marginTop: 10,
  },
  subFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  activeSubFilterButton: {
    backgroundColor: '#FF6B35',
  },
  subFilterButtonText: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeSubFilterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  weekSelectorContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  weekSelectorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 10,
  },
  weekOptionsScroll: {
    maxHeight: 50,
  },
  weekOptionButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginHorizontal: 5,
    marginVertical: 5,
    minWidth: 120,
    alignItems: 'center',
  },
  activeWeekOptionButton: {
    backgroundColor: '#FF6B35',
  },
  weekOptionText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeWeekOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  weekOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearOptionButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginHorizontal: 5,
    marginVertical: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  activeYearOptionButton: {
    backgroundColor: '#FF6B35',
  },
  yearOptionText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeYearOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SalesReportScreen;
