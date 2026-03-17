const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, dbType } = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// POST /auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userUuid = uuidv4();

    const insertQuery = dbType === 'postgres'
      ? 'INSERT INTO users (uuid, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, uuid, username'
      : 'INSERT INTO users (uuid, username, email, password) VALUES ($1, $2, $3, $4)';

    const insertResult = await query(insertQuery, [userUuid, username, email, hashedPassword]);

    let registeredUser;
    if (dbType === 'postgres') {
      registeredUser = insertResult.rows[0];
    } else {
      // For SQLite, fetch the user we just inserted
      const userResult = await query('SELECT id, uuid, username FROM users WHERE uuid = $1', [userUuid]);
      registeredUser = userResult.rows[0];
    }

    res.status(201).json(registeredUser);
  } catch (error) {
    // Handle unique constraint errors for both PostgreSQL and SQLite
    if ((dbType === 'postgres' && error.code === '23505') || (dbType === 'sqlite' && error.code === 'SQLITE_CONSTRAINT')) {
      return res.status(409).json({ error: 'User with this username or email already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/authenticate
router.post('/authenticate', async (req, res) => {
  const { username, password, clientToken, requestUser } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ id: user.id, uuid: user.uuid }, JWT_SECRET, { expiresIn: '1h' });

    await query('UPDATE users SET access_token = $1, client_token = $2 WHERE id = $3', [accessToken, clientToken, user.id]);

    const response = {
      accessToken,
      clientToken,
      availableProfiles: [
        {
          id: user.uuid,
          name: user.username,
        },
      ],
      selectedProfile: {
        id: user.uuid,
        name: user.username,
      },
    };

    if (requestUser) {
        response.user = {
            id: user.uuid,
            properties: []
        }
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
