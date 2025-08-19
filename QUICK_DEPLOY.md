# ⚡ **Quick Deploy Reference - Moops Bookstore**

## 🚀 **TL;DR - Deploy in 5 Steps**

1. **MongoDB Atlas Setup** (5 min)
   ```bash
   # Get connection string from Atlas
   # Example: mongodb+srv://user:pass@cluster.net/moopsbookstore
   ```

2. **Heroku Backend** (3 min)
   ```bash
   heroku create your-moops-api
   heroku config:set MONGODB_URI="your-atlas-string"
   heroku config:set JWT_SECRET="super-secure-secret"
   git push heroku main
   ```

3. **GitHub Pages Frontend** (2 min)
   ```bash
   # Update client/env.production with your Heroku URL
   # Push to GitHub - auto-deploys via GitHub Actions
   git push origin main
   ```

4. **Update CORS** (1 min)
   ```bash
   heroku config:set FRONTEND_URL="https://yourusername.github.io/MoopsBookstore"
   ```

5. **Done!** ✨
   - Frontend: `https://yourusername.github.io/MoopsBookstore`
   - Backend: `https://your-moops-api.herokuapp.com`

---

## 🔧 **Essential Commands**

```bash
# Deploy everything
./scripts/deploy.sh

# Check Heroku status
heroku logs --tail
heroku ps

# Test deployment
curl https://your-moops-api.herokuapp.com/api/health

# Update environment
heroku config:set VARIABLE_NAME="value"
```

---

## 🆘 **Emergency Fixes**

| Problem | Solution |
|---------|----------|
| CORS errors | `heroku config:set FRONTEND_URL="https://yourusername.github.io/MoopsBookstore"` |
| Database connection | Check MongoDB Atlas whitelist (0.0.0.0/0) |
| Build fails | Check GitHub Actions tab for errors |
| Heroku crashes | `heroku restart` |

---

## 📊 **Free Tier Limits**

- **MongoDB Atlas:** 512MB storage, 100 connections
- **Heroku:** 550 dyno hours/month, sleeps after 30min idle
- **GitHub Pages:** 1GB storage, 100GB bandwidth/month

**Pro tip:** Heroku sleeps = first visit is slow. Consider upgrading to Hobby ($7/month) for always-on.

---

**Your deployment checklist is complete! 🎉**
