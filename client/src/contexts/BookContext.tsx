import React, { createContext, useContext, useState, ReactNode } from 'react';
import apiClient from '../utils/api';

export interface Book {
  _id?: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  publishedDate?: string;
  pageCount?: number;
  genres?: string[];
  categories?: string[];
  coverImage?: string;
  averageRating?: number;
  ratingsCount?: number;
  googleBooksId?: string;
  language?: string;
  publisher?: string;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  book: Book;
  rating: number;
  reviewText: string;
  readStatus: 'want-to-read' | 'currently-reading' | 'read';
  startDate?: string;
  finishDate?: string;
  isPublic: boolean;
  likes: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface BookContextType {
  searchBooks: (query: string) => Promise<any>;
  getBook: (id: string) => Promise<Book | null>;
  addReview: (reviewData: any) => Promise<Review | null>;
  getUserReviews: (userId: string, status?: string) => Promise<Review[]>;
  getBookReviews: (bookId: string) => Promise<Review[]>;
  likeReview: (reviewId: string) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  getTrendingBooks: () => Promise<Book[]>;
  getRecentBooks: () => Promise<Book[]>;
  loading: boolean;
  error: string | null;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBooks = async (query: string) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔍 Searching for:', query);
      const response = await apiClient.get(`/books/search`, {
        params: { q: query },
        timeout: 15000 // 15 second timeout
      });
      
      console.log('✅ Search response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Search error:', error);
      
      let message = 'Search failed';
      if (error.code === 'ECONNABORTED') {
        message = 'Search timed out. Please try again.';
      } else if (error.response?.status === 500) {
        message = 'Server error. Please try again in a moment.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      setError(message);
      
      // Return empty results instead of null to prevent UI issues
      return {
        localBooks: [],
        googleBooks: [],
        totalLocal: 0,
        totalGoogle: 0,
        error: message
      };
    } finally {
      setLoading(false);
    }
  };

  const getBook = async (id: string): Promise<Book | null> => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('📖 Fetching book:', id);
      const response = await apiClient.get(`/books/${id}`);
      console.log('✅ Book fetched:', response.data.book);
      return response.data.book;
    } catch (error: any) {
      console.error('❌ Error fetching book:', error);
      const message = error.response?.data?.message || 'Failed to get book';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (reviewData: any): Promise<Review | null> => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('📝 Adding review:', reviewData);
      const response = await apiClient.post(`/reviews`, reviewData);
      console.log('✅ Review added:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error adding review:', error);
      const message = error.response?.data?.message || 'Failed to add review';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserReviews = async (userId: string, status?: string): Promise<Review[]> => {
    try {
      setError(null);
      setLoading(true);
      
      const params: any = {};
      if (status) params.status = status;
      
      console.log('🔍 Fetching user reviews for:', userId, 'with status:', status);
      const response = await apiClient.get(`/reviews/user/${userId}`, { params });
      console.log('✅ User reviews response:', response.data);
      return response.data.reviews || [];
    } catch (error: any) {
      console.error('❌ Error fetching user reviews:', error);
      const message = error.response?.data?.message || 'Failed to get reviews';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getBookReviews = async (bookId: string): Promise<Review[]> => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiClient.get(`/reviews/book/${bookId}`);
      return response.data.reviews;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get book reviews';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const likeReview = async (reviewId: string): Promise<boolean> => {
    try {
      setError(null);
      
      await apiClient.post(`/reviews/${reviewId}/like`);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to like review';
      setError(message);
      return false;
    }
  };

  const deleteReview = async (reviewId: string): Promise<boolean> => {
    try {
      setError(null);
      
      await apiClient.delete(`/reviews/${reviewId}`);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete review';
      setError(message);
      return false;
    }
  };

  const getTrendingBooks = async (): Promise<Book[]> => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiClient.get(`/books/trending/popular`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get trending books';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getRecentBooks = async (): Promise<Book[]> => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiClient.get(`/books/recent/added`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get recent books';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const value: BookContextType = {
    searchBooks,
    getBook,
    addReview,
    getUserReviews,
    getBookReviews,
    likeReview,
    deleteReview,
    getTrendingBooks,
    getRecentBooks,
    loading,
    error,
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = (): BookContextType => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};
