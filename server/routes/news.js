const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /news - Get all news articles
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, title, content, created_at FROM news ORDER BY created_at DESC');
    // GML-Launcher expects an array of {id, title, content}
    const news = result.rows.map(item => ({ id: item.id, title: item.title, content: item.content }));
    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /news - Create a new news article (Admin only)
// TODO: Add authentication middleware to protect this route
router.post('/', async (req, res) => {
    const { title, content, author_id } = req.body;

    if (!title || !content || !author_id) {
        return res.status(400).json({ error: 'Title, content and author_id are required' });
    }

    try {
        const newNews = await db.query(
            'INSERT INTO news (title, content, author_id) VALUES ($1, $2, $3) RETURNING *',
            [title, content, author_id]
        );
        res.status(201).json(newNews.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /news/:id - Delete a news article (Admin only)
// TODO: Add authentication middleware to protect this route
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM news WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'News article not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
