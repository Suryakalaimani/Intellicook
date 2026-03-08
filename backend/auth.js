const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePasswords(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateToken(userId, username) {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

async function registerUser(username, email, password) {
  return new Promise((resolve, reject) => {
    const passwordHash = hashPassword(password);
    
    passwordHash.then(hash => {
      db.run(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, hash],
        function(err) {
          if (err) {
            reject(err);
          } else {
            const token = generateToken(this.lastID, username);
            resolve({ userId: this.lastID, username, token });
          }
        }
      );
    }).catch(reject);
  });
}

async function loginUser(username, password) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      [username],
      async (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('User not found'));
        } else {
          const isValid = await comparePasswords(password, row.password_hash);
          if (isValid) {
            const token = generateToken(row.id, row.username);
            resolve({ userId: row.id, username: row.username, token });
          } else {
            reject(new Error('Invalid password'));
          }
        }
      }
    );
  });
}

module.exports = {
  hashPassword,
  comparePasswords,
  generateToken,
  verifyToken,
  registerUser,
  loginUser
};
