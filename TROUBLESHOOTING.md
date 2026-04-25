# Remindly - Troubleshooting & Advanced Guide

Complete troubleshooting guide and advanced features documentation.

## 🔧 Troubleshooting Guide

### Backend Issues

#### "MongoDB Connection Error"

**Error Message:**
```
MongooseError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

1. **Check if MongoDB is running**
   ```bash
   # Windows - Check Task Manager or MongoDB service
   # Mac
   brew services list | grep mongodb
   
   # Linux
   sudo systemctl status mongod
   ```

2. **Start MongoDB if stopped**
   ```bash
   # Mac
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows - Use Services app or:
   mongod
   ```

3. **Check connection string in .env**
   ```
   # Local MongoDB
   MONGODB_URI=mongodb://localhost:27017/remindly
   
   # MongoDB Atlas (cloud)
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/remindly
   ```

4. **Verify MongoDB is accessible**
   ```bash
   mongosh
   # If this works, MongoDB is running
   ```

---

#### "Port 5000 Already in Use"

**Error Message:**
```
Error: listen EADDRINUSE :::5000
```

**Solutions:**

1. **Change port in .env**
   ```
   PORT=5001
   ```

2. **Or kill process using port 5000**
   ```bash
   # Mac/Linux
   lsof -i :5000
   kill -9 <PID>
   
   # Windows (PowerShell as Admin)
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess
   Stop-Process -Id <PID> -Force
   ```

---

#### "GEMINI_API_KEY is Required"

**Error Message:**
```
Error: GEMINI_API_KEY is not configured
```

**Solutions:**

1. **Get API key from Google**
   - Go to https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key

2. **Add to .env file**
   ```
   GEMINI_API_KEY=AIzaSyD...your-key...
   ```

3. **Verify API key format**
   - Should start with "AIzaSy"
   - No spaces or extra characters

4. **Restart backend**
   ```bash
   npm start
   ```

---

#### "JWT_SECRET Error"

**Error Message:**
```
Error: JWT_SECRET is not configured
```

**Solutions:**

1. **Add to .env file**
   ```
   JWT_SECRET=your-super-secret-key-here-change-in-production
   ```

2. **Use a strong secret**
   ```bash
   # Generate random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Restart backend**

---

### Frontend Issues

#### "Blank Screen / Nothing Loads"

**Checklist:**

1. **Check browser console for errors**
   - Press F12
   - Go to Console tab
   - Look for red errors

2. **Verify backend is running**
   ```bash
   curl http://localhost:5000/health
   # Should return: {"status":"Server is running"}
   ```

3. **Check frontend is on correct port**
   - Should be http://localhost:5173
   - Not 5000 or any other port

4. **Clear cache and refresh**
   - Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear all
   - Refresh page

5. **Check network tab**
   - F12 → Network tab
   - Refresh page
   - Look for failed requests
   - Red = error

---

#### "API Calls Failing"

**Error in Console:**
```
Failed to fetch...
```

**Solutions:**

1. **Verify backend is running**
   ```bash
   # In backend folder
   npm start
   ```

2. **Check CORS configuration**
   - Backend .env should have:
   ```
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Verify API URL**
   - Frontend should call: `http://localhost:5000/api`
   - Check `frontend/src/services/api.js`

4. **Check Network tab**
   - F12 → Network
   - Look at request headers
   - Should include: `Authorization: Bearer token`

5. **Test with cURL**
   ```bash
   curl http://localhost:5000/health
   ```

---

#### "Can't Sign Up or Sign In"

**Solutions:**

1. **Check form validation**
   - Email must be valid format
   - Password must not be empty
   - Name must not be empty

2. **Check MongoDB is connected**
   - Look at backend console
   - Should show: "Connected to MongoDB"

3. **Check network request**
   - F12 → Network tab
   - Click signin/signup button
   - Check request/response in Network tab

4. **Look for error messages**
   - Frontend shows error message on page
   - Backend logs show details

---

#### "Token Expires Immediately"

**Solutions:**

1. **Check JWT_SECRET consistency**
   - Backend must have same secret
   - If you change it, all tokens invalidate

2. **Check system time**
   - System clock should be accurate
   - If time is wrong, JWT validation fails

3. **Verify token is saved**
   - Open DevTools
   - Application tab
   - LocalStorage
   - Should have 'token' key

---

### API Issues

#### "Quiz Generation Fails"

