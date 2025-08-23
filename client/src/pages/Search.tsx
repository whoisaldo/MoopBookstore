import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  TextField,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Tabs,
  Tab,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
} from '@mui/material';
import Grid from '../components/CustomGrid';
import { Search as SearchIcon } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBooks, Book } from '../contexts/BookContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';

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
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchBooks, loading, error } = useBooks();
  const { user } = useAuth();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Add book dialog state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addingBook, setAddingBook] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    readStatus: 'want-to-read' as 'want-to-read' | 'currently-reading' | 'read',
    reviewText: '',
  });

  // Add debounce ref to prevent rapid successive searches
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    if (!queryToSearch.trim()) return;

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the search to prevent rapid successive calls
    searchTimeoutRef.current = setTimeout(async () => {
      setHasSearched(true);
      console.log('🔍 Frontend: Starting search for:', queryToSearch.trim());
      
      const results = await searchBooks(queryToSearch.trim());
      console.log('📚 Frontend: Search results received:', results);
      
      // Handle null results gracefully
      if (results) {
        setSearchResults(results);
      } else {
        setSearchResults({
          localBooks: [],
          googleBooks: [],
          totalLocal: 0,
          totalGoogle: 0
        });
      }
      
      // Update URL
      setSearchParams({ q: queryToSearch.trim() });
    }, 500); // 500ms debounce delay
  }, [query, searchBooks, setSearchParams]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q.trim() && q !== query) {
      setQuery(q);
      // Only search if the query is different from current state
      if (!hasSearched || q !== query) {
        handleSearch(q);
      }
    }
  }, [searchParams]); // Remove handleSearch from dependencies to prevent infinite loop

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSearch();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddBook = (book: Book) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedBook(book);
    setDialogOpen(true);
  };

  const handleAddToLibrary = async () => {
    if (!selectedBook || !user) return;

    setAddingBook(true);
    try {
      console.log('📚 Adding book to library...', selectedBook.title);
      console.log('🌐 API Client base URL:', apiClient.defaults.baseURL);
      
      // First, add the book to the database with all required fields
      const bookData = {
        googleBooksId: selectedBook.googleBooksId,
        title: selectedBook.title,
        author: selectedBook.author,
        isbn: selectedBook.isbn,
        description: selectedBook.description,
        coverImage: selectedBook.coverImage,
        publishedDate: selectedBook.publishedDate,
        pageCount: selectedBook.pageCount,
        categories: selectedBook.categories,
        language: selectedBook.language,
        averageRating: selectedBook.averageRating,
        ratingsCount: selectedBook.ratingsCount
      };
      
      const bookResponse = await apiClient.post('/books', bookData);
      const addedBook = bookResponse.data;
      console.log('✅ Book added:', addedBook._id, addedBook.title);

      // Then create a review/library entry with the form data
      const reviewData = {
        bookId: addedBook._id,
        rating: reviewForm.rating,
        readStatus: reviewForm.readStatus,
        reviewText: reviewForm.reviewText || '',
        isPublic: true,
      };

      console.log('📝 Adding review with data:', reviewData);
      const reviewResponse = await apiClient.post('/reviews', reviewData);
      console.log('✅ Review added:', reviewResponse.data._id);
      
      alert('Book and review added to your library successfully!');
      setDialogOpen(false);
      setSelectedBook(null);
      
      // Reset form
      setReviewForm({
        rating: 0,
        reviewText: '',
        readStatus: 'want-to-read'
      });
      
      // Navigate to the book detail page
      navigate(`/book/${addedBook._id}`);
    } catch (error: any) {
      console.error('❌ Error adding book to library:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Request URL:', error.config?.url);
      console.error('Base URL:', error.config?.baseURL);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add book to library';
      alert(`Failed to add book to library: ${errorMessage}\n\nCheck console for details.`);
    } finally {
      setAddingBook(false);
    }
  };

  const BookCard: React.FC<{ book: Book; isLocal?: boolean }> = ({ book, isLocal = false }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
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
        <Typography gutterBottom variant="h6" >
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          by {book.author}
        </Typography>
        {book.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {book.description.length > 100 
              ? `${book.description.substring(0, 100)}...` 
              : book.description
            }
          </Typography>
        )}
        {book.genres && book.genres.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {book.genres.slice(0, 2).map((genre, index) => (
              <Chip 
                key={index}
                label={genre} 
                size="small" 
                variant="outlined" 
              />
            ))}
          </Box>
        )}
        {book.publishedDate && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Published: {new Date(book.publishedDate).getFullYear()}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        {isLocal ? (
          <Button 
            size="small" 
            onClick={() => navigate(`/book/${book._id}`)}
            fullWidth
          >
            View Details
          </Button>
        ) : (
          <Button 
            size="small" 
            onClick={() => handleAddBook(book)}
            fullWidth
            disabled={!user}
          >
            {!user ? 'Login to Add' : 'Add to Library'}
          </Button>
        )}
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Books
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Search for books, authors, or ISBN"
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              endAdornment: <SearchIcon />,
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !query.trim()}
            sx={{ minWidth: '120px' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {hasSearched && searchResults && (
        <Box>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab 
              label={`Our Library (${searchResults.localBooks?.length || 0})`} 
              id="search-tab-0"
              aria-controls="search-tabpanel-0"
            />
            <Tab 
              label={`Google Books (${searchResults.googleBooks?.length || 0})`} 
              id="search-tab-1"
              aria-controls="search-tabpanel-1"
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {searchResults.localBooks && searchResults.localBooks.length > 0 ? (
              <Grid container spacing={3}>
                {searchResults.localBooks.map((book: Book) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={book._id} >
                    <BookCard book={book} isLocal />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No books found in our library
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try checking the Google Books tab for more results
                </Typography>
              </Paper>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {searchResults.googleBooks && searchResults.googleBooks.length > 0 ? (
              <Grid container spacing={3}>
                {searchResults.googleBooks.map((book: Book, index: number) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={book.googleBooksId || index} >
                    <BookCard book={book} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No books found on Google Books
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try a different search term
                </Typography>
              </Paper>
            )}
          </TabPanel>
        </Box>
      )}

      {hasSearched && !searchResults && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No results found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try different keywords or check your spelling
          </Typography>
        </Paper>
      )}

      {!hasSearched && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Discover Your Next Great Read
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Search for books by title, author, or ISBN to get started
          </Typography>
        </Paper>
      )}

      {/* Add Book Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add "{selectedBook?.title}" to Your Library
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
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
            
            <Box sx={{ mb: 3 }}>
              <Typography component="legend" gutterBottom>
                Rating
              </Typography>
              <Rating
                value={reviewForm.rating}
                onChange={(event, newValue) => {
                  setReviewForm(prev => ({ ...prev, rating: newValue || 0 }));
                }}
              />
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Review (Optional)"
              placeholder="Share your thoughts about this book..."
              value={reviewForm.reviewText}
              onChange={(e) => setReviewForm(prev => ({ 
                ...prev, 
                reviewText: e.target.value 
              }))}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={addingBook}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddToLibrary} 
            variant="contained" 
            disabled={addingBook}
          >
            {addingBook ? <CircularProgress size={24} /> : 'Add to Library'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Search;
