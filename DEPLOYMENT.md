# Heroku Deployment Guide for Moops Bookstore

## Prerequisites
1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git**: Ensure git is installed and your project is in a git repository

## Deployment Steps

### 1. Initialize Git Repository (if not done)
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Login to Heroku
```bash
heroku login
```

### 3. Create Heroku App
```bash
heroku create your-app-name
# or just: heroku create (for auto-generated name)
```

### 4. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
```

### 5. Add MongoDB (Optional)
```bash
# Add free MongoDB addon (if you want persistent data)
heroku addons:create mongolab:sandbox
```

### 6. Deploy to Heroku
```bash
git push heroku main
# or if your main branch is 'master':
git push heroku master
```

### 7. Open Your App
```bash
heroku open
```

## Environment Variables

The app works with or without MongoDB. Set these in Heroku:

- `NODE_ENV=production` (required)
- `JWT_SECRET=your_secret_key` (required - auto-generated above)
- `MONGODB_URI=mongodb://...` (optional - provided by mongolab addon)

## App Features Without Database

Even without MongoDB, your app will have:
- ✅ **User Authentication** (mock users)
- ✅ **Book Search** (Google Books API)
- ✅ **Trending/Recent Books** (mock data)
- ✅ **Full UI Experience**

## App Features With Database

With MongoDB connected:
- ✅ **Persistent User Accounts**
- ✅ **Real Reviews and Ratings**
- ✅ **User Profiles and Following**
- ✅ **Personal Reading Lists**

## Scaling

For production use, consider upgrading to:
- **Heroku Standard Plan**: $25/month for better performance
- **MongoDB Atlas**: Dedicated database cluster
- **Custom Domain**: Add your own domain name

## Monitoring

View logs and monitor your app:
```bash
heroku logs --tail
heroku ps
heroku open
```

## Troubleshooting

1. **Build Fails**: Check `heroku logs` for errors
2. **App Won't Start**: Ensure `Procfile` exists and `package.json` has correct start script
3. **Database Issues**: App continues without MongoDB, check connection string

## Local Development

For local development:
```bash
npm run dev  # Runs both frontend and backend
```

## Frontend Environment

In production, the React frontend will be built and served by the Express server. For development, update `client/.env`:

```
REACT_APP_API_URL=https://your-app-name.herokuapp.com/api
```

## Cost Estimation

- **Free Tier**: $0/month (with 550 dyno hours limit)
- **Hobby Tier**: $7/month (24/7 uptime)
- **MongoDB**: $0/month (sandbox) or $9/month (shared cluster)

Total: **Free to $16/month** depending on your needs.
