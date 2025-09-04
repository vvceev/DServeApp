// MySQL API integration for React Native
// This replaces the in-memory database with MySQL via backend API

import axios from 'axios';

// Configure your backend API URL
const API_BASE_URL = 'http://localhost:3001/api'; // Change to your backend URL

// MySQL-based user service
class MySQLUserService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async authenticateUser(username, password) {
    try {
      const response = await this.api.post('/login', {
        username,
        password
      });
      
      if (response.data.success) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  async getUserByUsername(username) {
    try {
      const response = await this.api.get(`/users/${username}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  async getUsersByRole(role) {
    try {
      const response = await this.api.get(`/users/role/${role}`);
      return response.data;
    } catch (error) {
      console.error('Get users by role error:', error);
      return [];
    }
  }

  async getRecentLogins(limit = 10) {
    try {
      const response = await this.api.get(`/logins/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get recent logins error:', error);
      return [];
    }
  }

  async createLoginSession(userId, username, role) {
    try {
      const response = await this.api.post('/logins', {
        userId,
        username,
        role
      });
      return response.data;
    } catch (error) {
      console.error('Create login session error:', error);
      return null;
    }
  }
}

// Export singleton instance
const mysqlUserService = new MySQLUserService();
export default mysqlUserService;

// To use this in your React Native app:
// 1. Install axios: npm install axios
// 2. Replace imports in LoginScreen.js:
//    import { authenticateUser, createLoginSession } from '../database/mysql-api';
// 3. Update your backend API URL in the API_BASE_URL constant
