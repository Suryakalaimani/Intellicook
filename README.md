# 🍳 Recipe Generator Web App

A complete recipe discovery and meal planning application built with HTML, CSS, JavaScript, Node.js, Express, and SQLite.

## Features

✅ **User Authentication**
- Login/Sign Up with password hashing (bcrypt)
- JWT-based session management
- Server-side validation

✅ **Cook Book**
- Browse 8 curated Indian recipes
- Search recipes by name
- Filter by region (North/South Indian)
- Filter by diet type (Veg/Non-Veg)
- Filter by calorie range
- View complete ingredient lists and cooking steps
- Add recipes to meal planner

✅ **AI Recipe Generator**
- Generate recipes using Google Gemini API
- Filter by region and ingredient preferences
- Automatic veg-only mode support
- API key kept secure on backend

✅ **Meal Planner**
- Plan meals for any date
- Organize by meal type (Breakfast, Lunch, Dinner, Snacks)
- Real-time calorie tracking
- Per-meal and daily calorie totals
- Save meal plans to backend (per user)
- Load previously saved plans

✅ **Global Veg-Only Toggle**
- Affects all recipe sources (CookBook, Generator, Meal Planner)
- Persistent across sessions
- Instant filtering

✅ **Responsive Design**
- Mobile-friendly interface
- Clean, modern UI
- Accessible form controls

## Tech Stack

**Frontend:**
- HTML5
- CSS3 (Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- LocalStorage for client-side persistence

**Backend:**
- Node.js
- Express.js
- SQLite3 (lightweight database)
- bcrypt (password hashing)
- JWT (authentication)
- Google Generative AI (Gemini API)

## Project Structure

```
recipe-app/
├── backend/
│   ├── index.js              # Express server & API routes
│   ├── auth.js               # Authentication helpers (bcrypt, JWT)
│   ├── gemini-proxy.js       # Gemini API wrapper
│   ├── schema.sql            # SQLite schema
│   ├── package.json          # Dependencies
│   ├── .env                  # Configuration (API keys)
│   └── db.sqlite             # SQLite database (created at runtime)
├── frontend/
│   ├── index.html            # Main HTML (all pages)
│   ├── app.css               # Responsive styles
│   ├── app.js                # SPA logic & API integration
│   ├── data/
│   │   ├── cookbook.json     # Static recipe collection
│   │   └── calorie_db.json   # Ingredient calorie data
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `express` - Web server
- `sqlite3` - Database
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens
- `dotenv` - Environment variables
- `body-parser` - JSON parsing

### Step 2: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy it to `backend/.env`:

```env
GEMINI_API_KEY=your-actual-api-key-here
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
```

### Step 3: Start the Server

```bash
cd backend
npm start
```

The app will be available at **http://localhost:3000**

## Usage

### First Time
1. Click "Sign Up" to create an account
2. Enter username, email, password (min 6 characters)
3. Credentials are hashed and stored in SQLite

### Explore Recipes
1. **Cook Book** - Browse and filter 8 curated recipes
2. **Generate Recipe** - Use AI to create new recipes based on region and ingredients
3. **Meal Planner** - Build daily meal plans with calorie tracking

### Toggle Veg-Only Mode
- Check the "Veg Only" toggle to filter all recipes to vegetarian options
- This persists in localStorage across sessions

### Save Meal Plans
- Select a date and build your meals
- Click "Save Plan" to store in the backend database
- Click "Load Plan" to retrieve a previously saved plan

## API Endpoints

### Authentication
- `POST /api/signup` - Register new user
- `POST /api/login` - Login user

### Recipes
- `GET /api/cookbooks` - Get all recipes from cookbook
- `POST /api/generate` - Generate recipe via Gemini (requires: region, vegOnly, ingredients)
- `GET /api/calories-db` - Get ingredient calorie data

### Meal Plans
- `POST /api/meal-plans/save` - Save meal plan (requires: userId, planDate, mealData)
- `GET /api/meal-plans/:userId/:planDate` - Load meal plan

## Server-Side Validation

All API endpoints include validation:
- Username/Email uniqueness for signup
- Password minimum length (6 characters)
- Email format validation
- Region validation (north/south)
- Required field checks

## Data Persistence

- **User credentials**: SQLite database (hashed with bcrypt)
- **Meal plans**: SQLite database (per user, per date)
- **UI preferences**: Browser localStorage (veg toggle, auth token)
- **Recipes**: Static JSON files

## Security Features

✅ Passwords hashed with bcrypt (10 salt rounds)
✅ API keys stored on backend (.env file)
✅ Server-side input validation
✅ JWT tokens for session management
✅ Gemini API proxied through backend

## Customization

### Adding More Recipes
Edit `frontend/data/cookbook.json`:
```json
{
  "id": 9,
  "title": "Your Recipe",
  "region": "north",
  "isVegetarian": true,
  "approxCalories": 300,
  "cookTime": 30,
  "ingredients": [...],
  "steps": [...]
}
```

### Changing Colors
Edit CSS variables in `frontend/app.css`:
```css
:root {
  --primary-color: #ff6b35;
  --secondary-color: #004e89;
  --success-color: #06a77d;
  --error-color: #d62828;
}
```

## Troubleshooting

**App not starting:**
```bash
# Clear node_modules and reinstall
rm -rf backend/node_modules
cd backend && npm install
npm start
```

**"Cannot find module" errors:**
```bash
npm install --save express sqlite3 bcrypt jsonwebtoken dotenv body-parser
```

**Database locked error:**
- Delete `backend/db.sqlite` and restart server

**Gemini API errors:**
- Check your `.env` file has correct API key
- Verify API key is active in Google AI Studio
- Check rate limits

## Performance Notes

- SQLite is lightweight and sufficient for this use case
- Frontend uses vanilla JS (no framework overhead)
- CSS is minified and efficient
- Images are not used (emoji-based UI)
- Responsive grid layouts avoid layout thrashing

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- Add image uploads for recipes
- Nutrition facts breakdown
- Dietary restriction filters (gluten-free, dairy-free)
- Shopping list generation
- User profile and preferences
- Social sharing
- Recipe ratings and reviews

## License

Open source - feel free to use and modify for your projects.

## Support

For issues or suggestions, check the code comments and server logs for debugging information.

---

**Made with ❤️ for recipe lovers**
