import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { createApiClient } from '../utils/api';

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatar: string;
  favoriteGenres: string[];
  readingGoal: number;
  isPublic: boolean;
  isAdmin: boolean;
  followers: string[];
  following: string[];
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  newUsersThisMonth: number;
  activeUsers: number;
}

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  users: AdminUser[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  stats: AdminStats | null;
  fetchUsers: (page?: number, limit?: number, search?: string) => Promise<void>;
  fetchUserById: (userId: string) => Promise<AdminUser | null>;
  updateUser: (userId: string, updates: Partial<AdminUser>) => Promise<boolean>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  fetchStats: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to track if we've already fetched data
  const hasInitialized = useRef(false);
  const previousIsAdmin = useRef(false);

  const api = createApiClient();
  const isAdmin = Boolean(user && (user as any).isAdmin);

  const fetchUsers = useCallback(async (page = 1, limit = 10, search = '') => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });
      
      const response = await api.get(`/admin/users?${params}`);
      const { users: fetchedUsers, totalUsers: total, totalPages: pages, currentPage: current } = response.data;
      
      setUsers(fetchedUsers);
      setTotalUsers(total);
      setTotalPages(pages);
      setCurrentPage(current);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, api]);

  const fetchUserById = useCallback(async (userId: string): Promise<AdminUser | null> => {
    if (!isAdmin) return null;
    
    try {
      setError(null);
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch user');
      return null;
    }
  }, [isAdmin, api]);

  const updateUser = useCallback(async (userId: string, updates: Partial<AdminUser>): Promise<boolean> => {
    if (!isAdmin) return false;
    
    try {
      setError(null);
      const response = await api.put(`/admin/users/${userId}`, updates);
      
      // Update local users list if the updated user is in the current list
      setUsers(prevUsers => 
        prevUsers.map(u => u._id === userId ? response.data : u)
      );
      
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update user');
      return false;
    }
  }, [isAdmin, api]);

  const resetUserPassword = useCallback(async (userId: string, newPassword: string): Promise<boolean> => {
    if (!isAdmin) return false;
    
    try {
      setError(null);
      await api.post(`/admin/users/${userId}/reset-password`, { newPassword });
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to reset password');
      return false;
    }
  }, [isAdmin, api]);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    if (!isAdmin) return false;
    
    try {
      setError(null);
      await api.delete(`/admin/users/${userId}`);
      
      // Remove user from local list
      setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
      setTotalUsers(prev => prev - 1);
      
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete user');
      return false;
    }
  }, [isAdmin, api]);

  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      setError(null);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch stats');
    }
  }, [isAdmin, api]);

  useEffect(() => {
    // Only fetch data when admin status changes or on first load
    if (isAdmin && (!hasInitialized.current || previousIsAdmin.current !== isAdmin)) {
      hasInitialized.current = true;
      previousIsAdmin.current = isAdmin;
      fetchUsers();
      fetchStats();
    }
  }, [isAdmin]); // Remove fetchUsers and fetchStats from dependencies

  const value: AdminContextType = {
    isAdmin,
    loading,
    error,
    users,
    totalUsers,
    totalPages,
    currentPage,
    stats,
    fetchUsers,
    fetchUserById,
    updateUser,
    resetUserPassword,
    deleteUser,
    fetchStats,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
