import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  phone: string | null;
  isAuthenticated: boolean;
  login: (phone: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    const storedPhone = localStorage.getItem('user_phone');
    if (storedPhone) {
      setPhone(storedPhone);
    }
  }, []);

  const login = (phoneNumber: string) => {
    setPhone(phoneNumber);
    localStorage.setItem('user_phone', phoneNumber);
  };

  const logout = () => {
    setPhone(null);
    localStorage.removeItem('user_phone');
  };

  return (
    <AuthContext.Provider value={{ 
      phone, 
      isAuthenticated: !!phone,
      login,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
