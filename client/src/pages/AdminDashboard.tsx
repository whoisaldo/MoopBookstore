import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Alert,
  Pagination,
  Tooltip
} from '@mui/material';
import {
  Edit,
  Delete,
  VpnKey,
  Search,
  PersonAdd,
  AdminPanelSettings,
  Group,
  TrendingUp,
  Security
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    isAdmin, 
    loading, 
    error, 
    users, 
    totalPages, 
    currentPage, 
    stats,
    fetchUsers, 
    updateUser, 
    resetUserPassword, 
    deleteUser,
    fetchStats
  } = useAdmin();
  
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    open: boolean;
    userId: string;
    username: string;
  }>({ open: false, userId: '', username: '' });
  const [newPassword, setNewPassword] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    userId: string;
    username: string;
  }>({ open: false, userId: '', username: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      navigate('/');
      return;
    }
  }, [user, isAdmin, navigate]);

  // Prevent unnecessary re-renders
  const memoizedFetchUsers = useCallback(() => {
    if (isAdmin && !loading) {
      fetchUsers(1, 10, searchTerm);
    }
  }, [isAdmin, loading, fetchUsers, searchTerm]);

  const memoizedFetchStats = useCallback(() => {
    if (isAdmin && !loading) {
      fetchStats();
    }
  }, [isAdmin, loading, fetchStats]);

  // Only fetch data once when component mounts and user is admin
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isAdmin && user) {
      memoizedFetchUsers();
      memoizedFetchStats();
    }
  }, [isAdmin, user]); // Intentionally excluding memoized functions to prevent infinite loops

  const handleSearch = () => {
    fetchUsers(1, 10, searchTerm);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    fetchUsers(page, 10, searchTerm);
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    const success = await resetUserPassword(resetPasswordDialog.userId, newPassword);
    if (success) {
      setResetPasswordDialog({ open: false, userId: '', username: '' });
      setNewPassword('');
      alert('Password reset successfully');
    }
  };

  const handleDeleteUser = async () => {
    const success = await deleteUser(deleteDialog.userId);
    if (success) {
      setDeleteDialog({ open: false, userId: '', username: '' });
      alert('User deleted successfully');
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    const success = await updateUser(userId, { isAdmin: !currentStatus });
    if (success) {
      alert(`Admin status ${!currentStatus ? 'granted' : 'revoked'} successfully`);
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <AdminPanelSettings sx={{ mr: 2, fontSize: 32, color: '#8B4513' }} />
        <Typography variant="h4" component="h1" sx={{ color: '#8B4513', fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4
        }}>
          <Box>
            <Card sx={{ bgcolor: '#FFF8DC', borderLeft: '4px solid #8B4513' }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Group sx={{ color: '#8B4513', mr: 1 }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: '#8B4513' }}>
                      {stats.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{ bgcolor: '#F5E6D3', borderLeft: '4px solid #D2691E' }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Security sx={{ color: '#D2691E', mr: 1 }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: '#D2691E' }}>
                      {stats.totalAdmins}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Administrators
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{ bgcolor: '#E6F3FF', borderLeft: '4px solid #4A90E2' }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUp sx={{ color: '#4A90E2', mr: 1 }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: '#4A90E2' }}>
                      {stats.newUsersThisMonth}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      New This Month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{ bgcolor: '#E8F5E8', borderLeft: '4px solid #4CAF50' }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PersonAdd sx={{ color: '#4CAF50', mr: 1 }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: '#4CAF50' }}>
                      {stats.activeUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Search and Controls */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#FFF8DC' }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            label="Search Users"
            placeholder="Username, email, or display name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flexGrow: 1 }}
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            startIcon={<Search />}
            sx={{ 
              bgcolor: '#8B4513', 
              '&:hover': { bgcolor: '#A0522D' }
            }}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper sx={{ bgcolor: '#FFF8DC' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F5E6D3' }}>
                <TableCell><strong>Username</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Display Name</strong></TableCell>
                <TableCell><strong>Admin</strong></TableCell>
                <TableCell><strong>Public</strong></TableCell>
                <TableCell><strong>Join Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>Loading users...</Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((userData) => (
                  <TableRow key={userData._id} hover>
                    <TableCell>{userData.username}</TableCell>
                    <TableCell>{userData.email}</TableCell>
                    <TableCell>{userData.displayName}</TableCell>
                    <TableCell>
                      <Chip
                        label={userData.isAdmin ? 'Admin' : 'User'}
                        color={userData.isAdmin ? 'error' : 'default'}
                        size="small"
                        onClick={() => toggleAdminStatus(userData._id, userData.isAdmin)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={userData.isPublic ? 'Public' : 'Private'}
                        color={userData.isPublic ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(userData.joinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/users/${userData._id}`)}
                            sx={{ color: '#8B4513' }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reset Password">
                          <IconButton
                            size="small"
                            onClick={() => setResetPasswordDialog({
                              open: true,
                              userId: userData._id,
                              username: userData.username
                            })}
                            sx={{ color: '#D2691E' }}
                          >
                            <VpnKey />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteDialog({
                              open: true,
                              userId: userData._id,
                              username: userData.username
                            })}
                            sx={{ color: '#DC143C' }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#8B4513',
                  '&.Mui-selected': {
                    backgroundColor: '#8B4513',
                    color: 'white',
                  },
                },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog.open} onClose={() => setResetPasswordDialog({ open: false, userId: '', username: '' })}>
        <DialogTitle>Reset Password for {resetPasswordDialog.username}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Password must be at least 6 characters long"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setResetPasswordDialog({ open: false, userId: '', username: '' })}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleResetPassword}
            variant="contained"
            sx={{ bgcolor: '#8B4513', '&:hover': { bgcolor: '#A0522D' } }}
          >
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, userId: '', username: '' })}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user <strong>{deleteDialog.username}</strong>? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, userId: '', username: '' })}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
