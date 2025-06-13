import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Share, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { Camera } from 'expo-camera';


export default function App() {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Professor');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [, setHasPermission] = useState(null);
  const [] = useState(false);
  const [scanLog, setScanLog] = useState({});

  

  useEffect(() => {
    loadUsers();
    loadScanLog();
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    saveUsers();
  }, [users]);

  const positions = ['Professor','RHU','Direção','Coordenador','Secretaria','Atendimento','Financeiro','Limpeza','Manutenção','Marketing','TI','Auxiliar Administrativo'];

  const generateRandomString = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const saveUsers = async () => {
    try {
      await AsyncStorage.setItem('users', JSON.stringify(users));
    } catch (e) {
      Alert.alert('Erro', 'Falha ao salvar usuário');
    }
  };

  const loadUsers = async () => {
    try {
      const data = await AsyncStorage.getItem('users');
      if (data) setUsers(JSON.parse(data));
    } catch (e) {
      Alert.alert('Erro', 'Falha ao carregar usuários');
    }
  };

  const handleRegister = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome');
      return;
    }
    if (editMode && selectedUser) {
      const updatedUsers = users.map(u => u.id === selectedUser.id ? { ...u, name: name.trim(), position } : u);
      setUsers(updatedUsers);
      setEditMode(false);
      setSelectedUser(null);
    } else {
      const newUser = {
        id: Date.now(),
        name: name.trim(),
        position,
        code: generateRandomString()
      };
      setUsers([...users, newUser]);
    }
    setName('');
    setPosition('Professor');
  };

  const handleUserPress = (user) => {
    setSelectedUser(selectedUser?.id === user.id ? null : user);
  };

  const handleEdit = () => {
    if (selectedUser) {
      setName(selectedUser.name);
      setPosition(selectedUser.position);
      setEditMode(true);
    }
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    Alert.alert('Excluir', 'Deseja mesmo excluir este usuário?', [
      { text: 'Cancelar' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const updatedList = users.filter(u => u.id !== selectedUser.id);
          setUsers(updatedList);
          setSelectedUser(null);
          await AsyncStorage.setItem('users', JSON.stringify(updatedList));
        },
      },
    ]);
  };

  const copyToClipboard = async () => {
    if (!selectedUser) return;
    await Clipboard.setStringAsync(selectedUser.code);
    Alert.alert('Copiado!', 'Código copiado para a área de transferência');
  };

  const shareCode = async () => {
    if (!selectedUser) return;
    try {
      await Share.share({
        message: `Código do Funcionário ${selectedUser.name} (${selectedUser.position}): ${selectedUser.code}`,
        title: 'Compartilhar Código'
      });
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao compartilhar');
    }
  };



  const exportCSV = async () => {
    let csv = 'Nome,Cargo,ID,Total de Leituras\n';
    users.forEach(u => {
      const count = scanLog[u.code] || 0;
      csv += `"${u.name}","${u.position}","${u.code}",${count}\n`;
    });
    const path = FileSystem.documentDirectory + 'registro_leituras.csv';
    await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(path);
  };

  const loadScanLog = async () => {
    const data = await AsyncStorage.getItem('scanLog');
    if (data) setScanLog(JSON.parse(data));
  };



  
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro de Funcionários</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar por nome"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome do Funcionário"
          value={name}
          onChangeText={setName}
        />
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Cargo:</Text>
          <Picker
            selectedValue={position}
            style={styles.picker}
            onValueChange={setPosition}>
            {positions.map((pos, i) => <Picker.Item key={i} label={pos} value={pos} />)}
          </Picker>
        </View>
        <Button title={editMode ? 'Atualizar' : 'Cadastrar'} onPress={handleRegister} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.subtitle}>Funcionários:</Text>
        {filteredUsers.map(user => (
          <TouchableOpacity
            key={user.id}
            style={[styles.userItem, selectedUser?.id === user.id && styles.selectedUserItem]}
            onPress={() => handleUserPress(user)}>
            <Text style={styles.userName}>Nome: {user.name}</Text>
            <Text style={styles.userPosition}>Cargo: {user.position}</Text>
            <Text>PIN: {user.code}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedUser && (
        <View style={styles.qrCodeContainer}>
          <Text style={styles.qrTitle}>{selectedUser.name} - {selectedUser.position}</Text>
          <QRCode value={selectedUser.code} size={200} />
          <View style={styles.buttonRow}>
            <View>
              <Button title="Copiar" onPress={copyToClipboard} />
            </View>
            <View>
              <Button title="Compartilhar" onPress={shareCode} />
            </View>
            <View>
              <Button title="Editar" onPress={handleEdit} />
            </View>
            <View>
              <Button title="Excluir" onPress={handleDelete} />
            </View>
          </View>
        </View>
      )}

  {selectedUser && (
    <Text>Leituras: {scanLog[selectedUser.code] || 0}</Text>
  )}


  <Button title="Limpar Leituras" onPress={() => {
    Alert.alert('Confirmar', 'Deseja apagar o histórico de leituras?', [
      { text: 'Cancelar' },
      { text: 'Apagar', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem('scanLog');
          setScanLog({});},
      }
    ])
  }} />


      <Button title="Exportar CSV" onPress={exportCSV} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f5f5f5' 
  },
  
  formContainer: { 
    marginBottom: 20 
  },

  title: { 
    fontSize: 24, 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  
  subtitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  
  input: { 
    height: 40, 
    borderColor: '#ccc', 
    borderWidth: 1, 
    borderRadius: 5, 
    paddingHorizontal: 10, 
    marginBottom: 15, 
    backgroundColor: '#fff' 
  },
  
  pickerContainer: { 
    marginBottom: 15 
  },

  pickerLabel: { 
    marginBottom: 5, 
    fontSize: 16 
  },
  
  picker: { 
    width: '100%', 
    backgroundColor: '#fff', 
    borderColor: '#ccc', 
    borderWidth: 1, 
    borderRadius: 5 
  },
  
  scrollContainer: { 
    maxHeight: 200 
  },
  
  userItem: { 
    padding: 10, 
    backgroundColor: '#eaeaea', 
    borderRadius: 5, 
    marginBottom: 10 
  },
  
  selectedUserItem: { 
    backgroundColor: '#d0e6ff' 
  },
  
  userName: { 
    fontWeight: 'bold' 
  },
  
  userPosition: { 
    fontStyle: 'italic' 
  },
  
  qrCodeContainer: { 
    marginTop: 10, 
    alignItems: 'center' 
  },
  
  qrTitle: { 
    fontSize: 16, 
    marginBottom: 5 
  },
  
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginVertical: 10,
  }
});
