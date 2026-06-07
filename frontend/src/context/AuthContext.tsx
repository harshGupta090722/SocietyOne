import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  role: 'landlord' | 'tenant' | 'admin' | null;
  userId: string | null;
  firstName: string | null;
  login: (token: string, role: 'landlord' | 'tenant' | 'admin', userId: string, firstName?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<'landlord' | 'tenant' | 'admin' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on initial load
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role') as 'landlord' | 'tenant' | 'admin' | null;
    const storedUserId = localStorage.getItem('userId');
    const storedFirstName = localStorage.getItem('firstName');

    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
      setUserId(storedUserId);
      setFirstName(storedFirstName);
    }
    
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newRole: 'landlord' | 'tenant' | 'admin', newUserId: string, newFirstName?: string) => {
    setToken(newToken);
    setRole(newRole);
    setUserId(newUserId);
    setFirstName(newFirstName || null);
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    localStorage.setItem('userId', newUserId);
    if (newFirstName) {
      localStorage.setItem('firstName', newFirstName);
    } else {
      localStorage.removeItem('firstName');
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUserId(null);
    setFirstName(null);
    
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        userId,
        firstName,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};