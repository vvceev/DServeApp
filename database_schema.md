# Database Schema and ERD for DServeApp

## Overview
This document describes the database schema for the DServeApp restaurant management system. The system is migrating from MySQL/Mongoose to Firebase Firestore, but the schema is based on the existing Mongoose models. Firestore is NoSQL, so collections are used instead of tables, and relationships are handled via references or subcollections.

## Entities (Collections)

### 1. User
- **username**: String (required, unique)
- **password**: String (required, hashed)
- **role**: String (enum: 'cashier', 'owner', 'admin', required)
- **displayName**: String (required)
- **email**: String (optional)
- **phone**: String (optional)
- **isActive**: Boolean (default: true)
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

### 2. Order
- **orderNumber**: String (required, unique)
- **customerName**: String (optional)
- **orderType**: String (enum: 'dine-in', 'take-out', 'delivery', default: 'dine-in')
- **totalAmount**: Number (required, default: 0)
- **status**: String (enum: 'pending', 'completed', 'cancelled', default: 'pending')
- **userId**: Reference to User (optional)
- **items**: Array of OrderItem objects
  - **menuItemId**: Reference to MenuItem (required)
  - **quantity**: Number (required, default: 1)
  - **size**: String (enum: 'small', 'medium', 'large', default: 'medium')
  - **unitPrice**: Number (required)
  - **totalPrice**: Number (required)
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

### 3. MenuItem
- **name**: String (required)
- **category**: String (enum: 'coffee', 'coolers', 'alcohol', 'snacks', required)
- **basePrice**: Number (required)
- **isAvailable**: Boolean (default: true)
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

### 4. Inventory
- **name**: String (required, unique)
- **category**: String (required)
- **serving**: Number (required, default: 0)
- **unit**: String (default: 'pieces')
- **minStockLevel**: Number (default: 10)
- **expiryDate**: Date (optional)
- **isActive**: Boolean (default: true)
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

### 5. Recipe
- **menu_item_id**: Reference to MenuItem (required)
- **inventory_id**: Reference to Inventory (required)
- **quantity_required**: Number (required)
- **size**: String (enum: 'small', 'medium', 'large', default: 'medium')
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

### 6. LoginSession
- **userId**: Reference to User (required)
- **username**: String (required)
- **role**: String (enum: 'cashier', 'owner', 'admin', required)
- **loginTime**: Date (default: now)
- **ipAddress**: String (default: '127.0.0.1')
- **userAgent**: String (default: 'Unknown')

## Relationships (ERD Description)

```
+----------------+       +----------------+
|     User       |       | LoginSession   |
+----------------+       +----------------+
| - username     |<------| - userId       |
| - password     |       | - username     |
| - role         |       | - role         |
| - displayName  |       | - loginTime    |
| - email        |       | - ipAddress    |
| - phone        |       | - userAgent    |
| - isActive     |       +----------------+
| - timestamps   |
+----------------+
        |
        | 1:N
        v
+----------------+       +----------------+
|     Order      |       |   OrderItem    |
+----------------+       +----------------+
| - orderNumber  |       | - menuItemId   |
| - customerName |       | - quantity     |
| - orderType    |       | - size         |
| - totalAmount  |       | - unitPrice    |
| - status       |       | - totalPrice   |
| - userId       |       +----------------+
| - items[]      |
| - timestamps   |
+----------------+
        |
        | 1:N (via items)
        v
+----------------+       +----------------+
|   MenuItem     |       |    Recipe      |
+----------------+       +----------------+
| - name         |<------| - menu_item_id |
| - category     |       | - inventory_id |
| - basePrice    |       | - quantity_req |
| - isAvailable  |       | - size         |
| - timestamps   |       | - timestamps   |
+----------------+       +----------------+
        ^
        | 1:N
        |
+----------------+
|   Inventory    |
+----------------+
| - name         |
| - category     |
| - serving      |
| - unit         |
| - minStockLevel|
| - expiryDate   |
| - isActive     |
| - timestamps   |
+----------------+
```

### Relationship Details:
- **User to Order**: One-to-Many (userId in Order references User)
- **User to LoginSession**: One-to-Many (userId in LoginSession references User)
- **Order to MenuItem**: Many-to-Many via OrderItem (menuItemId in OrderItem references MenuItem)
- **MenuItem to Recipe**: One-to-Many (menu_item_id in Recipe references MenuItem)
- **Inventory to Recipe**: One-to-Many (inventory_id in Recipe references Inventory)

## Notes
- In Firestore, relationships are handled via document references or subcollections.
- Embedded arrays (like items in Order) can be used for denormalization.
- Timestamps are automatically managed by Firestore.
- Password hashing is handled in the application layer.
- Unique constraints may need to be enforced in the app logic since Firestore doesn't support unique indexes natively.
