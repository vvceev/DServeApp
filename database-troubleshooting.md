# MySQL Connection Troubleshooting Guide

## 🔧 Common Connection Issues & Solutions

### Error: "No connection could be made because the target machine actively refused it"

This error means MySQL server is not running or not accepting connections. Here's how to fix it:

## Step 1: Check MySQL Service Status

### Windows:
1. **Open Services**:
   - Press `Win + R`, type `services.msc`, press Enter
   - Look for **MySQL** or **MySQL80** service
   - If stopped, right-click → Start

2. **Alternative via Command Prompt**:
   ```cmd
   net start mysql
   # or
   net start mysql80
   ```

### macOS:
```bash
# Check if MySQL is running
sudo mysql.server status

# Start MySQL
sudo mysql.server start

# or using Homebrew
brew services start mysql
```

### Linux:
```bash
# Check status
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# or
sudo service mysql start
```

## Step 2: Verify MySQL Configuration

### Check MySQL is listening on correct port:
```bash
# Windows
netstat -an | findstr 3306

# macOS/Linux
netstat -an | grep 3306
```

### Check MySQL configuration file:
- **Windows**: `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
- **macOS**: `/usr/local/mysql/my.cnf`
- **Linux**: `/etc/mysql/my.cnf` or `/etc/my.cnf`

Look for:
```
[mysqld]
port=3306
bind-address=127.0.0.1
```

## Step 3: Test MySQL Connection

### Using Command Line:
```bash
# Test connection
mysql -u root -p

# If successful, you'll see:
# Welcome to the MySQL monitor...
```

### Using MySQL Client:
```bash
# Connect to MySQL
mysql -h localhost -u root -p

# Once connected, test:
SHOW DATABASES;
```

## Step 4: Fix phpMyAdmin Configuration

### Update phpMyAdmin config:
1. Find `config.inc.php` file:
   - **XAMPP**: `C:\xampp\phpMyAdmin\config.inc.php`
   - **WAMP**: `C:\wamp\apps\phpmyadmin\config.inc.php`
   - **MAMP**: `/Applications/MAMP/bin/phpMyAdmin/config.inc.php`

2. Update these settings:
```php
$cfg['Servers'][$i]['host'] = 'localhost';
$cfg['Servers'][$i]['port'] = 3306;
$cfg['Servers'][$i]['user'] = 'root';
$cfg['Servers'][$i]['password'] = ''; // Your MySQL password
$cfg['Servers'][$i]['auth_type'] = 'cookie';
```

## Step 5: Reset MySQL Root Password (if needed)

### Windows:
```cmd
# Stop MySQL service
net stop mysql

# Start MySQL without password
mysqld --skip-grant-tables

# In new terminal, connect:
mysql -u root

# Reset password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
EXIT;

# Restart MySQL normally
net start mysql
```

## Step 6: Alternative Solutions

### Option 1: Use XAMPP/WAMP/MAMP
1. **Download XAMPP**: https://www.apachefriends.org/
2. **Install and start** Apache + MySQL
3. **Access phpMyAdmin**: http://localhost/phpmyadmin

### Option 2: Use MySQL Workbench
1. **Download**: https://dev.mysql.com/downloads/workbench/
2. **Connect** using GUI interface
3. **Run SQL script** directly

### Option 3: Use SQLite Instead (Easier)
If MySQL setup is too complex, use SQLite:
```bash
npm install react-native-sqlite-storage
```

## Step 7: Verify Everything Works

### Test connection:
```bash
# Check MySQL is running
mysqladmin -u root -p status

# Test with provided credentials
mysql -u root -p restaurant_management
```

### Import database:
```bash
# Command line import
mysql -u root -p restaurant_management < database-setup.sql
```

## Quick Fix Checklist:
- [ ] MySQL service is running
- [ ] Port 3306 is open
- [ ] Username/password are correct
- [ ] phpMyAdmin config is updated
- [ ] Firewall allows MySQL connections

## Still Having Issues?
Try these commands:
```bash
# Check MySQL version
mysql --version

# Check if MySQL is in PATH
where mysql    # Windows
which mysql    # macOS/Linux

# Check MySQL logs
# Windows: C:\ProgramData\MySQL\MySQL Server 8.0\Data\hostname.err
# macOS: /usr/local/mysql/data/hostname.err
```

## Emergency Solution
If MySQL setup is too complex, use the **existing in-memory database**:
- The app already works with `src/database/users.js`
- No MySQL setup required
- Perfect for development and testing
