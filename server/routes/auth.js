const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// TODO: Move this to a .env file
const JWT_SECRET = 'your-super-secret-key';

// POST /auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userUuid = uuidv4();

    const newUser = await db.query(
      'INSERT INTO users (uuid, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, uuid, username',
      [userUuid, username, email, hashedPassword]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // unique_violation
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
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ id: user.id, uuid: user.uuid }, JWT_SECRET, { expiresIn: '1h' });

    await db.query('UPDATE users SET access_token = $1, client_token = $2 WHERE id = $3', [accessToken, clientToken, user.id]);

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
