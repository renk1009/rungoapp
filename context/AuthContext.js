import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const initialUsers = [
  { username: 'admin', password: '121314' },
  // Pode começar com o admin já cadastrado
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(initialUsers);

  const login = (username, password) => {
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const register = (username, password) => {
    if (users.some((u) => u.username === username)) {
      return false; // Usuário já existe
    }
    const newUser = { username, password };
    setUsers([...users, newUser]);
    return true;
  };

  const editUser = (username, newPassword) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.username === username ? { ...u, password: newPassword } : u
      )
    );
    // Se o usuário logado for o editado, atualiza também o estado `user`
    if (user?.username === username) {
      setUser((prevUser) => ({ ...prevUser, password: newPassword }));
    }
  };

  const deleteUser = (username) => {
    setUsers((prevUsers) => prevUsers.filter((u) => u.username !== username));
    // Se o usuário logado for deletado, desloga ele
    if (user?.username === username) {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, users, login, logout, register, editUser, deleteUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
