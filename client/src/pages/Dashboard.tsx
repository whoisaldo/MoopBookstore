import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  Avatar,
  Button,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip,
} from '@mui/material';
import Grid from '../components/CustomGrid';
import {
  LibraryBooks,
  MenuBook,
  BookmarkAdd,
  Timeline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooks, Review } from '../contexts/BookContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserReviews } = useBooks();
  
  const [tabValue, setTabValue] = useState(0);
  const [readBooks, setReadBooks] = useState<Review[]>([]);
  const [currentlyReading, setCurrentlyReading] = useState<Review[]>([]);
  const [wantToRead, setWantToRead] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserReviews = async () => {
      try {
        const [read, reading, wantRead] = await Promise.all([
          getUserReviews(user._id, 'read'),
          getUserReviews(user._id, 'currently-reading'),
          getUserReviews(user._id, 'want-to-read'),
        ]);
        
        setReadBooks(read);
        setCurrentlyReading(reading);
        setWantToRead(wantRead);
      } catch (error) {
        console.error('Error fetching user reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [user, getUserReviews, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getReadingProgress = () => {
    if (!user?.readingGoal) return 0;
    return Math.min((readBooks.length / user.readingGoal) * 100, 100);
  };

  const BookList: React.FC<{ reviews: Review[]; emptyMessage: string }> = ({ 
    reviews, 
    emptyMessage 
  }) => (
    <>
      {reviews.length > 0 ? (
        <List>
          {reviews.map((review, index) => (
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
                    sx={{ width: 56, height: 80 }}
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
                      {review.rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Your rating: {review.rating}/5
                          </Typography>
                        </Box>
                      )}
                      {review.readStatus === 'currently-reading' && review.startDate && (
                        <Chip 
                          label={`Started ${new Date(review.startDate).toLocaleDateString()}`}
                          size="small"
                          color="primary"
                          sx={{ mt: 1 }}
                        />
                      )}
                      {review.readStatus === 'read' && review.finishDate && (
                        <Chip 
                          label={`Finished ${new Date(review.finishDate).toLocaleDateString()}`}
                          size="small"
                          color="success"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < reviews.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {emptyMessage}
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/search')}
          >
            Browse Books
          </Button>
        </Paper>
      )}
    </>
  );

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Loading your dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user.displayName}!
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LibraryBooks color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Books Read
                  </Typography>
                  <Typography variant="h5">
                    {readBooks.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3} >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MenuBook color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Currently Reading
                  </Typography>
                  <Typography variant="h5">
                    {currentlyReading.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3} >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BookmarkAdd color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Want to Read
                  </Typography>
                  <Typography variant="h5">
                    {wantToRead.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3} >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Timeline color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Reading Goal
                  </Typography>
                  <Typography variant="h5">
                    {readBooks.length}/{user.readingGoal || 12}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reading Goal Progress */}
      {user.readingGoal && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Reading Goal Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={getReadingProgress()} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(getReadingProgress())}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {readBooks.length} of {user.readingGoal} books completed this year
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Book Lists */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="book lists tabs"
            variant="fullWidth"
          >
            <Tab 
              label={`Currently Reading (${currentlyReading.length})`}
              id="dashboard-tab-0"
              aria-controls="dashboard-tabpanel-0"
            />
            <Tab 
              label={`Want to Read (${wantToRead.length})`}
              id="dashboard-tab-1"
              aria-controls="dashboard-tabpanel-1"
            />
            <Tab 
              label={`Read (${readBooks.length})`}
              id="dashboard-tab-2"
              aria-controls="dashboard-tabpanel-2"
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <BookList 
            reviews={currentlyReading} 
            emptyMessage="You're not currently reading any books"
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <BookList 
            reviews={wantToRead} 
            emptyMessage="No books in your want-to-read list yet"
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <BookList 
            reviews={readBooks} 
            emptyMessage="You haven't marked any books as read yet"
          />
        </TabPanel>
      </Card>
    </Container>
  );
};

export default Dashboard;
