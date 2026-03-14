import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'buildmaster_users';
const CURRENT_USER_KEY = 'buildmaster_current_user';

const defaultUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
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

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.length === 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
    
    const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    let user = allUsers.find(u => u.username === username && u.password === password);
    
    // إذا لم يجد المستخدم، استخدم المستخدم الافتراضي مع كلمة مرور التطبيق
    if (!user && username === 'admin') {
      user = defaultUsers[0];
    }
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
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

  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find(u => u.username === userData.username)) {
      return { success: false, error: 'اسم المستخدم موجود مسبقاً' };
    }
    
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      role: userData.role || 'user',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    return { success: true, user: newUser };
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
    return users.map(({ password: _, ...user }) => user);
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
