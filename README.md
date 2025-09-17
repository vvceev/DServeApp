# DServeApp - Restaurant Management System

A comprehensive restaurant management application built with React Native and Expo, designed to streamline operations for small to medium-sized restaurants. The app provides an intuitive interface for order taking, inventory management, menu customization, and sales analytics.

## Features

### Core Functionality
- **Multi-role Authentication**: Secure login system with role-based access (Cashier, Owner, Admin)
- **Order Taking**: Intuitive point-of-sale interface with category-based menu navigation
- **Real-time Inventory Tracking**: Automatic stock level monitoring and low-stock alerts
- **Menu Management**: Dynamic menu customization with image upload support
- **Order Management**: Complete order lifecycle management from creation to completion
- **Sales Analytics**: Comprehensive reporting and dashboard with charts and metrics
- **User Management**: Admin panel for managing staff accounts and permissions

### Menu Categories
- **Coffee & Non-Coffee Beverages**: Size options (Medium/Large) with pricing adjustments
- **Coolers**: Refreshing non-alcoholic beverages
- **Alcohol**: Full beverage selection with appropriate pricing
- **Snacks**: Food items with inventory integration

### Technical Features
- **Offline-First Design**: Local storage for order numbers and basic functionality
- **Firebase Integration**: Real-time database and cloud storage
- **Responsive Design**: Optimized for tablets and landscape orientation
- **Image Management**: Firebase Storage integration for menu item photos
- **Data Migration**: Tools for migrating from legacy MySQL databases

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase project with Firestore and Storage enabled
- Android Studio (for Android development) or Xcode (for iOS development)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vvceev/DServeApp.git
   cd DServeApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Expo CLI globally** (if not already installed)
   ```bash
   npm install -g @expo/cli
   ```

## Setup

### Firebase Configuration

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project (e.g., `dserveappdb`)
   - Enable Firestore Database and Firebase Storage

2. **Service Account Setup**
   - In Firebase Console → Project Settings → Service accounts
   - Generate a new private key and download the JSON file
   - Save it as `src/database/firebase-service-account.json`

3. **Environment Variables**
   Create a `.env` file in the project root:
   ```
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./src/database/firebase-service-account.json
   ```

4. **Firestore Security Rules**
   - Copy the content from `firestore.rules` to your Firestore rules
   - Copy the content from `storage.rules` to your Storage rules

### Database Population

1. **Run the population script**
   ```bash
   node populate-firebase.js
   ```

2. **Migrate existing data** (if applicable)
   ```bash
   node migrate-to-firebase.js
   ```

### Backend Server (Optional)

For additional API functionality, start the Express server:
```bash
node server.js
```

## Usage

### Getting Started

1. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

2. **Run on device/emulator**
   ```bash
   # For Android
   npm run android

   # For iOS
   npm run ios

   # For web
   npm run web
   ```

### User Roles and Permissions

- **Cashier**: Can take orders, view inventory, access basic reports
- **Owner**: Full access to all features including user management and advanced analytics
- **Admin**: System administration, menu management, inventory control

### Default Login Credentials

- **Cashier**: username: `cashier1`, password: `password123`
- **Owner**: username: `owner1`, password: `password123`
- **Admin**: username: `admin1`, password: `password123`

### Order Taking Process

1. **Login** with appropriate credentials
2. **Navigate to Order Taking** screen
3. **Select menu category** (Coffee, Coolers, Alcohol, Snacks)
4. **Choose items**:
   - For coffee/coolers: Select size (M/L) - Large adds +₱10
   - Add items to cart using the + button
5. **Review order** in the right panel
6. **Enter customer details** (optional)
7. **Save or Print** the order

### Inventory Management

1. **Access Inventory Screen** (Owner/Admin only)
2. **View current stock levels**
3. **Update quantities** as items are received or used
4. **Set minimum stock levels** for automatic alerts
5. **Track expiry dates** for perishable items

### Menu Management

1. **Access Menu Management** (Owner/Admin only)
2. **Add new menu items** with photos
3. **Edit existing items** (name, price, category)
4. **Upload images** to Firebase Storage
5. **Toggle item availability**

### Order Management

1. **View all orders** by status (pending, completed, cancelled)
2. **Update order status**
3. **View order details** and customer information
4. **Generate receipts** or reports

### Sales Reports and Analytics

1. **Access Dashboard** for overview metrics
2. **View sales reports** by date range
3. **Analyze popular items** and revenue trends
4. **Export reports** for external analysis

### User Management

1. **Access User Management** (Owner only)
2. **Create new user accounts**
3. **Assign roles** and permissions
4. **View login history** and session tracking

## API Endpoints

The backend server provides the following endpoints:

- `POST /api/login` - User authentication
- `GET /api/users` - List all users
- `GET /api/orders` - Retrieve orders
- `POST /api/orders` - Create new order
- `GET /api/inventory` - Get inventory data
- `POST /api/inventory` - Update inventory

## Database Schema

The application uses Firebase Firestore with the following collections:

- `users` - User accounts and authentication
- `orders` - Order records with items and totals
- `menuItems` - Menu catalog with pricing
- `inventory` - Stock levels and tracking
- `recipes` - Ingredient requirements for menu items
- `loginSessions` - Authentication logs

## Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Verify service account JSON file path
   - Check Firebase project configuration
   - Ensure Firestore rules allow read/write operations

2. **Image Upload Failures**
   - Confirm Storage rules are properly configured
   - Check Firebase Storage permissions

3. **Order Number Reset**
   - Order numbers are stored locally using AsyncStorage
   - Clear app data if numbers need to be reset

4. **Inventory Sync Issues**
   - Ensure Firebase connection is stable
   - Check for network connectivity

### Development Tips

- Use Expo Go app for quick testing on physical devices
- Enable Firebase emulator for local development
- Monitor console logs for debugging authentication issues

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the ISC License - see the package.json file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Refer to Firebase documentation for backend issues

---

**Note**: This application is designed for restaurant operations and should be used in accordance with local regulations regarding point-of-sale systems and data privacy laws.
