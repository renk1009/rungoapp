import React from 'react';
import { View, Text, FlatList, Alert, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ManageUsersScreen() {
  const { users, editUser, deleteUser } = useAuth();
  const [editingUser, setEditingUser] = React.useState(null);
  const [newPassword, setNewPassword] = React.useState('');

  const startEditing = (user) => {
    setEditingUser(user);
    setNewPassword(user.password);
  };

  const saveEdit = () => {
    if (!newPassword.trim()) {
      Alert.alert('Erro', 'Senha não pode ser vazia');
      return;
    }
    editUser(editingUser.username, newPassword.trim());
    setEditingUser(null);
    setNewPassword('');
  };

  const confirmDelete = (username) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja excluir o usuário ${username}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteUser(username) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Usuários</Text>

      {editingUser ? (
        <View>
          <Text style={styles.editingText}>Editando: {editingUser.username}</Text>
          <TextInput
            style={styles.input}
            placeholder="Nova senha"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.button, !newPassword.trim() ? styles.buttonDisabled : styles.saveButton]}
              onPress={saveEdit}
              disabled={!newPassword.trim()}
            >
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setEditingUser(null)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.username}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <Text style={styles.username}>{item.username}</Text>
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={[styles.button, styles.editButton]}
                  onPress={() => startEditing(item)}
                >
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={() => confirmDelete(item.username)}
                >
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  editingText: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#999',
    minWidth: 80,
    marginRight: 0,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#e53935',
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
});
