# Firebase Setup Instructions for DServeApp Backend Migration

This document provides detailed steps to set up Firebase Firestore as the backend database for the DServeApp after migrating from MongoDB.

## 1. Create Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Click "Add project" and follow the prompts to create a new project (e.g., `dserveappdb`).

## 2. Enable Firestore Database
- In your Firebase project console, navigate to "Firestore Database".
- Click "Create database".
- Choose "Start in production mode" or "test mode" (adjust security rules later).
- Select your preferred location and create the database.

## 3. Generate Service Account Key
- In Firebase Console, go to "Project Settings" > "Service accounts".
- Click "Generate new private key" and download the JSON file.
- Save this file as `src/database/firebase-service-account.json` in your project directory.

## 4. Set Environment Variables
- Create a `.env` file in your project root (if not existing).
- Add the following variables (replace placeholders with your actual values):

```
FIREBASE_PROJECT_ID=dserveappdb
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./src/database/firebase-service-account.json
```

- If you prefer to use environment variables for service account credentials instead of a JSON file, set these variables accordingly:
```
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="your_private_key_with_escaped_newlines"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url
```

## 5. Firestore Collections Structure
**Note**: Collections in Firestore are created automatically when you add the first document to them. You do not need to manually create collections in the Firebase Console.

- `users`: Stores user documents with fields like username, password (hashed), role, displayName, isActive, etc.
- `loginSessions`: Stores login session documents with userId, username, role, ipAddress, userAgent, loginTime.
- `inventory`: Inventory items with fields like name, category, quantity, unit, min_stock_level, expiry_date, is_active.
- `menuItems`: Menu items with name, category, basePrice, isAvailable.
- `orders`: Orders with orderNumber, customerName, orderType, totalAmount, userId, items (array), status, timestamps.
- `recipes`: Recipe documents linking menu items to inventory with quantity_required, size, inventory_id.

## 6. Data Migration
- Use the provided `migrate-to-firebase.js` script to migrate existing MongoDB data to Firestore.
- Run the script with Node.js after setting up Firebase credentials.

## 7. Firestore Security Rules (Example)
```rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /loginSessions/{sessionId} {
      allow read, write: if request.auth != null;
    }
    match /inventory/{itemId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    match /menuItems/{menuItemId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    match /recipes/{recipeId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
  }
}
```

## 8. Firebase Storage Setup
- In Firebase Console, navigate to "Storage" in the left sidebar
- Click "Get started" to enable Firebase Storage for your project
- In the Storage > Rules tab, replace the default rules with the content from `storage.rules` file
- Click "Publish" to apply the new rules

## 9. Testing
- Start the backend server: `node server.js`
- Test API endpoints to verify data is correctly read/written from Firestore.
- Test image upload functionality in the MenuManagementScreen
- Use Firebase Console to monitor data and logs.

---

For any issues or questions, refer to Firebase documentation or contact the project maintainer.
