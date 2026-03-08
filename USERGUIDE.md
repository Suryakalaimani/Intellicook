# User Guide

## 🏠 Welcome to Recipe Generator

A complete recipe discovery, generation, and meal planning application.

---

## 📖 Table of Contents
1. [Getting Started](#getting-started)
2. [Navigation](#navigation)
3. [Features Overview](#features-overview)
4. [Detailed Walkthroughs](#detailed-walkthroughs)
5. [Tips & Tricks](#tips--tricks)

---

## Getting Started

### First Time Setup

1. **Open the app:** Go to http://localhost:3000
2. **You'll see the Login page** with two options:
   - Login (if you already have an account)
   - Sign Up (to create a new account)

### Creating an Account

1. Click **"Sign Up"** button
2. Fill in the form:
   - **Username:** Any unique username
   - **Email:** Valid email address
   - **Password:** At least 6 characters (case-sensitive)
3. Click **"Sign Up"** button
4. You're logged in! 🎉

### Logging In

1. Click **"Login"** (default view)
2. Enter your username and password
3. Click **"Login"** button

---

## Navigation

Once logged in, you'll see a header with:

| Button | Purpose |
|--------|---------|
| **Cook Book** | Browse and filter recipes |
| **Generate Recipe** | Create recipes with AI |
| **Meal Planner** | Plan meals and track calories |
| **Veg Only** | Toggle vegetarian-only mode |
| **Logout** | Exit your account |

---

## Features Overview

### 🍽️ Cook Book

**What it does:** Browse a collection of 8 Indian recipes

**How to use:**
1. Click **"Cook Book"** in the menu
2. See all recipes displayed as cards
3. Each card shows:
   - Recipe name
   - Veg/Non-Veg badge
   - Region, cook time, calories
   - Ingredient list
   - Cooking steps

**Filtering & Search:**
- **Search box:** Type recipe name
- **Region filter:** North or South Indian
- **Diet filter:** Vegetarian or Non-Vegetarian
- **Calorie filter:** Drag slider to set max calories

**Adding to Meal Planner:**
- Click **"+ Add to Meal Planner"** button
- Choose which meal type (Breakfast/Lunch/Dinner/Snacks)
- Recipe appears in your meal plan

---

### 🤖 Generate Recipe

**What it does:** Create new recipes using Google's Gemini AI

**How to use:**
1. Click **"Generate Recipe"** in the menu
2. Select **Region:**
   - North Indian
   - South Indian
3. Optionally enter **Ingredients:**
   - Type comma-separated list (e.g., "tomato, onion, paneer")
   - Leave empty to generate from scratch
4. Click **"Generate Recipe"**
5. Wait for AI to create your recipe (~3-5 seconds)
6. View the generated recipe with:
   - Title, region, cook time, calories
   - Full ingredient list
   - Step-by-step instructions
7. Click **"Add to Meal Planner"** to use it

**Pro Tips:**
- Generator respects the **"Veg Only"** toggle
- Specific ingredients increase recipe relevance
- Each generation creates a unique recipe

---

### 📅 Meal Planner

**What it does:** Plan your meals for any date and track calories

**How to use:**

1. Click **"Meal Planner"** in the menu
2. Select a date using the date picker (defaults to today)
3. See calorie tracker for:
   - Breakfast calories
   - Lunch calories
   - Dinner calories
   - Snacks calories
   - **Total calories** for the day

**Adding Meals:**
1. Click **"+ Add Meal"** in any meal section
2. Browse available recipes (from Cook Book)
3. Click a recipe to add it
4. Recipe appears in that meal section
5. Calories update automatically

**Managing Meals:**
1. Each added meal shows:
   - Recipe name
   - Calories
   - Remove button
2. Click **"Remove"** to delete meal
3. Calories update instantly

**Saving Plans:**
1. After building your meal plan, click **"Save Plan"**
2. Plan saves to your account (must be logged in)
3. Your plan persists even if you close the browser

**Loading Plans:**
1. Select a different date
2. Click **"Load Plan"**
3. If a saved plan exists, it loads automatically
4. If not, you get an empty meal plan to fill

---

## Detailed Walkthroughs

### Walkthrough 1: Browse & Discover

**Goal:** Find a vegetarian lunch recipe

1. Open app and login
2. Go to **Cook Book**
3. Toggle **"Veg Only"** ON (top right)
4. Use **Region filter** → "South Indian"
5. Search: try "dosa" or "sambar"
6. Click a recipe card to view details
7. Read ingredients and steps
8. Perfect! Now add to meal planner

### Walkthrough 2: Generate & Plan

**Goal:** Create a dinner recipe for chicken with tomato

1. Open app and login
2. Go to **Generate Recipe**
3. Select Region → "North Indian"
4. Ingredients → "chicken, tomato"
5. Click **"Generate Recipe"**
6. Wait for AI to create recipe
7. Review the generated recipe
8. Click **"Add to Meal Planner"**
9. Choose "Dinner"
10. Check Meal Planner to see updated calories

### Walkthrough 3: Plan a Full Day

**Goal:** Create breakfast, lunch, dinner, snacks for tomorrow

1. Login and go to **Meal Planner**
2. Select tomorrow's date
3. **Breakfast:** Click "Add Meal" → Choose "Idli with Chutney"
4. **Lunch:** Click "Add Meal" → Choose "Dosa with Sambar"
5. **Dinner:** Click "Add Meal" → Generate new recipe
6. **Snacks:** Optional - add if desired
7. Watch total calories update
8. Click **"Save Plan"**
9. Confirmation: "Meal plan saved successfully!"

### Walkthrough 4: Save & Reuse Plans

**Goal:** Load yesterday's successful meal plan

1. Go to **Meal Planner**
2. Select previous date
3. Click **"Load Plan"**
4. Yesterday's meals appear
5. Modify if needed
6. Click **"Save Plan"** to save new version
7. Original plan unchanged, new plan saved

---

## Tips & Tricks

### 💡 Pro Tips

1. **Vegetarian Mode**
   - Turn on "Veg Only" toggle
   - Affects Cook Book, Generator, and suggestions
   - Persists across sessions

2. **Meal Planning**
   - Plan weekly (7 days ahead)
   - Use generated recipes for variety
   - Check total daily calories

3. **Recipe Generator**
   - More specific ingredients = better results
   - Leave blank for random discoveries
   - Try unusual ingredient combinations

4. **Calorie Tracking**
   - Daily recommended: ~2000-2500 calories
   - Balance meals throughout the day
   - Use calorie totals as guide

5. **Searching**
   - Use recipe names or ingredients
   - Filter by region or diet first
   - Try relaxing filters if no results

### 🎯 Quick Actions

- **Add recipe to planner:** Click green "Add" button on any card
- **Search while browsing:** Start typing in search box
- **Change date:** Click date picker, select new date
- **Remove meal:** Click "Remove" button on meal item
- **See details:** Click recipe card to expand

---

## Common Questions

**Q: Where are my saved meal plans?**
A: Stored in the backend database. Load them by selecting the date and clicking "Load Plan"

**Q: Can I edit a recipe after adding it?**
A: You can remove and re-add recipes. Edit Cook Book directly if you own the project.

**Q: What if I get an error?**
A: Check:
- Backend is running (`npm start`)
- API key in `.env` is valid
- Internet connection is working

**Q: How many meals can I add per day?**
A: Unlimited! Add multiple recipes to any meal section.

**Q: Does "Veg Only" affect my saved plans?**
A: No, saved plans are fixed. Toggle affects only new recipes.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Tab | Navigate between form fields |
| Enter | Submit form or select item |
| Esc | Close modal (if open) |

---

## Data Persistence

### What's Saved
- ✅ User accounts (encrypted passwords)
- ✅ Meal plans (per date)
- ✅ Veg toggle preference (browser storage)

### What's Not Saved
- ✗ Currently viewing page
- ✗ Temporary filters
- ✗ Search queries

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't login | Check username/password (case-sensitive) |
| Blank recipe page | Wait for page to load, refresh if needed |
| Generator not working | Verify API key in backend/.env |
| Meals not saving | Ensure you're logged in |
| Calculations incorrect | Refresh page, try again |

---

## Accessibility Features

- ✅ Keyboard navigation
- ✅ Clear labels on all inputs
- ✅ Accessible color contrast
- ✅ Mobile-responsive layout
- ✅ Semantic HTML structure

---

## About The Data

**Recipes:** 8 authentic Indian recipes (North & South)
**Cuisine:** North Indian, South Indian
**Calorie Data:** Realistic estimates for common ingredients
**Updates:** Add more recipes by editing `cookbook.json`

---

## Support

For issues or questions:
1. Check README.md for technical details
2. See QUICKSTART.md for setup help
3. Review server logs if errors occur
4. Check browser console (F12) for JavaScript errors

---

**Happy cooking! 🍳**

Enjoy exploring recipes, generating new dishes, and planning your meals!
