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

  console.log('📝 Save meal plan request for date:', planDate);
  console.log('Meal data:', JSON.stringify(mealData, null, 2));

  // Validate inputs
  if (!planDate || !mealData) {
    console.error('❌ Validation failed - missing planDate or mealData');
    return res.status(400).json({ 
      error: 'Missing required fields: planDate and mealData required' 
    });
  }

  try {
    const payload = JSON.stringify(mealData);
    console.log('💾 Payload size:', payload.length, 'bytes');

    // Check if plan already exists
    db.get('SELECT id FROM saved_plans WHERE plan_date = ?', [planDate], (selectErr, row) => {
      if (selectErr) {
        console.error('❌ DB select error:', selectErr);
        return res.status(500).json({ 
          error: 'Database error - failed to check existing plan',
          detail: selectErr.message 
        });
      }

      if (row && row.id) {
        // Update existing plan
        console.log(`🔄 Updating existing plan (ID: ${row.id})`);
        db.run(
          'UPDATE saved_plans SET meal_data = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?', 
          [payload, row.id], 
          function(updateErr) {
            if (updateErr) {
              console.error('❌ DB update error:', updateErr);
              return res.status(500).json({ 
                error: 'Failed to update meal plan',
                detail: updateErr.message 
              });
            }
            console.log('✅ Meal plan updated successfully');
            return res.json({ success: true, message: 'Meal plan updated' });
          }
        );
      } else {
        // Insert new plan
        console.log('➕ Creating new meal plan');
        db.run(
          'INSERT INTO saved_plans (plan_date, meal_data) VALUES (?, ?)', 
          [planDate, payload], 
          function(insertErr) {
            if (insertErr) {
              console.error('❌ DB insert error:', insertErr);
              return res.status(500).json({ 
                error: 'Failed to save meal plan',
                detail: insertErr.message 
              });
            }
            console.log('✅ Meal plan saved successfully');
            return res.json({ success: true, message: 'Meal plan saved' });
          }
        );
      }
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error.message 
    });
  }
});

app.get('/api/meal-plans/:planDate', (req, res) => {
  const { planDate } = req.params;

  console.log('📖 Load meal plan request for date:', planDate);

  db.get(
    'SELECT meal_data FROM saved_plans WHERE plan_date = ?',
    [planDate],
    (err, row) => {
      if (err) {
        console.error('❌ DB error loading meal plan:', err);
        return res.status(500).json({ error: 'Failed to retrieve meal plan' });
      }

      if (row) {
        try {
          const mealData = JSON.parse(row.meal_data);
          console.log('✅ Meal plan loaded successfully');
          return res.json(mealData);
        } catch (parseErr) {
          console.error('❌ Error parsing meal data:', parseErr);
          return res.status(500).json({ error: 'Corrupted meal plan data' });
        }
      } else {
        console.log('ℹ️ No meal plan found for date:', planDate);
        return res.json(null);
      }
    }
  );
});

// ============ Get all saved plans (for history/list view) ============
app.get('/api/meal-plans', (req, res) => {
  console.log('📚 Fetching all saved meal plans');

  db.all(
    'SELECT id, plan_date, MAX(created_at) as created_at FROM saved_plans GROUP BY plan_date ORDER BY plan_date DESC',
    [],
    (err, rows) => {
      if (err) {
        console.error('❌ DB error fetching plans:', err);
        return res.status(500).json({ error: 'Failed to retrieve meal plans' });
      }

      console.log(`✅ Found ${rows ? rows.length : 0} saved meal plans`);
      return res.json(rows || []);
    }
  );
});

// ============ Delete a meal plan ============
app.delete('/api/meal-plans/:planDate', (req, res) => {
  const { planDate } = req.params;

  console.log('🗑️ Delete meal plan request for date:', planDate);

  db.run(
    'DELETE FROM saved_plans WHERE plan_date = ?',
    [planDate],
    function(err) {
      if (err) {
        console.error('❌ DB error deleting plan:', err);
        return res.status(500).json({ error: 'Failed to delete meal plan' });
      }

      console.log('✅ Meal plan deleted successfully');
      return res.json({ success: true, message: 'Meal plan deleted' });
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
