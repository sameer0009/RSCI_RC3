# ⚡ Quick API Setup Reference

## ✅ Status: READY TO USE

Your platform is fully configured and running!

## 🚀 Access Points

| Service  | URL                      | Status |
|----------|--------------------------|--------|
| Frontend | http://localhost:3000    | ✅ Running |
| Backend  | http://localhost:5000    | ✅ Running |
| Database | localhost:5432           | ✅ Connected |
| Redis    | localhost:6379           | ✅ Connected |
| Judge0   | RapidAPI (Cloud)         | ✅ Configured |

## 🔑 API Configuration

```env
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="1a41d1f65cmsh19b328c1cec233fp1ee511jsn8e854a455160"
```

## 🎯 Quick Start

### 1. Open the Platform
```
http://localhost:3000
```

### 2. Register/Login
- Create an account or login
- Admin users can access `/admin`

### 3. Try a Problem
```
Problems → Select Problem → Write Code → Test Samples → Submit
```

## 💻 Supported Languages

✅ JavaScript | ✅ Python | ✅ Java | ✅ C++ | ✅ C | ✅ C# | ✅ Go | ✅ PHP

## 🎨 New Features

### Enhanced Scoring System
- **Point-Based**: Each test case has points
- **Practice Mode**: Test samples before submitting
- **Partial Credit**: Get points for passing some tests
- **Detailed Feedback**: See which categories passed/failed

### Three-Button Workflow
1. **Run** - Test with custom input
2. **Test Samples** - Practice with visible tests
3. **Submit** - Full evaluation with scoring

## 📊 Admin Features

### Test Case Management
```
Admin → Problems → [Select] → Manage Test Cases
```

- Add/Edit test cases
- Set point values
- Organize into groups
- Set visibility (SAMPLE/HIDDEN/STRESS)

## 🔧 Troubleshooting

### Backend Not Starting?
```bash
cd backend
npm run dev
```

### Frontend Not Starting?
```bash
cd frontend
npm run dev
```

### Database Issues?
```bash
docker-compose restart
cd backend
npx prisma migrate dev
```

### Judge0 Not Working?
Check `backend/.env` has correct API key

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `JUDGE0_API_SETUP.md` | Complete API guide |
| `QUICK_START_ENHANCED_SCORING.md` | Feature walkthrough |
| `docs/ENHANCED_SCORING_SYSTEM.md` | Full documentation |
| `docs/UI_ENHANCEMENTS.md` | UI changes guide |

## 🎓 Example Problem Flow

### User Perspective
```
1. Select "Two Sum" problem
2. Read description (see 3 sample tests, 30 points)
3. Write solution in Python
4. Click "Test Samples" → All pass! ✅
5. Click "Submit" → Evaluating...
6. Result: 85% (85/100 points)
   - Sample Tests: 30/30 ✅
   - Basic Tests: 30/30 ✅
   - Edge Cases: 25/30 ⚠️
   - Performance: 0/10 ❌ (TLE)
7. Optimize code
8. Resubmit → 100% Accepted! 🎉
```

### Admin Perspective
```
1. Create problem "Two Sum"
2. Add test cases:
   - 3 SAMPLE tests (10 pts each)
   - 5 HIDDEN tests (14 pts each)
3. Organize into groups:
   - Basic Tests (30 pts)
   - Edge Cases (30 pts)
   - Performance (10 pts)
4. Test with sample solution
5. Publish ✅
```

## 🚨 Important Notes

### API Limits
- Monitor RapidAPI usage
- Free tier has limits
- Consider local Judge0 for production

### Security
- API key is in `.env` (not committed)
- Never share API keys
- Rotate keys periodically

### Performance
- Default time limit: 2000ms
- Default memory: 256MB
- Adjust per problem as needed

## 🎯 Next Actions

### For Users
1. ✅ Platform is ready
2. 🎯 Go to http://localhost:3000
3. 🎯 Register and start solving!

### For Admins
1. ✅ Platform is ready
2. 🎯 Create test problems
3. 🎯 Set up test cases with points
4. 🎯 Invite users

## 📞 Quick Commands

### Start Everything
```bash
docker-compose up -d
cd backend && npm run dev
cd frontend && npm run dev
```

### Stop Everything
```bash
# Stop servers (Ctrl+C in terminals)
docker-compose down
```

### Reset Database
```bash
cd backend
npm run db:reset
npm run db:seed
```

### Check Status
```bash
docker ps                    # Check containers
curl http://localhost:5000   # Check backend
curl http://localhost:3000   # Check frontend
```

## ✨ Key Features Summary

### For Learning
- Practice mode with sample tests
- Detailed feedback on failures
- Point-based partial credit
- Multiple language support

### For Competition
- Timed contests
- Real-time leaderboards
- Performance metrics
- Global rankings

### For Assessment
- Automatic evaluation
- Comprehensive test coverage
- Detailed analytics
- Progress tracking

---

## 🎉 You're All Set!

Everything is configured and ready to use. Start coding at:

**http://localhost:3000**

Happy Coding! 🚀
