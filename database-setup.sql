-- Create database for Restaurant Management System
CREATE DATABASE IF NOT EXISTS restaurant_management;
USE restaurant_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('cashier', 'owner', 'admin') NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Login sessions table
CREATE TABLE IF NOT EXISTS login_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    role ENUM('cashier', 'owner', 'admin') NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert pre-made users
INSERT INTO users (username, password, role, display_name, email) VALUES
('cashier1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cashier', 'Cashier User', 'cashier@restaurant.com'),
('owner1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner', 'Restaurant Owner', 'owner@restaurant.com'),
('admin1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System Admin', 'admin@restaurant.com');

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sessions_user_id ON login_sessions(user_id);
CREATE INDEX idx_sessions_login_time ON login_sessions(login_time);

-- View for recent logins
CREATE VIEW recent_logins AS
SELECT
    ls.id,
    u.username,
    u.role,
    u.display_name,
    ls.login_time,
    ls.ip_address
FROM login_sessions ls
JOIN users u ON ls.user_id = u.id
ORDER BY ls.login_time DESC
LIMIT 10;

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('coffee', 'coolers', 'alcohol', 'snacks') NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inventory/Ingredients table
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL DEFAULT 'pieces',
    min_stock_level DECIMAL(10,2) DEFAULT 10,
    expiry_date DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Recipes table (ingredient requirements for menu items)
CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id INT NOT NULL,
    inventory_id INT NOT NULL,
    quantity_required DECIMAL(10,2) NOT NULL,
    size ENUM('small', 'medium', 'large') DEFAULT 'medium',
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
    UNIQUE KEY unique_recipe (menu_item_id, inventory_id, size)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(100),
    order_type ENUM('dine-in', 'take-out', 'delivery') DEFAULT 'dine-in',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    size ENUM('small', 'medium', 'large') DEFAULT 'medium',
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Insert sample menu items
INSERT INTO menu_items (name, category, base_price) VALUES
('Iced Americano', 'coffee', 45.00),
('Lychee Soda', 'coolers', 35.00),
('Redhorse', 'alcohol', 65.00),
('Fishball', 'snacks', 25.00),
('Mani', 'snacks', 15.00);

-- Insert sample inventory items
INSERT INTO inventory (name, category, quantity, unit, min_stock_level) VALUES
('Coffee Powder', 'coffee', 5000.00, 'grams', 1000.00),
('Ice', 'supplies', 10000.00, 'grams', 2000.00),
('Lychee Syrup', 'syrups', 2000.00, 'ml', 500.00),
('Soda Water', 'beverages', 5000.00, 'ml', 1000.00),
('Redhorse Beer', 'alcohol', 24.00, 'bottles', 6.00),
('Fish Balls', 'snacks', 50.00, 'pieces', 10.00),
('Peanuts', 'snacks', 2000.00, 'grams', 500.00);

-- Insert sample recipes
INSERT INTO recipes (menu_item_id, inventory_id, quantity_required, size) VALUES
-- Iced Americano recipes
(1, 1, 15.00, 'small'),  -- 15g coffee powder for small
(1, 1, 20.00, 'medium'), -- 20g coffee powder for medium
(1, 1, 25.00, 'large'),  -- 25g coffee powder for large
(1, 2, 100.00, 'small'), -- 100g ice for small
(1, 2, 150.00, 'medium'),-- 150g ice for medium
(1, 2, 225.00, 'large'), -- 225g ice for large

-- Lychee Soda recipes
(2, 3, 30.00, 'small'),  -- 30ml lychee syrup for small
(2, 3, 45.00, 'medium'), -- 45ml lychee syrup for medium
(2, 3, 60.00, 'large'),  -- 60ml lychee syrup for large
(2, 4, 200.00, 'small'), -- 200ml soda water for small
(2, 4, 300.00, 'medium'),-- 300ml soda water for medium
(2, 4, 400.00, 'large'), -- 400ml soda water for large

-- Redhorse (no size variations)
(3, 5, 1.00, 'medium'),  -- 1 bottle per order

-- Fishball (no size variations)
(4, 6, 5.00, 'medium'),  -- 5 pieces per order

-- Mani (no size variations)
(5, 7, 50.00, 'medium'); -- 50g peanuts per order

-- Create indexes for better performance
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_recipes_menu_item ON recipes(menu_item_id);
