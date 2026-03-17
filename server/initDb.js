const fs = require('fs');
const path = require('path');
const { db, dbType } = require('./db');

const initializeDatabase = () => {
  // Only run this for SQLite
  if (dbType !== 'sqlite') {
    return;
  }

  const initSqlPath = path.join(__dirname, 'init.sql');
  let initSql = fs.readFileSync(initSqlPath, 'utf8');

  // Convert PostgreSQL specific syntax to SQLite compatible syntax
  // SERIAL PRIMARY KEY -> INTEGER PRIMARY KEY AUTOINCREMENT
  initSql = initSql.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT');
  // TIMESTAMP WITH TIME ZONE -> DATETIME
  initSql = initSql.replace(/TIMESTAMP WITH TIME ZONE/g, 'DATETIME');
  // VARCHAR(n) -> TEXT
  initSql = initSql.replace(/VARCHAR\(\d+\)/g, 'TEXT');

  db.serialize(() => {
    // Check if tables already exist to prevent re-initialization errors
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, table) => {
      if (err) {
        return console.error('Error checking for tables:', err.message);
      }
      if (!table) {
        console.log('Tables not found, initializing SQLite database...');
        db.exec(initSql, (execErr) => {
          if (execErr) {
            return console.error('Error executing init.sql for SQLite:', execErr.message);
          }
          console.log('SQLite database initialized successfully.');
        });
      } else {
        console.log('SQLite tables already exist.');
      }
    });
  });
};

module.exports = initializeDatabase;
