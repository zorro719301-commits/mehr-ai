import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { OfflineSyncService } from '../services/offlineSync.js';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'MEDICAL_ADMIN' | 'SPECIALIST' | 'PARENT' | 'AUDITOR';
  phone?: string;
  avatarUrl?: string;
  parentProfile?: any;
  specialistProfile?: any;
}

export interface ChildSummary {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  region: string;
  school?: string;
  grade?: string;
  contactPhone?: string;
  contactAddress?: string;
  photoUrl?: string;
  chiefComplaint?: string;
  conditions?: any[];
  medicalProfile?: any;
  packages?: any[];
  assessments?: any[];
}

interface AuthContextType {
  user: User | null;
  role: 'SUPER_ADMIN' | 'MEDICAL_ADMIN' | 'SPECIALIST' | 'PARENT' | 'AUDITOR' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnline: boolean;
  activeChild: ChildSummary | null;
  childrenList: ChildSummary[];
  setActiveChild: (child: ChildSummary | null) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [childrenList, setChildrenList] = useState<ChildSummary[]>([]);
  const [activeChild, setActiveChild] = useState<ChildSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor network online/offline and auto-sync queue
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      console.log('Online status detected. Triggering offline sync...');
      await OfflineSyncService.flushQueue(api);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshUserData = async () => {
    try {
      const res = await api.get('/api/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
        // Load children
        const childRes = await api.get('/api/children');
        if (childRes.success && childRes.data) {
          setChildrenList(childRes.data);
          if (childRes.data.length > 0 && !activeChild) {
            setActiveChild(childRes.data[0]);
          }
        }
      } else {
        setUser(null);
        setChildrenList([]);
        setActiveChild(null);
      }
    } catch {
      setUser(null);
      setChildrenList([]);
      setActiveChild(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password: pass });
      if (res.success && res.data) {
        api.setTokens(res.data.accessToken, res.data.refreshToken);
        setUser(res.data.user);
        await refreshUserData();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.clearTokens();
    setUser(null);
    setActiveChild(null);
    setChildrenList([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        isOnline,
        activeChild,
        childrenList,
        setActiveChild,
        login,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
