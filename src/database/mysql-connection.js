// MySQL connection configuration for React Native
// This is a configuration file - you'll need to set up a backend API

// For React Native, you'll need a backend API since MySQL can't run directly on mobile
// Here's the configuration for your backend API

const mysqlConfig = {
  host: 'localhost',        // Your MySQL server host
  user: 'root',             // Your MySQL username
  password: '',             // Your MySQL password
  database: 'restaurant_management',
  port: 3306,
  charset: 'utf8mb4'
};

// Backend API endpoints you'll need to create:
/*
// PHP Backend Example (save as api/login.php)
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$dbname = 'restaurant_management';
$username = 'root';
$password = '';

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
                $_SERVER['HTTP_USER_AGENT']
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
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
*/

// Node.js Backend Example (save as server.js)
/*
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'restaurant_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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
        [user.id, user.username, user.role, req.ip, req.get('User-Agent')]
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

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
*/

export default mysqlConfig;
