const express = require('express');
const router = express.Router();
const { query, dbType } = require('../db');

// GET /news - Get all news articles
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT id, title, content, created_at FROM news ORDER BY created_at DESC');
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
        const insertQuery = dbType === 'postgres'
            ? 'INSERT INTO news (title, content, author_id) VALUES ($1, $2, $3) RETURNING *'
            : 'INSERT INTO news (title, content, author_id) VALUES ($1, $2, $3)';

        const insertResult = await query(insertQuery, [title, content, author_id]);

        let newNews;
        if (dbType === 'postgres') {
            newNews = insertResult.rows[0];
        } else {
            // For SQLite, fetch the news item we just inserted
            const newsResult = await query('SELECT * FROM news ORDER BY id DESC LIMIT 1');
            newNews = newsResult.rows[0];
        }

        res.status(201).json(newNews);
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
        const result = await query('DELETE FROM news WHERE id = $1', [id]);
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
