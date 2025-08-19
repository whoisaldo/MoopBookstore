# Moops Bookstore 📚

A social book tracking platform where users can discover, track, and share their reading journey with fellow book lovers.

## Features

### 🔐 User Authentication
- User registration and login
- JWT-based authentication
- Profile management with customizable bio, avatar, and reading goals

### 📖 Book Management
- Search books using Google Books API
- Add books to personal library
- Track reading status (Want to Read, Currently Reading, Read)
- Rate and review books
- View detailed book information

### 👥 Social Features
- Follow/unfollow other users
- View public user profiles
- See what others are reading
- Browse reviews and ratings from the community
- Activity feeds from followed users

### 📊 Reading Analytics
- Personal reading statistics
- Reading goal tracking with progress visualization
- Reading history and timeline

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Google Books API** integration
- **Express Validator** for input validation

### Frontend
- **React** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MoopsBookstore
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   
   **Backend (.env)**
   ```bash
   cp env.example .env
   ```
   Edit `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/moops-bookstore
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   PORT=5000
   GOOGLE_BOOKS_API_KEY=your_google_books_api_key_here (optional)
   ```

   **Frontend**
   Create `client/.env`:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode (runs both backend and frontend)
   npm run dev

   # Or run separately:
   # Backend only
   npm run server

   # Frontend only (in another terminal)
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Books
- `GET /api/books/search` - Search books
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Add book to database
- `GET /api/books/trending/popular` - Get trending books
- `GET /api/books/recent/added` - Get recently added books

### Reviews
- `POST /api/reviews` - Create/update review
- `GET /api/reviews/user/:userId` - Get user reviews
- `GET /api/reviews/book/:bookId` - Get book reviews
- `POST /api/reviews/:reviewId/like` - Like/unlike review
- `DELETE /api/reviews/:reviewId` - Delete review

### Users
- `GET /api/users/:username` - Get user profile
- `GET /api/users` - Search users
- `POST /api/users/:userId/follow` - Follow/unfollow user
- `GET /api/users/:userId/followers` - Get user followers
- `GET /api/users/:userId/following` - Get user following

## Project Structure

```
MoopsBookstore/
├── server/                     # Backend
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── middleware/            # Express middleware
│   └── index.js              # Server entry point
├── client/                    # Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   └── App.tsx           # Main App component
│   └── public/               # Static files
├── package.json              # Backend dependencies
└── README.md                 # This file
```

## Database Schema

### User
- Username, email, password
- Display name, bio, avatar
- Reading goal, favorite genres
- Followers/following relationships

### Book
- Title, author, ISBN
- Description, publication info
- Cover image, genres
- Average rating and ratings count
- Google Books API integration

### Review
- User reference
- Book reference
- Rating (1-5 stars)
- Review text
- Reading status
- Start/finish dates
- Public/private visibility

### ReadingList
- User-created book collections
- Public/private lists
- Book organization and notes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Books API for book data
- Material-UI for the beautiful component library
- The open-source community for various packages used

---

Happy reading! 📖✨
