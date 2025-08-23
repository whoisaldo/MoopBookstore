import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Grid from '../components/CustomGrid';
import MoopsLogo from '../components/MoopsLogo';
import {
  Book,
  Search,
  Group,
  TrendingUp,
  ArrowForward,
  Star,
  LibraryBooks,
  PersonAdd
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <Search sx={{ fontSize: 40, color: '#D4A574' }} />,
      title: 'Discover Books',
      description: 'Search through millions of books from Google Books API and our curated library'
    },
    {
      icon: <LibraryBooks sx={{ fontSize: 40, color: '#B8956B' }} />,
      title: 'Personal Library',
      description: 'Build your own digital library with books you love and want to read'
    },
    {
      icon: <Group sx={{ fontSize: 40, color: '#E8C4A0' }} />,
      title: 'Community',
      description: 'Share reviews, ratings, and reading lists with other book lovers'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#FF8A65' }} />,
      title: 'Track Progress',
      description: 'Monitor your reading journey with detailed progress tracking'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      rating: 5,
      text: 'Found so many amazing books I never knew existed!'
    },
    {
      name: 'Alex K.',
      rating: 5,
      text: 'Perfect for organizing my reading list and discovering new authors.'
    },
    {
      name: 'Maria L.',
      rating: 5,
      text: 'The community features make reading so much more social and fun!'
    }
  ];

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFF8DC' }}>
      {/* Hero Section */}
             <Box
         sx={{
           background: 'linear-gradient(135deg, #D4A574 0%, #B8956B 100%)',
           color: 'white',
           py: { xs: 8, md: 12 },
           position: 'relative',
           overflow: 'hidden'
         }}
       >
                 <Container maxWidth="lg">
           <Grid container spacing={4} alignItems="center">
             <Grid item xs={12} md={6}>
               {/* Pompompurin Logo with Animation */}
               <Box sx={{ textAlign: 'center', mb: 4 }}>
                 <Box
                   sx={{
                     '& img': {
                       width: { xs: 120, md: 160 },
                       height: { xs: 120, md: 160 },
                       filter: 'drop-shadow(0 12px 24px rgba(212, 165, 116, 0.5))',
                       animation: 'pompompurinBounce 4s ease-in-out infinite',
                     },
                     '@keyframes pompompurinBounce': {
                       '0%, 100%': { 
                         transform: 'translateY(0px) scale(1) rotate(0deg)',
                         filter: 'drop-shadow(0 12px 24px rgba(212, 165, 116, 0.5))'
                       },
                       '25%': { 
                         transform: 'translateY(-15px) scale(1.05) rotate(2deg)',
                         filter: 'drop-shadow(0 20px 30px rgba(212, 165, 116, 0.7))'
                       },
                       '50%': { 
                         transform: 'translateY(-8px) scale(1.02) rotate(-1deg)',
                         filter: 'drop-shadow(0 15px 25px rgba(212, 165, 116, 0.6))'
                       },
                       '75%': { 
                         transform: 'translateY(-12px) scale(1.03) rotate(1deg)',
                         filter: 'drop-shadow(0 18px 28px rgba(212, 165, 116, 0.65))'
                       }
                     },
                   }}
                 >
                   <MoopsLogo size="large" showText={false} />
                 </Box>
               </Box>
               
               <Typography
                 variant={isMobile ? 'h3' : 'h2'}
                 component="h1"
                 gutterBottom
                 sx={{ fontWeight: 'bold', mb: 3 }}
               >
                 Discover Your Next Great Read
               </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}
              >
                Join thousands of book lovers who use MoopsBookstore to discover, 
                organize, and share their reading journey. Access millions of books 
                and build your personal digital library.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mb: 4 }}
              >
                                 <Button
                   variant="contained"
                   size="large"
                   onClick={handleGetStarted}
                   startIcon={<PersonAdd />}
                   sx={{
                     bgcolor: 'white',
                     color: '#5D4037',
                     px: 4,
                     py: 1.5,
                     fontSize: '1.1rem',
                     fontWeight: 'bold',
                     '&:hover': {
                       bgcolor: '#f5f5f5',
                       transform: 'translateY(-2px)',
                       boxShadow: 4
                     },
                     transition: 'all 0.3s ease'
                   }}
                 >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleSignIn}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Sign In
                </Button>
              </Stack>
              
            </Grid>
                                                   <Grid item xs={12} md={6}>
                {/* Right side content can be added here later if needed */}
              </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
                 <Box sx={{ textAlign: 'center', mb: 6 }}>
           <Box
             sx={{
               display: 'inline-block',
               mb: 2,
               '& img': {
                 width: 60,
                 height: 60,
                 filter: 'drop-shadow(0 4px 8px rgba(212, 165, 116, 0.3))',
                 animation: 'pompompurinGentle 5s ease-in-out infinite',
               },
               '@keyframes pompompurinGentle': {
                 '0%, 100%': { 
                   transform: 'scale(1) rotate(0deg)',
                 },
                 '50%': { 
                   transform: 'scale(1.1) rotate(3deg)',
                 }
               },
             }}
           >
             <MoopsLogo size="small" showText={false} />
           </Box>
           <Typography
             variant="h3"
             component="h2"
             gutterBottom
             sx={{ color: '#5D4037', fontWeight: 'bold' }}
           >
             Why Choose MoopsBookstore?
           </Typography>
         </Box>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                                 <Typography
                   variant="h6"
                   component="h3"
                   gutterBottom
                   sx={{ color: '#5D4037', fontWeight: 'bold' }}
                 >
                   {feature.title}
                 </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: '#F5E6D3', py: 8 }}>
        <Container maxWidth="lg">
                     <Box sx={{ textAlign: 'center', mb: 6 }}>
             <Box
               sx={{
                 display: 'inline-block',
                 mb: 2,
                 '& img': {
                   width: 50,
                   height: 50,
                   filter: 'drop-shadow(0 3px 6px rgba(212, 165, 116, 0.25))',
                   animation: 'pompompurinWave 4s ease-in-out infinite',
                 },
                 '@keyframes pompompurinWave': {
                   '0%, 100%': { 
                     transform: 'rotate(0deg)',
                   },
                   '25%': { 
                     transform: 'rotate(8deg)',
                   },
                   '75%': { 
                     transform: 'rotate(-6deg)',
                   }
                 },
               }}
             >
               <MoopsLogo size="small" showText={false} />
             </Box>
             <Typography
               variant="h3"
               component="h2"
               gutterBottom
               sx={{ color: '#5D4037', fontWeight: 'bold' }}
             >
               What Our Readers Say
             </Typography>
           </Box>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    height: '100%',
                    bgcolor: 'white',
                    borderRadius: 3,
                    boxShadow: 2
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} sx={{ color: '#FFD700', fontSize: 20 }} />
                    ))}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ mb: 2, fontStyle: 'italic', lineHeight: 1.6 }}
                  >
                    "{testimonial.text}"
                  </Typography>
                                     <Typography
                     variant="subtitle1"
                     sx={{ color: '#5D4037', fontWeight: 'bold' }}
                   >
                     — {testimonial.name}
                   </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
                 <Paper
           sx={{
             p: 6,
             textAlign: 'center',
             bgcolor: '#D4A574',
             color: 'white',
             borderRadius: 3,
             position: 'relative',
             overflow: 'hidden'
           }}
         >
                     <Box sx={{ textAlign: 'center', mb: 4 }}>
             <Box
               sx={{
                 display: 'inline-block',
                 mb: 3,
                 '& img': {
                   width: 80,
                   height: 80,
                   filter: 'drop-shadow(0 6px 12px rgba(255, 255, 255, 0.3))',
                   animation: 'pompompurinCelebrate 3s ease-in-out infinite',
                 },
                 '@keyframes pompompurinCelebrate': {
                   '0%, 100%': { 
                     transform: 'scale(1) rotate(0deg)',
                   },
                   '25%': { 
                     transform: 'scale(1.2) rotate(15deg)',
                   },
                   '50%': { 
                     transform: 'scale(1.1) rotate(-10deg)',
                   },
                   '75%': { 
                     transform: 'scale(1.15) rotate(8deg)',
                   }
                 },
               }}
             >
               <MoopsLogo size="medium" showText={false} />
             </Box>
             <Typography
               variant="h3"
               component="h2"
               gutterBottom
               sx={{ fontWeight: 'bold', mb: 3 }}
             >
               Ready to Start Your Reading Journey?
             </Typography>
           </Box>
          <Typography
            variant="h6"
            sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}
          >
            Join our community of book lovers today and discover a world of 
            amazing stories waiting for you.
          </Typography>
                     <Button
             variant="contained"
             size="large"
             onClick={handleGetStarted}
             endIcon={<ArrowForward />}
             sx={{
               bgcolor: 'white',
               color: '#5D4037',
               px: 6,
               py: 2,
               fontSize: '1.2rem',
               fontWeight: 'bold',
               '&:hover': {
                 bgcolor: '#f5f5f5',
                 transform: 'translateY(-2px)',
                 boxShadow: 6
               },
               transition: 'all 0.3s ease'
             }}
           >
            Get Started Now
          </Button>
        </Paper>
      </Container>

             {/* Footer */}
       <Box sx={{ bgcolor: '#2F2F2F', color: 'white', py: 4, textAlign: 'center' }}>
         <Container maxWidth="lg">
           <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
             © 2025 MoopsBookstore. Made with ❤️ for book lovers everywhere.
           </Typography>
           <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
             Developed by <a href="https://github.com/whoisaldo" target="_blank" rel="noopener noreferrer" style={{ color: '#D4A574', textDecoration: 'none' }}>@aliyounes</a>
           </Typography>
           <Typography variant="body2" sx={{ opacity: 0.8 }}>
             For bugs contact: <a href="mailto:Aliyounes@eternalreverse.com" style={{ color: '#D4A574', textDecoration: 'none' }}>Aliyounes@eternalreverse.com</a>
           </Typography>
         </Container>
       </Box>
    </Box>
  );
};

export default LandingPage;
