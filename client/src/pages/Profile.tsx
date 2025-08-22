import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Avatar,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import Grid from '../components/CustomGrid';
import {
  PersonAdd,
  PersonRemove,
  Settings,
  LibraryBooks,
  CalendarToday,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface UserProfile {
  _id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  favoriteGenres: string[];
  readingGoal: number;
  isPublic: boolean;
  followers: string[];
  following: string[];
  joinDate: string;
}

interface UserStats {
  read: number;
  currentlyReading: number;
  wantToRead: number;
  totalBooks: number;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  // getUserReviews is available from useBooks but not used in this component
  
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentReviews, setRecentReviews] = useState<any[]>([]); // Changed from Review[] to any[]
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        setError(null);
        setLoading(true);

        // Fetch user profile
        const profileResponse = await axios.get(`${API_URL}/users/${username}`);
        const { user: userData, stats, recentReviews: reviews } = profileResponse.data;
        
        setProfileUser(userData);
        setUserStats(stats);
        setRecentReviews(reviews);
        
        // Check if following (if logged in and not own profile)
        if (currentUser && !isOwnProfile) {
          setIsFollowing(currentUser.following.includes(userData._id));
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (!profileUser || !currentUser) return;

    try {
      const response = await axios.post(`${API_URL}/users/${profileUser._id}/follow`);
      setIsFollowing(response.data.following);
      
      // Update follower count in profile
      setProfileUser(prev => prev ? {
        ...prev,
        followers: response.data.following 
          ? [...prev.followers, currentUser._id]
          : prev.followers.filter(id => id !== currentUser._id)
      } : null);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading profile...</Typography>
      </Container>
    );
  }

  if (error || !profileUser) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Profile not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Info */}
        <Grid item xs={12} md={4} >
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={profileUser.avatar}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              >
                {profileUser.displayName.charAt(0).toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {profileUser.displayName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                @{profileUser.username}
              </Typography>

              {profileUser.bio && (
                <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                  {profileUser.bio}
                </Typography>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{profileUser.followers.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Followers
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{profileUser.following.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Following
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Joined {new Date(profileUser.joinDate).toLocaleDateString()}
                </Typography>
              </Box>

              {isOwnProfile ? (
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => navigate('/settings')}
                  fullWidth
                >
                  Edit Profile
                </Button>
              ) : currentUser ? (
                <Button
                  variant={isFollowing ? 'outlined' : 'contained'}
                  startIcon={isFollowing ? <PersonRemove /> : <PersonAdd />}
                  onClick={handleFollowToggle}
                  fullWidth
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              ) : null}

              {profileUser.favoriteGenres.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Favorite Genres
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {profileUser.favoriteGenres.map((genre, index) => (
                      <Chip key={index} label={genre} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Stats and Activity */}
        <Grid item xs={12} md={8} >
          {/* Reading Stats */}
          {userStats && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3} >
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" color="primary">
                      {userStats.read}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Read
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3} >
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" color="secondary">
                      {userStats.currentlyReading}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reading
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3} >
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" color="info.main">
                      {userStats.wantToRead}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Want to Read
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3} >
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" color="success.main">
                      {userStats.totalBooks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              
              {recentReviews.length > 0 ? (
                <List>
                  {recentReviews.map((review, index) => (
                    <React.Fragment key={review._id}>
                      <ListItem 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => navigate(`/book/${review.book._id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={review.book.coverImage}
                            variant="rounded"
                            sx={{ width: 48, height: 64 }}
                          >
                            <LibraryBooks />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={review.book.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                by {review.book.author}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Chip 
                                  label={review.readStatus.replace('-', ' ')}
                                  size="small"
                                  color={
                                    review.readStatus === 'read' ? 'success' :
                                    review.readStatus === 'currently-reading' ? 'primary' : 'default'
                                  }
                                />
                                {review.rating && (
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    Rating: {review.rating}/5
                                  </Typography>
                                )}
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(review.updatedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentReviews.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No recent activity
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
