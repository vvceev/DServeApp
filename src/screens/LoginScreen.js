import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authenticateUser , createLoginSession } from '../database/users';

import { useUser } from '../contexts/UserContext';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useUser();
  const [loginAs, setLoginAs] = useState('cashier');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    // Reset errors
    setUsernameError('');
    setPasswordError('');

    let hasError = false;

    if (!username.trim()) {
      setUsernameError('Username is required');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      hasError = true;
    }

    if (hasError) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Await authenticateUser  if async
      const user = await authenticateUser (username, password);

      if (user) {
        if (user.role !== loginAs) {
          Alert.alert('Error', `This account is registered as ${user.role}, not ${loginAs}`);
          setIsLoading(false);
          return;
        }

        // Await createLoginSession if async
        const session = await createLoginSession(user.id, user.username, user.role, password);

        console.log('Login successful:', {
          loggedInAs: user.role,
          username: user.username,
          userId: user.id,
          loginTime: session.loginTime,
        });

        await login(user);  // Set user in context and persist

        navigation.navigate('Dashboard');

        setUsername('');
        setPassword('');
      } else {
        Alert.alert('Login Failed', 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectOption = (option) => {
    setLoginAs(option);
    setIsDropdownOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.centeredContainer}>
          <View style={styles.unifiedCard}>
            <View style={styles.cardContent}>
              <View style={styles.logoSection}>
                <View style={styles.logoPlaceholder}>
                  <Image
                    source={require('../../assets/app_images/D\'Serve Logo .png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View style={styles.loginFormSection}>
                <Text style={styles.loginTitle}>Login</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Log in as</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={toggleDropdown}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.dropdownButtonText}>{loginAs}</Text>
                    <Text style={styles.dropdownArrow}>{isDropdownOpen ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {isDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      {['cashier', 'owner', 'admin'].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.dropdownMenuItem,
                            loginAs === option && styles.selectedMenuItem,
                          ]}
                          onPress={() => selectOption(option)}
                        >
                          <Text
                            style={[
                              styles.dropdownMenuText,
                              loginAs === option && styles.selectedMenuText,
                            ]}
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Username <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, usernameError ? styles.inputError : null]}
                    placeholder="Enter username"
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      setUsernameError('');
                    }}
                    autoCapitalize="none"
                  />
                  {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Password <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, passwordError ? styles.inputError : null]}
                    placeholder="Enter password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError('');
                    }}
                    secureTextEntry
                  />
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

                <TouchableOpacity
                  style={[styles.loginButton, isLoading && { opacity: 0.6 }]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.loginButtonText}>{isLoading ? 'Logging in...' : 'Log In'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  unifiedCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    width: '100%',
    maxWidth: 600,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  loginFormSection: {
    flex: 1.5,
    paddingLeft: 20,
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: '#fafafa',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fafafa',
    overflow: 'hidden',
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c757d',
    textAlign: 'center',
  },
  logoSubtext: {
    fontSize: 14,
    color: '#fafafa',
    textAlign: 'center',
    marginTop: 5,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: 'black',
    marginBottom: 6,
    fontWeight: '500',
  },
  dropdownButton: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: 'black',
    fontSize: 14,
  },
  dropdownArrow: {
    color: '#666',
    fontSize: 12,
  },
  dropdownMenu: {
    marginTop: 3,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: 'white',
    elevation: 3,
  },
  dropdownMenuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedMenuItem: {
    backgroundColor: '#fff3e0',
  },
  dropdownMenuText: {
    color: 'black',
    fontSize: 14,
  },
  selectedMenuText: {
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
    color: 'black',
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  required: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: '#FF6B35',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF6B35',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default LoginScreen;
