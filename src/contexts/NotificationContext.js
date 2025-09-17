import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { inventory } = useUser();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (inventory && inventory.length > 0) {
      const newNotifications = [];

      // Low stock notifications (serving < min_stock_level)
      const lowStockItems = inventory.filter(item =>
        parseFloat(item.serving) < parseFloat(item.min_stock_level || 10)
      );
      lowStockItems.forEach(item => {
        newNotifications.push({
          id: `low-${item.id}`,
          type: 'low_stock',
          message: `${item.name} is running low (${item.serving} remaining)`,
          itemId: item.id,
          timestamp: new Date().toISOString(),
        });
      });

      // Expiry notifications (7 days before expiry)
      const expiringItems = inventory.filter(item => {
        if (!item.expiry_date) return false;
        const today = new Date();
        const expiry = new Date(item.expiry_date);
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
      });
      expiringItems.forEach(item => {
        const expiry = new Date(item.expiry_date);
        const daysLeft = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
        newNotifications.push({
          id: `expiry-${item.id}`,
          type: 'expiry',
          message: `${item.name} expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
          itemId: item.id,
          timestamp: new Date().toISOString(),
        });
      });

      setNotifications(newNotifications);
    } else {
      setNotifications([]);
    }
  }, [inventory]);

  const addNotification = (notification) => {
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
