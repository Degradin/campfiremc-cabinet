const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

let db;
let dbType;

// Use a simple flag to determine if we're in a Docker/Postgres environment
const usePostgres = !!process.env.DATABASE_URL;

if (usePostgres) {
  console.log('Connecting to PostgreSQL...');
  dbType = 'postgres';
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
} else {
  console.log('Using SQLite for local development...');
  dbType = 'sqlite';
  const dbPath = path.join(__dirname, 'campfiremc.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error('Error opening SQLite database:', err.message);
    }
    console.log('Connected to the SQLite database.');
  });
}

// Create a unified query interface
const query = (text, params = []) => {
  if (dbType === 'postgres') {
    return db.query(text, params);
  }

  // For SQLite
  return new Promise((resolve, reject) => {
    // Convert PostgreSQL's $1, $2 placeholders to SQLite's ?
    const sqliteQuery = text.replace(/\$\d+/g, '?');

    if (sqliteQuery.trim().toUpperCase().startsWith('SELECT')) {
      db.all(sqliteQuery, params, (err, rows) => {
        if (err) {
          return reject(err);
        }
        // Mimic the 'pg' library's result object
        resolve({ rows });
      });
    } else {
      db.run(sqliteQuery, params, function (err) { // Use 'function' to get 'this'
        if (err) {
          return reject(err);
        }
        // Mimic the 'pg' library's result object
        resolve({ rowCount: this.changes });
      });
    }
  });
};

module.exports = { query, db, dbType };
