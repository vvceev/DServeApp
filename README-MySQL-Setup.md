# MySQL Database Setup Guide for Restaurant Management System

## Step 1: Set up MySQL Database with phpMyAdmin

### 1.1 Create Database
1. Open phpMyAdmin in your browser (usually `http://localhost/phpmyadmin`)
2. Click "New" to create a new database
3. Name it: `restaurant_management`
4. Collation: `utf8mb4_general_ci`
5. Click "Create"

### 1.2 Import Database Structure
1. Select the `restaurant_management` database
2. Click "Import" tab
3. Choose file: `database-setup.sql` (provided in this project)
4. Click "Go" to import

## Step 2: Set up Backend API

### Option A: PHP Backend (Recommended for phpMyAdmin users)

#### 2.1 Create PHP API
1. Create a folder `api` in your web server directory (e.g., `htdocs/api`)
2. Create file `api/login.php`:

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$dbname = 'restaurant_management';
$username = 'root'; // Change to your MySQL username
$password = '';     // Change to your MySQL password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
        $stmt->execute([$data['username']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($data['password'], $user['password'])) {
            // Create login session
            $stmt = $pdo->prepare("INSERT INTO login_sessions (user_id, username, role, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $user['id'], 
                $user['username'], 
                $user['role'], 
                $_SERVER['REMOTE_ADDR'], 
                $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
            ]);
            
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'role' => $user['role'],
                    'displayName' => $user['display_name']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'users') {
        $stmt = $pdo->prepare("SELECT id, username, role, display_name FROM users WHERE is_active = 1");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($users);
    }
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
```

### Option B: Node.js Backend

#### 2.1 Install Node.js dependencies
```bash
npm init -y
npm install express mysql2 cors bcryptjs
```

#### 2.2 Create `server.js`:
```javascript
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',        // Change to your MySQL username
  password: '',        // Change to your MySQL password
  database: 'restaurant_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  pool.query(
    'SELECT * FROM users WHERE username = ? AND is_active = 1',
    [username],
    async (error, results) => {
      if (error) return res.status(500).json({ error: 'Database error' });
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = results[0];
      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Create login session
      pool.query(
        'INSERT INTO login_sessions (user_id, username, role, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [user.id, user.username, user.role, req.ip, req.get('User-Agent') || 'Unknown']
      );
      
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          displayName: user.display_name
        }
      });
    }
  );
});

// Get users endpoint
app.get('/api/users', (req, res) => {
  pool.query(
    'SELECT id, username, role, display_name FROM users WHERE is_active = 1',
    (error, results) => {
      if (error) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    }
  );
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

## Step 3: Update React Native App

### 3.1 Install axios
```bash
npm install axios
```

### 3.2 Update LoginScreen.js
Replace the import:
```javascript
// Change from:
// import { authenticateUser, createLoginSession } from '../database/users';

// To:
import mysqlUserService from '../database/mysql-api';
```

### 3.3 Update the login function
```javascript
const handleLogin = async () => {
  if (!username || !password) {
    Alert.alert('Error', 'Please enter both username and password');
    return;
  }

  setIsLoading(true);
  
  try {
    const user = await mysqlUserService.authenticateUser(username, password);
    
    if (user) {
      if (user.role !== loginAs) {
        Alert.alert('Error', `This account is registered as ${user.role}, not ${loginAs}`);
        setIsLoading(false);
        return;
      }

      console.log('Login successful:', {
        loggedInAs: user.role,
        username: user.username,
        userId: user.id,
        loginTime: new Date()
      });

      Alert.alert(
        'Login Successful', 
        `Welcome ${user.displayName}! You are logged in as ${user.role}.`
      );
      
      setUsername('');
      setPassword('');
    } else {
      Alert.alert('Login Failed', 'Invalid username or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    Alert.alert('Error', 'Cannot connect to server');
  } finally {
    setIsLoading(false);
  }
};
```

## Step 4: Test the Setup

### 4.1 Start Backend
- **PHP**: Place files in your web server directory and access via `http://localhost/api/login.php`
- **Node.js**: Run `node server.js` and access via `http://localhost:3001/api/login`

### 4.2 Test Login
Use these pre-made accounts:
- **Cashier**: username: `cashier1`, password: `password123`
- **Owner**: username: `owner1`, password: `password123`
- **Admin**: username: `admin1`, password: `password123`

### 4.3 Check phpMyAdmin
- View users in `restaurant_management.users` table
- View login history in `restaurant_management.login_sessions` table
