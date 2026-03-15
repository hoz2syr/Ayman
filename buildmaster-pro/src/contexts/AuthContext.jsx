import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'buildmaster_users';
const CURRENT_USER_KEY = 'buildmaster_current_user';

const DEFAULT_ADMIN_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const defaultUsers = [
  {
    id: '1',
    username: 'admin',
    passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
    name: 'مدير النظام',
    role: 'admin',
    email: 'admin@buildmaster.com',
    createdAt: new Date().toISOString()
  }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.length === 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
    
    const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const inputHash = await hashPassword(password);
    let user = allUsers.find(u => u.username === username && u.passwordHash === inputHash);
    
    if (!user && username === 'admin') {
      user = defaultUsers[0];
      const inputHash = await hashPassword('admin');
      if (inputHash !== DEFAULT_ADMIN_PASSWORD_HASH) {
        return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
      }
    }
    
    if (user) {
      const { passwordHash: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const register = async (userData) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find(u => u.username === userData.username)) {
      return { success: false, error: 'اسم المستخدم موجود مسبقاً' };
    }
    
    const passwordHash = await hashPassword(userData.password);
    
    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      passwordHash,
      name: userData.name,
      role: userData.role || 'user',
      email: userData.email,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
  };

  const updateUser = (userId, updates) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      if (currentUser && currentUser.id === userId) {
        const { password: _, ...updatedUser } = users[index];
        setCurrentUser(updatedUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }
      
      return { success: true };
    }
    
    return { success: false, error: 'المستخدم غير موجود' };
  };

  const getAllUsers = () => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users.map(({ passwordHash: _, ...user }) => user);
  };

  const deleteUser = (userId) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
    return { success: true };
  };

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    
    const permissions = {
      admin: ['all'],
      manager: ['projects', 'expenses', 'invoices', 'contractors', 'sales', 'reports'],
      user: ['projects', 'expenses', 'invoices'],
      viewer: ['reports']
    };
    
    const userPermissions = permissions[currentUser.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      login,
      logout,
      register,
      updateUser,
      getAllUsers,
      deleteUser,
      hasPermission,
      isAuthenticated: !!currentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
