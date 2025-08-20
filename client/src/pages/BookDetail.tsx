import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Rating,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import Grid from '../components/CustomGrid';
import {
  Add,
  Edit,
  CalendarToday,
  LibraryBooks,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooks, Book, Review } from '../contexts/BookContext';

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getBook, getBookReviews, addReview } = useBooks();
  
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    reviewText: '',
    readStatus: 'want-to-read' as 'want-to-read' | 'currently-reading' | 'read',
    startDate: '',
    finishDate: '',
  });

  useEffect(() => {
    if (!id) return;

    const fetchBookData = async () => {
      try {
        setError(null);
        setLoading(true);

        const [bookData, reviewsData] = await Promise.all([
          getBook(id),
          getBookReviews(id)
        ]);

        if (bookData) {
          setBook(bookData);
        } else {
          setError('Book not found');
        }

        setReviews(reviewsData);
        
        // Find user's review if logged in
        if (user && reviewsData) {
          const userReviewData = reviewsData.find(review => review.user._id === user._id);
          setUserReview(userReviewData || null);
        }
      } catch (error) {
        setError('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, [id, user, getBook, getBookReviews]);

  const handleReviewSubmit = async () => {
    if (!book || !user) return;

    try {
      const reviewData = {
        bookId: book._id,
        rating: reviewForm.rating,
        reviewText: reviewForm.reviewText,
        readStatus: reviewForm.readStatus,
        startDate: reviewForm.startDate || undefined,
        finishDate: reviewForm.finishDate || undefined,
      };

      const newReview = await addReview(reviewData);
      if (newReview) {
        setUserReview(newReview);
        setReviewDialogOpen(false);
        
        // Refresh reviews
        const updatedReviews = await getBookReviews(book._id!);
        setReviews(updatedReviews);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const openReviewDialog = () => {
    if (userReview) {
      // Edit existing review
      setReviewForm({
        rating: userReview.rating,
        reviewText: userReview.reviewText,
        readStatus: userReview.readStatus,
        startDate: userReview.startDate ? new Date(userReview.startDate).toISOString().split('T')[0] : '',
        finishDate: userReview.finishDate ? new Date(userReview.finishDate).toISOString().split('T')[0] : '',
      });
    } else {
      // New review
      setReviewForm({
        rating: 5,
        reviewText: '',
        readStatus: 'want-to-read',
        startDate: '',
        finishDate: '',
      });
    }
    setReviewDialogOpen(true);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading book details...</Typography>
      </Container>
    );
  }

  if (error || !book) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Book not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Book Info */}
        <Grid item xs={12} md={4} >
          <Card>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <img
                src={book.coverImage || '/placeholder-book.jpg'}
                alt={book.title}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: 400,
                  objectFit: 'contain'
                }}
              />
            </Box>
            <CardContent>
              {user && (
                <Button
                  variant={userReview ? 'outlined' : 'contained'}
                  startIcon={userReview ? <Edit /> : <Add />}
                  onClick={openReviewDialog}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {userReview ? 'Edit Review' : 'Add to Library'}
                </Button>
              )}

              {book.averageRating && book.averageRating > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={book.averageRating} readOnly precision={0.1} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {book.averageRating.toFixed(1)} ({book.ratingsCount} reviews)
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Details
                </Typography>
                {book.publishedDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Published: {new Date(book.publishedDate).getFullYear()}
                    </Typography>
                  </Box>
                )}
                {book.pageCount && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LibraryBooks fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {book.pageCount} pages
                    </Typography>
                  </Box>
                )}
                {book.publisher && (
                  <Typography variant="body2" color="text.secondary">
                    Publisher: {book.publisher}
                  </Typography>
                )}
                {book.isbn && (
                  <Typography variant="body2" color="text.secondary">
                    ISBN: {book.isbn}
                  </Typography>
                )}
              </Box>

              {book.genres && book.genres.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Genres
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {book.genres.map((genre, index) => (
                      <Chip key={index} label={genre} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Book Details and Reviews */}
        <Grid item xs={12} md={8} >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {book.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              by {book.author}
            </Typography>
            
            {book.description && (
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1">
                  {book.description}
                </Typography>
              </Paper>
            )}
          </Box>

          {/* User's Review */}
          {userReview && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="h6" gutterBottom>
                Your Review
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={userReview.rating} readOnly />
                <Chip 
                  label={userReview.readStatus.replace('-', ' ')}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>
              {userReview.reviewText && (
                <Typography variant="body1">
                  {userReview.reviewText}
                </Typography>
              )}
            </Paper>
          )}

          {/* Reviews */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reviews ({reviews.length})
            </Typography>
            
            {reviews.length > 0 ? (
              <List>
                {reviews.map((review, index) => (
                  <React.Fragment key={review._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar 
                          src={review.user.avatar}
                          onClick={() => navigate(`/profile/${review.user.username}`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          {review.user.displayName.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography
                              component="span"
                              variant="body1"
                              color="text.primary"
                              sx={{ cursor: 'pointer' }}
                              onClick={() => navigate(`/profile/${review.user.username}`)}
                            >
                              {review.user.displayName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Rating value={review.rating} readOnly size="small" />
                              <Typography variant="caption" sx={{ ml: 1 }}>
                                {new Date(review.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          review.reviewText && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {review.reviewText}
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                    {index < reviews.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No reviews yet. Be the first to review this book!
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {userReview ? 'Edit Review' : 'Add to Library'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} >
              <FormControl fullWidth>
                <InputLabel>Reading Status</InputLabel>
                <Select
                  value={reviewForm.readStatus}
                  onChange={(e) => setReviewForm(prev => ({ 
                    ...prev, 
                    readStatus: e.target.value as any 
                  }))}
                  label="Reading Status"
                >
                  <MenuItem value="want-to-read">Want to Read</MenuItem>
                  <MenuItem value="currently-reading">Currently Reading</MenuItem>
                  <MenuItem value="read">Read</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} >
              <Typography component="legend">Rating</Typography>
              <Rating
                value={reviewForm.rating}
                onChange={(event, newValue) => {
                  setReviewForm(prev => ({ ...prev, rating: newValue || 1 }));
                }}
              />
            </Grid>
            
            <Grid item xs={12} >
              <TextField
                fullWidth
                label="Review (optional)"
                multiline
                rows={4}
                value={reviewForm.reviewText}
                onChange={(e) => setReviewForm(prev => ({ 
                  ...prev, 
                  reviewText: e.target.value 
                }))}
              />
            </Grid>
            
            {reviewForm.readStatus === 'currently-reading' && (
              <Grid item xs={12} >
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={reviewForm.startDate}
                  onChange={(e) => setReviewForm(prev => ({ 
                    ...prev, 
                    startDate: e.target.value 
                  }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
            
            {reviewForm.readStatus === 'read' && (
              <Grid item xs={6} >
                <TextField
                  fullWidth
                  label="Finish Date"
                  type="date"
                  value={reviewForm.finishDate}
                  onChange={(e) => setReviewForm(prev => ({ 
                    ...prev, 
                    finishDate: e.target.value 
                  }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleReviewSubmit} variant="contained">
            {userReview ? 'Update' : 'Add'} Review
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookDetail;
