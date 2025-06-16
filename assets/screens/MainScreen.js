import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Alert, Button, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import QRCode from 'react-native-qrcode-svg';

import UserForm from './Userform';
import UserList from './UserList';
import UserDetails from './UserDetails';

export default function MainScreen() {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Professor');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [scanLog, setScanLog] = useState({});
  const qrRef = useRef();

  useEffect(() => {
    loadUsers();
    loadScanLog();
  }, []);

  useEffect(() => {
    saveUsers();
  }, [users]);

  const loadUsers = async () => {
    try {
      const data = await AsyncStorage.getItem('users');
      if (data) setUsers(JSON.parse(data));
    } catch {
      Alert.alert('Erro', 'Falha ao carregar usuários');
    }
  };

  const saveUsers = async () => {
    try {
      await AsyncStorage.setItem('users', JSON.stringify(users));
    } catch {
      Alert.alert('Erro', 'Falha ao salvar usuário');
    }
  };

  const loadScanLog = async () => {
    const data = await AsyncStorage.getItem('scanLog');
    if (data) setScanLog(JSON.parse(data));
  };

  const generateRandomString = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleRegister = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome');
      return;
    }
    if (editMode && selectedUser) {
      const updatedUsers = users.map(u =>
        u.id === selectedUser.id ? { ...u, name: name.trim(), position } : u
      );
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
    Alert.alert('Copiado', 'PIN copiado para a área de transferência');
  };

  const shareQRCode = async () => {
    if (!qrRef.current || !selectedUser) return;

    qrRef.current.toDataURL(async (dataURL) => {
      const fileUri = FileSystem.cacheDirectory + `${selectedUser.code}.png`;
      await FileSystem.writeAsStringAsync(fileUri, dataURL, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Erro', 'Compartilhamento não disponível');
        return;
      }

      await Sharing.shareAsync(fileUri);
    });
  };

  const exportToPdf = async () => {
    let htmlContent = `
      <h1>Lista de Funcionários</h1>
      <table border="1" cellspacing="0" cellpadding="8" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #ddd;">
            <th>Nome</th>
            <th>Cargo</th>
            <th>PIN</th>
            <th>Leituras</th>
          </tr>
        </thead>
        <tbody>
          ${users
            .map(
              (user) => `
            <tr>
              <td>${user.name}</td>
              <td>${user.position}</td>
              <td>${user.code}</td>
              <td>${scanLog[user.code] || 0}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;

    try {
      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro de Funcionários</Text>

      <View style={styles.sectionWrapper}>
        <UserForm
          name={name}
          setName={setName}
          position={position}
          setPosition={setPosition}
          editMode={editMode}
          onSubmit={handleRegister}
        />
      </View>

      <View style={styles.sectionWrapper}>
        <UserList
          users={users}
          search={search}
          setSearch={setSearch}
          selectedUser={selectedUser}
          onUserPress={handleUserPress}
        />
      </View>

      <View style={styles.sectionWrapper}>
        <UserDetails
          selectedUser={selectedUser}
          scanLog={scanLog}
          onCopy={copyToClipboard}
          onShare={shareQRCode}
          onEdit={handleEdit}
          onDelete={handleDelete}
          qrRef={qrRef}
        />
      </View>

      <View style={styles.exportButtonWrapper}>
        <Button
          title="Exportar Lista para PDF"
          onPress={exportToPdf}
          color="#4CAF50"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
    color: '#222',
  },
  sectionWrapper: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    // Sombra iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // Sombra Android
    elevation: 3,
  },
  exportButtonWrapper: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
});
