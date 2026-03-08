const db = require('./database');

function runTest() {
  const planDate = '2026-03-07';
  const mealData = {
    breakfast: [{ title: 'Test Eggs', approxCalories: 200, protein: 12 }],
    lunch: [],
    dinner: [],
    snacks: [],
    totalCalories: 200,
    totalProtein: 12
  };

  const payload = JSON.stringify(mealData);

  db.serialize(() => {
    console.log('Running DB save test for date:', planDate);
    db.get('SELECT id FROM saved_plans WHERE plan_date = ?', [planDate], (selectErr, row) => {
      if (selectErr) {
        console.error('SELECT error:', selectErr.message);
        process.exit(1);
      }

      if (row && row.id) {
        db.run('UPDATE saved_plans SET meal_data = ? WHERE id = ?', [payload, row.id], function(err) {
          if (err) {
            console.error('UPDATE error:', err.message);
            process.exit(1);
          }
          console.log('Update successful, id=', row.id);
          fetchAndPrint();
        });
      } else {
        db.run('INSERT INTO saved_plans (plan_date, meal_data) VALUES (?, ?)', [planDate, payload], function(err) {
          if (err) {
            console.error('INSERT error:', err.message);
            process.exit(1);
          }
          console.log('Insert successful, id=', this.lastID);
          fetchAndPrint();
        });
      }
    });
  });

  function fetchAndPrint() {
    db.get('SELECT id, plan_date, meal_data, created_at FROM saved_plans WHERE plan_date = ?', [planDate], (err, row) => {
      if (err) {
        console.error('FETCH error:', err.message);
        process.exit(1);
      }
      if (!row) {
        console.error('No row found after insert/update');
        process.exit(1);
      }
      console.log('Saved row:', { id: row.id, plan_date: row.plan_date, created_at: row.created_at });
      try {
        const data = JSON.parse(row.meal_data);
        console.log('Meal data totals:', { totalCalories: data.totalCalories, totalProtein: data.totalProtein });
      } catch (e) {
        console.error('Failed to parse meal_data:', e.message);
      }
      process.exit(0);
    });
  }
}

runTest();
