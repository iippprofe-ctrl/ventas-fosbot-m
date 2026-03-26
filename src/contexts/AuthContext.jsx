import { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../utils/store';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('fisbot_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username, password) => {
    // Obtener credenciales MASTER desde la configuración (sincronizada con Sheets)
    const settings = getSettings();
    const MASTER_USER = String(settings.master_user || 'admin').trim();
    const MASTER_PASS = String(settings.master_pass || 'admin').trim();
    
    const inputUser = String(username || '').trim();
    const inputPass = String(password || '').trim();

    console.log(`FISBOT_AUTH: Intentando login para [${inputUser}]. Esperado MASTER: [${MASTER_USER}]`);

    // Autenticación de cuenta MASTER
    if (inputUser === MASTER_USER && inputPass === MASTER_PASS) {
      const adminUser = { id: 'master', name: 'MASTER', role: 'owner' };
      setUser(adminUser);
      localStorage.setItem('fisbot_user', JSON.stringify(adminUser));
      return true;
    }
    
    // Check sellers in localstorage
    const usersData = JSON.parse(localStorage.getItem('fisbot_users_db') || '[]');
    const foundSeller = usersData.find(u => 
      String(u.username || '').trim() === inputUser && 
      String(u.password || '').trim() === inputPass
    );
    
    if (foundSeller) {
      const sellerUser = { id: foundSeller.id, name: foundSeller.name, role: 'seller' };
      setUser(sellerUser);
      localStorage.setItem('fisbot_user', JSON.stringify(sellerUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fisbot_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
