const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Add .get() method (retrieve single row)
db.get = function(sql, params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = [];
  }
  
  this.all(sql, params, (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, rows && rows.length > 0 ? rows[0] : null);
    }
  });
};

module.exports = db;
