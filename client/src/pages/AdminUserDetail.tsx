import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Save,
  VpnKey,
  Delete,
  Person,
  Email,
  AdminPanelSettings
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';

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

const AdminUserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { isAdmin, fetchUserById, updateUser, resetUserPassword, deleteUser } = useAdmin();
  
  const [userData, setUserData] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<Partial<AdminUser>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      navigate('/');
      return;
    }
    
    if (!userId) {
      navigate('/admin');
      return;
    }
    
    loadUserData();
  }, [currentUser, isAdmin, userId, navigate]);

  const loadUserData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const user = await fetchUserById(userId);
      if (user) {
        setUserData(user);
        setFormData(user);
      } else {
        setError('User not found');
      }
    } catch (err) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AdminUser, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!userId) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const success = await updateUser(userId, formData);
      if (success) {
        setSuccess('User updated successfully');
        // Reload user data to get fresh data
        loadUserData();
      }
    } catch (err) {
      setError('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!userId || !newPassword.trim() || newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      const success = await resetUserPassword(userId, newPassword);
      if (success) {
        setResetPasswordDialog(false);
        setNewPassword('');
        setSuccess('Password reset successfully');
      }
    } catch (err) {
      setError('Failed to reset password');
    }
  };

  const handleDeleteUser = async () => {
    if (!userId) return;
    
    try {
      const success = await deleteUser(userId);
      if (success) {
        navigate('/admin');
      }
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  if (!currentUser || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading user data...</Typography>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">User not found</Alert>
        <Button 
          onClick={() => navigate('/admin')} 
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Back to Admin Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/admin')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ color: '#8B4513', fontWeight: 'bold' }}>
            Edit User: {userData.username}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            onClick={() => setResetPasswordDialog(true)}
            startIcon={<VpnKey />}
            sx={{ mr: 1, color: '#D2691E', borderColor: '#D2691E' }}
          >
            Reset Password
          </Button>
          <Button
            variant="outlined"
            onClick={() => setDeleteDialog(true)}
            startIcon={<Delete />}
            color="error"
          >
            Delete User
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* User Info Card */}
      <Card sx={{ mb: 3, bgcolor: '#FFF8DC' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar 
              src={userData.avatar || ''} 
              sx={{ mr: 2, width: 60, height: 60, bgcolor: '#8B4513' }}
            >
              {userData.displayName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">{userData.displayName}</Typography>
              <Typography color="text.secondary">@{userData.username}</Typography>
              <Typography variant="body2" color="text.secondary">
                Joined: {new Date(userData.joinDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip 
              icon={userData.isAdmin ? <AdminPanelSettings /> : <Person />}
              label={userData.isAdmin ? 'Administrator' : 'Regular User'} 
              color={userData.isAdmin ? 'error' : 'default'}
            />
            <Chip 
              label={userData.isPublic ? 'Public Profile' : 'Private Profile'} 
              color={userData.isPublic ? 'success' : 'default'}
            />
            <Chip 
              label={`${userData.followers.length} Followers`} 
              variant="outlined"
            />
            <Chip 
              label={`${userData.following.length} Following`} 
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Paper sx={{ p: 3, bgcolor: '#FFF8DC' }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#8B4513' }}>
          User Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username || ''}
              onChange={(e) => handleInputChange('username', e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Display Name"
              value={formData.displayName || ''}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={3}
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Reading Goal"
              type="number"
              value={formData.readingGoal || 12}
              onChange={(e) => handleInputChange('readingGoal', parseInt(e.target.value) || 12)}
              variant="outlined"
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Avatar URL"
              value={formData.avatar || ''}
              onChange={(e) => handleInputChange('avatar', e.target.value)}
              variant="outlined"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2, color: '#8B4513' }}>
          Permissions & Privacy
        </Typography>

        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAdmin || false}
                  onChange={(e) => handleInputChange('isAdmin', e.target.checked)}
                  color="primary"
                />
              }
              label="Administrator Privileges"
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublic || false}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  color="primary"
                />
              }
              label="Public Profile"
            />
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            onClick={() => navigate('/admin')}
            startIcon={<ArrowBack />}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={<Save />}
            sx={{ 
              bgcolor: '#8B4513', 
              '&:hover': { bgcolor: '#A0522D' }
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog} onClose={() => setResetPasswordDialog(false)}>
        <DialogTitle>Reset Password for {userData.username}</DialogTitle>
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
          <Button onClick={() => setResetPasswordDialog(false)}>
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
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user <strong>{userData.username}</strong>? 
            This action cannot be undone and will remove all their data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error">
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUserDetail;
