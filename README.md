# 📚 Moops Bookstore

A modern social book tracking platform built with React, Node.js, and MongoDB.

## ✨ Features

- **User Management**: Secure authentication and user profiles
- **Book Tracking**: Add, review, and track your reading progress
- **Social Features**: Follow other readers and discover new books
- **Admin Panel**: Comprehensive user and content management
- **Responsive Design**: Beautiful UI that works on all devices

## 🚀 Live Demo

- **Frontend**: [https://whoisaldo.github.io/MoopBookstore](https://whoisaldo.github.io/MoopBookstore)
- **Backend API**: [https://moops-bookstore-api-064ad9bcc3f1.herokuapp.com](https://moops-bookstore-api-064ad9bcc3f1.herokuapp.com)

## 🛠️ Tech Stack

### Frontend
- React 19 with TypeScript
- Material-UI (MUI) for components
- React Router for navigation
- Axios for API communication

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- CORS enabled for production

### Deployment
- Frontend: GitHub Pages
- Backend: Heroku
- Database: MongoDB Atlas

## 📱 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Heroku account (for backend deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/whoisaldo/MoopBookstore.git
   cd MoopBookstore
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   - Create `.env` files in both root and client directories
   - Set your MongoDB connection string and JWT secret

4. **Run development server**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build production frontend
- `npm run start` - Start production backend
- `npm run deploy:frontend` - Deploy to GitHub Pages
- `npm run deploy:backend` - Deploy to Heroku
- `npm run deploy:all` - Deploy both frontend and backend

## 📁 Project Structure

```
MoopsBookstore/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
└── scripts/               # Utility scripts
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration for production
- Input validation and sanitization
- Secure environment variable handling

## 📊 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/books` - Fetch books
- `POST /api/reviews` - Create book reviews
- `GET /api/admin/users` - Admin user management
- `GET /api/health` - API health check

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions, please open an issue on GitHub.

---

**Built with ❤️ for book lovers everywhere**