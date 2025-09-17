import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CustomHeader from '../components/CustomHeader';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import InventoryScreen from '../screens/InventoryScreen';
import MenuManagementScreen from '../screens/MenuManagementScreen';
import OrderManagementScreen from '../screens/OrderManagementScreen';
import SalesBillingScreen from '../screens/SalesBillingScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SalesReportScreen from '../screens/SalesReportScreen';
import OrderTakingHomepage from '../screens/OrderTakingHomepage';
import { useUser } from '../contexts/UserContext';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const navigationRef = useRef(null);
  const { user, isLoading } = useUser();

  // Removed auto-navigation to Dashboard to ensure login screen shows

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            header: () => <CustomHeader activeScreen="Dashboard" />,
          }}
        />
        <Stack.Screen
          name="Inventory"
          component={InventoryScreen}
          options={{
            header: () => <CustomHeader activeScreen="Inventory" />,
          }}
        />
        <Stack.Screen
          name="MenuManagement"
          component={MenuManagementScreen}
          options={{
            header: () => <CustomHeader activeScreen="MenuManagement" />,
          }}
        />
        <Stack.Screen
          name="OrderManagement"
          component={OrderManagementScreen}
          options={{
            header: () => <CustomHeader activeScreen="OrderManagement" />,
          }}
        />
        <Stack.Screen
          name="SalesBilling"
          component={SalesBillingScreen}
          options={{
            header: () => <CustomHeader activeScreen="SalesBilling" />,
          }}
        />
        <Stack.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            header: () => <CustomHeader activeScreen="Analytics" />,
          }}
        />
        <Stack.Screen
          name="OrderTaking"
          component={OrderTakingHomepage}
          options={{
            header: () => <CustomHeader activeScreen="OrderTaking" />,
          }}
        />
        <Stack.Screen
          name="SalesReport"
          component={SalesReportScreen}
          options={{
            header: () => <CustomHeader activeScreen="SalesReport" />,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
