import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  Rating,
  Chip,
  Paper,
  Avatar,
} from '@mui/material';
import Grid from '../components/CustomGrid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooks, Book } from '../contexts/BookContext';
import MoopsLogo from '../components/MoopsLogo';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTrendingBooks, getRecentBooks } = useBooks();
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trending, recent] = await Promise.all([
          getTrendingBooks(),
          getRecentBooks()
        ]);
        setTrendingBooks(trending.slice(0, 8));
        setRecentBooks(recent.slice(0, 8));
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getTrendingBooks, getRecentBooks]);

  const BookCard: React.FC<{ book: Book }> = ({ book }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 3,
        backgroundColor: '#FFFAF0',
        border: '1px solid rgba(212, 165, 116, 0.2)',
        boxShadow: '0 4px 12px rgba(212, 165, 116, 0.15)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 12px 28px rgba(212, 165, 116, 0.25)',
          borderColor: '#D4A574',
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
                      image={book.coverImage || './MoopsBookstore.png'}
        alt={book.title}
        sx={{ objectFit: 'contain', p: 1 }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6"  noWrap>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          by {book.author}
        </Typography>
        {book.averageRating && book.averageRating > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Rating value={book.averageRating} readOnly size="small" />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({book.ratingsCount})
            </Typography>
          </Box>
        )}
        {book.genres && book.genres.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={book.genres[0]} 
              size="small" 
              variant="outlined" 
            />
          </Box>
        )}
      </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
          <Button 
            size="small" 
            onClick={() => navigate(`/book/${book._id}`)}
            fullWidth
            sx={{
              background: 'linear-gradient(45deg, #D4A574, #B8956B)',
              color: '#FFF8E7',
              fontFamily: '"Comic Neue", sans-serif',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              py: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(45deg, #C19660, #A68A5F)',
                transform: 'scale(1.05)',
              },
            }}
          >
            📖 View Details
          </Button>
        </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D5B7 50%, #D4A574 100%)',
          color: '#5D4037',
          mb: 4,
          p: 6,
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(212, 165, 116, 0.3)',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Cg fill-opacity=\'0.03\'%3E%3Cpath d=\'M0 0h20v20H0z\' fill=\'%23D4A574\'/%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.1,
          },
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 3 }}>
                <Box 
                  sx={{ 
                    '& img': {
                      width: { xs: 120, md: 160 }, // Much bigger logo!
                      height: { xs: 120, md: 160 },
                      filter: 'drop-shadow(0 12px 24px rgba(212, 165, 116, 0.5))',
                      animation: 'gentleBounce 4s ease-in-out infinite',
                    },
                    '@keyframes gentleBounce': {
                      '0%, 100%': { transform: 'translateY(0px) scale(1)' },
                      '50%': { transform: 'translateY(-8px) scale(1.02)' },
                    },
                  }}
                >
                  <MoopsLogo size="large" showText={false} />
                </Box>
                <Typography 
                  component="h1" 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 800,
                    background: 'linear-gradient(45deg, #3D2914, #5D4037, #8D6E63)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '2px 2px 4px rgba(255,255,255,0.8)',
                    fontFamily: '"Comic Neue", "Nunito", sans-serif',
                    fontSize: { xs: '2rem', md: '3rem' },
                  }}
                >
                  Welcome to Moops Bookstore
                </Typography>
              </Box>
              <Typography 
                variant="h5" 
                paragraph 
                sx={{ 
                  color: '#6D4C41', 
                  fontWeight: 500,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  fontFamily: '"Comic Neue", "Nunito", sans-serif',
                  textShadow: '1px 1px 2px rgba(255,255,255,0.7)',
                  lineHeight: 1.6,
                }}
              >
                🌟 Discover, track, and share your reading journey with fellow book lovers! 📚✨
              </Typography>
              {!user && (
                <Box sx={{ mt: 4, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    size="large" 
                    onClick={() => navigate('/register')}
                    sx={{ 
                      background: 'linear-gradient(45deg, #FFFFFF, #F5F5F5)',
                      color: '#5D4037',
                      fontFamily: '"Comic Neue", sans-serif',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      boxShadow: '0 6px 20px rgba(255, 255, 255, 0.8)',
                      border: '2px solid rgba(212, 165, 116, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #F5F5F5, #E8E8E8)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 10px 30px rgba(255, 255, 255, 0.9)',
                        border: '2px solid #D4A574',
                      },
                    }}
                  >
                    ✨ Get Started
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large" 
                    onClick={() => navigate('/search')}
                    sx={{ 
                      borderColor: '#FFFFFF',
                      color: '#FFFFFF',
                      fontFamily: '"Comic Neue", sans-serif',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      borderWidth: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#FFFFFF',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'translateY(-3px)',
                        borderWidth: 2,
                        boxShadow: '0 8px 25px rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    📚 Browse Books
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
          {user && (
            <Grid item xs={12} md={4} >
              <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <Avatar 
                  src={user.avatar} 
                  sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                >
                  {user.displayName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6">
                  Welcome back, {user.displayName}!
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/dashboard')}
                  sx={{ mt: 2, bgcolor: 'white', color: 'primary.main' }}
                >
                  Go to Dashboard
                </Button>
              </Box>
            </Grid>
          )}
                    </Grid>
      </Paper>

      {/* Trending Books */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{
            fontFamily: '"Comic Neue", "Nunito", sans-serif',
            fontWeight: 700,
            color: '#5D4037',
            textAlign: 'center',
            position: 'relative',
            pb: 2,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 80,
              height: 4,
              background: 'linear-gradient(45deg, #D4A574, #B8956B)',
              borderRadius: 2,
            },
          }}
        >
          🔥 Trending Books
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            fontFamily: '"Comic Neue", sans-serif',
            fontSize: '1.1rem',
          }}
        >
          ✨ Discover what's popular right now among book lovers! 📈
        </Typography>
        
        {trendingBooks.length > 0 ? (
          <Grid container spacing={3}>
            {trendingBooks.map((book) => (
              <Grid item xs={12} sm={6} md={3} key={book._id} >
                <BookCard book={book} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No trending books yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to add and review books!
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/search')}
            >
              Search Books
            </Button>
          </Paper>
        )}
      </Box>

      {/* Recent Books */}
      <Box>
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{
            fontFamily: '"Comic Neue", "Nunito", sans-serif',
            fontWeight: 700,
            color: '#5D4037',
            textAlign: 'center',
            position: 'relative',
            pb: 2,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 80,
              height: 4,
              background: 'linear-gradient(45deg, #D4A574, #B8956B)',
              borderRadius: 2,
            },
          }}
        >
          ✨ Recently Added
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            fontFamily: '"Comic Neue", sans-serif',
            fontSize: '1.1rem',
          }}
        >
          📚 Fresh additions to our magical library! 🌟
        </Typography>
        
        {recentBooks.length > 0 ? (
          <Grid container spacing={3}>
            {recentBooks.map((book) => (
              <Grid item xs={12} sm={6} md={3} key={book._id} >
                <BookCard book={book} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No books added yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Help us build our library!
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/search')}
            >
              Add Books
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Home;
