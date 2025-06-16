import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './context/AuthContext';
import QrScannerScreen from './assets/screens/QrScannerScreen';
import LoginScreen from './assets/screens/LoginScreen';
import MainScreen from './assets/screens/MainScreen';
import RegisterUserScreen from './assets/screens/RegisterUserScreen';
import ManageUserScreen from './assets/screens/ManageUserScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

function MainNavigator() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="QR Scanner" component={QrScannerScreen} />
      <Stack.Screen name="Funcionarios" component={MainScreen} />
      <Stack.Screen name="RegistrarUsuário" component={RegisterUserScreen} />
      <Stack.Screen name="GerenciarUsuários" component={ManageUserScreen} />
    </Stack.Navigator>
  );
}

function HomeScreen({ navigation }) {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao App</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('QR Scanner')}
      >
        <Text style={styles.buttonText}>Abrir Scanner de QR Code</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Funcionarios')}
      >
        <Text style={styles.buttonText}>Tela Funcionários</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RegistrarUsuário')}
      >
        <Text style={styles.buttonText}>Cadastrar Novo Usuário</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('GerenciarUsuários')}
      >
        <Text style={styles.buttonText}>Gerenciar Usuários</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={logout}
      >
        <Text style={[styles.buttonText, styles.logoutButtonText]}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 40,
    color: '#222',
  },
  button: {
    width: '100%',
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24, // aumenta o espaçamento
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#e94e4e',
    marginTop: 30, // espaçamento maior antes do botão sair
    marginBottom: 0, // remove marginBottom extra que o padrão tinha
  },
  logoutButtonText: {
    fontWeight: '700',
    fontSize: 17,
  },
});