**Solutions:**

1. **Check Gemini API key**
   - Verify it's in .env
   - Should start with AIzaSy

2. **Check API quota**
   - Go to Google Cloud Console
   - Check billing and quotas
   - May have hit daily limit

3. **Check error message**
   - Look at backend console
   - May show Gemini API error

4. **Test Gemini API directly**
   ```bash
   curl -X POST \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
   ```

---

#### "Evaluation Scoring Not Working"

**Solutions:**

1. **Check minimum word count**
   - User explanation should be at least 20 words

2. **Check Gemini API response**
   - Backend logs should show response
   - May need to adjust prompt

3. **Verify JSON parsing**
   - Gemini may return markdown code blocks
   - Backend should clean them

---

## 🚀 Advanced Features

### Custom Quiz Difficulty

Frontend allows selection during quiz:

```javascript
// In TopicDetail.jsx
const difficulty = 'easy' | 'medium' | 'hard';
```

Backend adjusts:
- Question complexity
- Point multiplier
- Adaptive algorithm

---

### Spaced Repetition Customization

Edit `backend/utils/revisionLogic.js`:

```javascript
// Change revision intervals (currently Day 1, 7, 30)
const intervals = [1, 7, 30]; // in days

// Change memory decay rate (currently 5%)
const decayRate = 0.05;

// Change minimum memory strength (currently 10%)
const minMemory = 0.10;
```

---

### AI Prompts Customization

Edit `backend/controllers/aiController.js`:

```javascript
// Quiz generation prompt
const quizPrompt = `Generate 5 multiple choice questions...`;

// Evaluation prompt
const evalPrompt = `Evaluate the user's understanding...`;

// Adaptive quiz prompt
const adaptivePrompt = `Generate 15 questions with 5 easy...`;
```

---

### Points System Customization

Edit `backend/controllers/quizController.js`:

```javascript
// Change base points
const basePoints = 10;

// Change difficulty multipliers
const multipliers = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0
};

// Change adaptive adjustment
const adaptiveBoost = 0.1;
```

---

## 📱 Mobile Optimization

### Current Responsive Features

✅ Mobile-first CSS
✅ Touch-friendly buttons
✅ Responsive grid layouts
✅ Mobile menu support (ready for expansion)

### Tips for Mobile Testing

```bash
# Chrome DevTools
# F12 → Device Toolbar (Ctrl+Shift+M)
# Select device type
```

---

## 🔒 Security Best Practices

### For Development

1. **Never commit .env file**
   ```
   # .gitignore
   .env
   node_modules/
   ```

2. **Use strong JWT secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Rotate API keys regularly**
   - Delete old keys
   - Generate new ones
   - Update .env

---

### For Production

1. **Use environment-specific configs**
   ```
   .env.development
   .env.production
   ```

2. **Enable HTTPS**
   - Use SSL certificates
   - Redirect HTTP to HTTPS

3. **Rate limiting**
   - Implement IP-based limits
   - Prevent brute force attacks

4. **Database backups**
   - Schedule regular backups
   - Test restore process

5. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor API response times
   - Alert on failures

---

## 📊 Performance Optimization

### Frontend

1. **Code splitting**
   ```javascript
   // Use React.lazy for route-based splitting
   const Dashboard = React.lazy(() => import('./pages/Dashboard'));
   ```

2. **Memoization**
   ```javascript
   // Use React.memo for expensive components
   export const TopicCard = React.memo(({ topic }) => {...});
   ```

3. **Image optimization**
   - Use WebP format
   - Lazy load images

---

### Backend

1. **Database indexing**
   ```javascript
   // In Topic.js model
   topicSchema.index({ userId: 1, status: 1 });
   topicSchema.index({ nextRevisionDate: 1 });
   ```

2. **Query optimization**
   - Use projection to select specific fields
   - Avoid N+1 queries
   - Use aggregation pipeline

3. **Caching**
   - Cache leaderboard (refreshed hourly)
   - Cache static data
   - Use Redis for session storage (future)

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication**
- [ ] Sign up with new email
- [ ] Sign in with correct credentials
- [ ] Sign in with wrong password (error)
- [ ] Sign up with existing email (error)
- [ ] Token persists on refresh
- [ ] Logout clears token

**Topics**
- [ ] Create topic with valid explanation
- [ ] Create topic with <50 words (error)
- [ ] Create topic with >100 words (error)
- [ ] Update topic fields
- [ ] Delete topic
- [ ] Topics show correct status

**Revision**
- [ ] Write explanation
- [ ] Get AI evaluation
- [ ] Score displayed correctly
- [ ] Quiz unlocks if score ≥ 6
- [ ] Next revision date updated

**Quiz**
- [ ] Quiz questions display
- [ ] Options are clickable
- [ ] Submit button works
- [ ] Score calculated correctly
- [ ] Points awarded correctly
- [ ] Difficulty affects multiplier

**Leaderboard**
- [ ] Top 50 users displayed
- [ ] Ranked by points
- [ ] Streak shown
- [ ] Updates after quiz

---

### Automated Testing (Future)

```bash
# Backend tests
npm test -- backend/

