const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
require('dotenv').config();

const db = require('./database');
const { generateRecipe } = require('./gemini-proxy');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Database initialization
// Initialize database schema immediately and log connection state
try {
  db.serialize(() => {
    console.log('Connected to SQLite database');
    initializeDatabase();
  });
} catch (err) {
  console.error('Database initialization error:', err);
}

function initializeDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema, (err) => {
    if (err) console.error('Schema error:', err);
    else console.log('Database schema initialized');
  });
}

// ============ MEAL PLAN ROUTES ============
app.post('/api/meal-plans/save', (req, res) => {
  const { planDate, mealData } = req.body;

  console.log('Save meal plan request body:', JSON.stringify(req.body));

  if (!planDate || !mealData) {
    return res.status(400).json({ error: 'Missing required fields: planDate and mealData required', received: req.body });
  }

  const payload = JSON.stringify(mealData);

  // Use a safe two-step insert-or-update to avoid relying on specific SQLite versions
  db.get('SELECT id FROM saved_plans WHERE plan_date = ?', [planDate], (selectErr, row) => {
    if (selectErr) {
      console.error('DB select error when saving meal plan:', selectErr);
      return res.status(500).json({ error: 'Failed to save meal plan', detail: selectErr.message });
    }

    if (row && row.id) {
      db.run('UPDATE saved_plans SET meal_data = ? WHERE id = ?', [payload, row.id], function(updateErr) {
        if (updateErr) {
          console.error('DB update error when saving meal plan:', updateErr);
          return res.status(500).json({ error: 'Failed to save meal plan', detail: updateErr.message });
        }
        return res.json({ success: true });
      });
    } else {
      db.run('INSERT INTO saved_plans (plan_date, meal_data) VALUES (?, ?)', [planDate, payload], function(insertErr) {
        if (insertErr) {
          console.error('DB insert error when saving meal plan:', insertErr);
          return res.status(500).json({ error: 'Failed to save meal plan', detail: insertErr.message });
        }
        return res.json({ success: true });
      });
    }
  });
});

app.get('/api/meal-plans/:planDate', (req, res) => {
  const { planDate } = req.params;

  db.get(
    'SELECT meal_data FROM saved_plans WHERE plan_date = ?',
    [planDate],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: 'Failed to retrieve meal plan' });
      } else if (row) {
        res.json(JSON.parse(row.meal_data));
      } else {
        res.json(null);
      }
    }
  );
});

// ============ RECIPE GENERATION ROUTE ============
app.post('/api/generate', async (req, res) => {
  const { cuisine, vegOnly, ingredients } = req.body;

  const allowedCuisines = ['North Indian', 'South Indian', 'Chinese', 'Italian', 'French', 'Japanese', 'Dessert'];

  // Server-side validation
  if (!cuisine || !allowedCuisines.includes(cuisine)) {
    return res.status(400).json({ error: 'Invalid cuisine. Must be one of: ' + allowedCuisines.join(', ') });
  }

  try {
    const recipe = await generateRecipe(cuisine, !!vegOnly, Array.isArray(ingredients) ? ingredients : []);
    res.json(recipe);
  } catch (error) {
    console.error('Generate route error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate recipe' });
  }
});

// ============ SERVE FRONTEND ============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/api/cookbooks', (req, res) => {
  const cookbookPath = path.join(__dirname, '../frontend/data/cookbook.json');
  try {
    const data = fs.readFileSync(cookbookPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load cookbook' });
  }
});

app.get('/api/calories-db', (req, res) => {
  const caloriesPath = path.join(__dirname, '../frontend/data/calorie_db.json');
  try {
    const data = fs.readFileSync(caloriesPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load calories database' });
  }
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Export app for Vercel serverless functions
module.exports = app;

// Start server only when run directly (not when imported)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
