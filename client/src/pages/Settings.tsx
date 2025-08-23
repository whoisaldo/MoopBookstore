import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Avatar,
  Chip,
  Switch,
  FormControlLabel,
  Slider,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import Grid from '../components/CustomGrid';
import {
  Save,
  Cancel,
  PhotoCamera,
  Person,
  Book,
  Security,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MoopsLogo from '../components/MoopsLogo';

const API_URL = process.env.REACT_APP_API_URL || 'https://moops-bookstore-api-064ad9bcc3f1.herokuapp.com/api';

interface ProfileFormData {
  displayName: string;
  bio: string;
  avatar: string;
  favoriteGenres: string[];
  readingGoal: number;
  isPublic: boolean;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: '',
    bio: '',
    avatar: '',
    favoriteGenres: [],
    readingGoal: 12,
    isPublic: true
  });

  const [newGenre, setNewGenre] = useState('');

  // Common genres for suggestions
  const commonGenres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 
    'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
    'Technology', 'Philosophy', 'Poetry', 'Drama', 'Horror',
    'Adventure', 'Thriller', 'Comedy', 'Educational', 'Children'
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        favoriteGenres: user.favoriteGenres || [],
        readingGoal: user.readingGoal || 12,
        isPublic: user.isPublic !== undefined ? user.isPublic : true
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddGenre = () => {
    if (newGenre.trim() && !formData.favoriteGenres.includes(newGenre.trim())) {
      handleInputChange('favoriteGenres', [...formData.favoriteGenres, newGenre.trim()]);
      setNewGenre('');
    }
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    handleInputChange('favoriteGenres', formData.favoriteGenres.filter(genre => genre !== genreToRemove));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update local user context
      if (updateUser) {
        updateUser(updatedUser.user);
      }

      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        favoriteGenres: user.favoriteGenres || [],
        readingGoal: user.readingGoal || 12,
        isPublic: user.isPublic !== undefined ? user.isPublic : true
      });
    }
    setError(null);
    setSuccess(null);
  };

  if (!user) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <MoopsLogo size="small" showText={false} />
        </Box>
        <Typography variant="h4" component="h1" sx={{ color: '#5D4037', fontWeight: 'bold' }}>
          Profile Settings
        </Typography>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person sx={{ mr: 1, color: '#D4A574' }} />
                <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 'bold' }}>
                  Profile Information
                </Typography>
              </Box>

              {/* Avatar Section */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  src={formData.avatar}
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mx: 'auto', 
                    mb: 2,
                    border: '3px solid #D4A574'
                  }}
                >
                  {formData.displayName.charAt(0).toUpperCase()}
                </Avatar>
                <TextField
                  fullWidth
                  label="Avatar URL"
                  value={formData.avatar}
                  onChange={(e) => handleInputChange('avatar', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small">
                          <PhotoCamera />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Display Name */}
              <TextField
                fullWidth
                label="Display Name"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                margin="normal"
                required
                inputProps={{ maxLength: 50 }}
                helperText={`${formData.displayName.length}/50 characters`}
              />

              {/* Bio */}
              <TextField
                fullWidth
                label="Bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                margin="normal"
                multiline
                rows={3}
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.bio.length}/500 characters`}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Reading Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Book sx={{ mr: 1, color: '#D4A574' }} />
                <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 'bold' }}>
                  Reading Preferences
                </Typography>
              </Box>

              {/* Reading Goal */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Reading Goal (books per year): {formData.readingGoal}
                </Typography>
                <Slider
                  value={formData.readingGoal}
                  onChange={(_, value) => handleInputChange('readingGoal', value)}
                  min={1}
                  max={100}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 12, label: '12' },
                    { value: 24, label: '24' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' }
                  ]}
                  valueLabelDisplay="auto"
                  sx={{ color: '#D4A574' }}
                />
              </Box>

              {/* Favorite Genres */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Favorite Genres
                </Typography>
                
                {/* Add New Genre */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    label="Add Genre"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddGenre()}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddGenre}
                    disabled={!newGenre.trim()}
                    sx={{ borderColor: '#D4A574', color: '#5D4037' }}
                  >
                    Add
                  </Button>
                </Box>

                {/* Current Genres */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.favoriteGenres.map((genre, index) => (
                    <Chip
                      key={index}
                      label={genre}
                      onDelete={() => handleRemoveGenre(genre)}
                      sx={{ 
                        bgcolor: '#D4A574', 
                        color: 'white',
                        '& .MuiChip-deleteIcon': { color: 'white' }
                      }}
                    />
                  ))}
                </Box>

                {/* Genre Suggestions */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Popular genres:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {commonGenres
                      .filter(genre => !formData.favoriteGenres.includes(genre))
                      .slice(0, 10)
                      .map((genre) => (
                        <Chip
                          key={genre}
                          label={genre}
                          size="small"
                          variant="outlined"
                          onClick={() => handleAddGenre()}
                          sx={{ 
                            borderColor: '#D4A574', 
                            color: '#5D4037',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#D4A574', color: 'white' }
                          }}
                        />
                      ))}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Security sx={{ mr: 1, color: '#D4A574' }} />
                <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 'bold' }}>
                  Privacy Settings
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublic}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#D4A574',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#D4A574',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">
                      Public Profile
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.isPublic 
                        ? 'Your profile is visible to everyone' 
                        : 'Your profile is private and only visible to you'
                      }
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handleCancel}
          disabled={saving}
          sx={{ 
            borderColor: '#8D6E63', 
            color: '#8D6E63',
            px: 4,
            py: 1.5
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          sx={{ 
            bgcolor: '#D4A574', 
            color: 'white',
            px: 4,
            py: 1.5,
            '&:hover': { bgcolor: '#B8956B' },
            '&:disabled': { bgcolor: '#ccc' }
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Container>
  );
};

export default Settings;