# Frontend tests
npm test -- frontend/

# Integration tests
npm test -- integration/
```

---

## 📈 Monitoring & Analytics

### Key Metrics to Track

1. **User Engagement**
   - Active users per day
   - Topics created per user
   - Quiz attempts per topic

2. **Performance**
   - API response times
   - Database query times
   - Frontend load time

3. **Quality**
   - Quiz answer accuracy
   - User explanation quality
   - System uptime

---

## 🔄 Backup & Recovery

### Database Backup

```bash
# Backup MongoDB
mongodump --out ./backup

# Restore MongoDB
mongorestore ./backup
```

### Version Control

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/user/remindly
git push -u origin main
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All env variables configured
- [ ] MongoDB backup created
- [ ] Frontend build tested locally
- [ ] API endpoints tested
- [ ] Error handling verified
- [ ] Security review completed

### Deployment Steps

1. **Backend Deployment** (Heroku example)
   ```bash
   heroku create remindly-api
   heroku config:set JWT_SECRET=xxx GEMINI_API_KEY=xxx
   git push heroku main
   ```

2. **Frontend Deployment** (Vercel example)
   ```bash
   vercel
   ```

3. **Update API URL**
   - Frontend needs production API URL
   - Update in api.js

---

## 📚 Learning Resources

### Backend
- Express.js: https://expressjs.com/
- MongoDB: https://docs.mongodb.com/
- JWT: https://jwt.io/
- Mongoose: https://mongoosejs.com/

### Frontend
- React: https://react.dev/
- Vite: https://vitejs.dev/
- React Router: https://reactrouter.com/

### AI
- Google Gemini: https://ai.google.dev/
- Prompt Engineering: https://platform.openai.com/docs/guides/prompt-engineering

---

## 🤝 Contributing

To improve the project:

1. **Create a feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes**
   - Follow existing code style
   - Write clear commits
   - Add comments for complex logic

3. **Test thoroughly**
   - Manual testing
   - Check for bugs
   - Verify responsiveness

4. **Submit pull request**
   - Clear description
   - Reference issues
   - Include screenshots

---

## 📞 Support & Help

### Getting Help

1. **Check documentation**
   - README.md
   - QUICKSTART.md
   - API_REFERENCE.md
   - This file

2. **Check browser console**
   - F12 → Console tab
   - Look for error messages

3. **Check backend logs**
   - Terminal where backend is running
   - May show database or API errors

4. **Test with cURL**
   - Isolate API issues
   - Verify backend independently

---

## 🎯 FAQ

**Q: How often are topics revised?**
A: Day 1, Day 7, and Day 30. Adjustable in revisionLogic.js

**Q: What if I miss a revision?**
A: Topic becomes "overdue" but can still be revised. Streak resets.

**Q: How are points calculated?**
A: 10 × (score/total) × difficulty_multiplier

**Q: Can I change the revision schedule?**
A: Yes, edit `backend/utils/revisionLogic.js`

**Q: How do I get more AI quiz questions?**
A: Each topic generates fresh questions. No limit.

**Q: Can multiple users use same MongoDB database?**
A: Yes, users are isolated by userId

**Q: How do I backup my data?**
A: Use mongodump or export from MongoDB Atlas

**Q: Can I deploy to production?**
A: Yes, see Deployment Checklist section

---

## 🐛 Known Limitations

- No real-time notifications
- No offline support yet
- No image upload for topics
- Limited to Gemini AI (can add other providers)
- No social features yet
- No advanced scheduling
- Basic mobile view (no native app)

---

## 🎉 Congratulations!

You now have a complete, production-ready learning application. Enjoy using Remindly! 📚✨
