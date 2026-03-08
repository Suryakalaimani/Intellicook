# Quick Start Guide

## 5-Minute Setup

### 1. Get API Key (2 minutes)
- Visit: https://makersuite.google.com/app/apikey
- Click "Create API Key"
- Copy the key

### 2. Configure Backend (1 minute)
Edit `backend/.env`:
```
GEMINI_API_KEY=paste-your-key-here
JWT_SECRET=any-random-string
PORT=3000
```

### 3. Install & Run (2 minutes)
```bash
cd backend
npm install
npm start
```

**Done!** Open http://localhost:3000

---

## Default Test Account
After installation, you can:
1. Create a new account (Sign Up)
2. Or use any username/password combo to test

---

## Features at a Glance

| Feature | Location | What It Does |
|---------|----------|--------------|
| Cook Book | Left menu | Browse 8 recipes, search, filter |
| Generate | Left menu | AI creates recipes from region + ingredients |
| Meal Planner | Left menu | Plan meals for any date, track calories |
| Veg Toggle | Top right | Filter all recipes to vegetarian |
| Save/Load | Meal Planner | Save meal plans per date to database |

---

## File Structure

```
backend/
  ├── index.js         ← Main server
  ├── auth.js          ← Login/password logic
  ├── gemini-proxy.js  ← AI recipe generation
  ├── schema.sql       ← Database setup
  ├── package.json     ← Dependencies
  ├── .env             ← Configuration
  └── db.sqlite        ← Database (auto-created)

frontend/
  ├── index.html       ← All pages (SPA)
  ├── app.css          ← Responsive styles
  ├── app.js           ← Page logic & API calls
  └── data/
      ├── cookbook.json   ← 8 recipes
      └── calorie_db.json ← Ingredient data
```

---

## API Endpoints Reference

```
POST /api/signup
POST /api/login
GET  /api/cookbooks
POST /api/generate
GET  /api/calories-db
POST /api/meal-plans/save
GET  /api/meal-plans/:userId/:planDate
```

All requests/responses are JSON.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | Edit PORT in .env |
| npm command not found | Install Node.js |
| Module not found | Run: npm install |
| API key invalid | Check makersuite.google.com |
| Can't login | Passwords are case-sensitive |

---

## Next Steps

1. ✅ Get the app running
2. 📝 Create an account
3. 🍽️ Add some meals to plan
4. 🤖 Try AI recipe generation
5. 💾 Save your first meal plan

Enjoy! 🎉
