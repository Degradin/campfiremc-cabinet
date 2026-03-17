const express = require('express');
const router = express.Router();
const multer = require('multer');
const { query } = require('../db');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT
// TODO: Move this to a separate middleware file
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access token is missing or invalid' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = decoded; // Adds user payload to request
        next();
    });
};

// Multer storage configuration (disk)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads', file.fieldname === 'skin' ? 'skins' : 'capes');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const userUuid = req.user.uuid;
        cb(null, userUuid + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// POST /textures/upload - Upload skin and cape
router.post('/upload', verifyToken, upload.fields([{ name: 'skin', maxCount: 1 }, { name: 'cape', maxCount: 1 }]), async (req, res) => {
    const userId = req.user.id;

    try {
        const getFileUrl = (fileArray) => {
            if (!fileArray || fileArray.length === 0) return null;
            const file = fileArray[0];
            // The server will serve static files from the 'public' directory.
            // The URL path will start after 'public'.
            const filePath = file.path.split('public')[1].replace(/\\/g, '/');
            return filePath;
        };

        const skinPath = getFileUrl(req.files.skin);
        const capePath = getFileUrl(req.files.cape);

        // Upsert logic for both Postgres and SQLite
        const existingTexture = await query('SELECT * FROM user_textures WHERE user_id = $1', [userId]);

        if (existingTexture.rows.length > 0) {
            // Update existing record
            const newSkinPath = skinPath || existingTexture.rows[0].skin_path;
            const newCapePath = capePath || existingTexture.rows[0].cape_path;
            await query('UPDATE user_textures SET skin_path = $1, cape_path = $2 WHERE user_id = $3', [newSkinPath, newCapePath, userId]);
        } else {
            // Insert new record
            await query('INSERT INTO user_textures (user_id, skin_path, cape_path) VALUES ($1, $2, $3)', [userId, skinPath, capePath]);
        }

        res.status(200).json({ message: 'Textures uploaded successfully', skin: skinPath, cape: capePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /textures/:uuid - Get user texture profile
router.get('/:uuid', async (req, res) => {
    const { uuid } = req.params;

    try {
        const userResult = await query('SELECT id FROM users WHERE uuid = $1', [uuid]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = userResult.rows[0].id;

        const texturesResult = await query('SELECT skin_path, cape_path FROM user_textures WHERE user_id = $1', [userId]);
        
        const textures = {};
        if (texturesResult.rows.length > 0) {
            const { skin_path, cape_path } = texturesResult.rows[0];

            if (skin_path) {
                textures.SKIN = { url: skin_path };
            }

            if (cape_path) {
                textures.CAPE = { url: cape_path };
            }
        }

        const textureProfile = {
            id: uuid,
            name: uuid, // name is typically the username, but uuid is also valid
            properties: [
                {
                    name: 'textures',
                    value: Buffer.from(JSON.stringify({ 
                        timestamp: Date.now(),
                        profileId: uuid,
                        profileName: uuid, // as above
                        textures: textures
                    })).toString('base64')
                }
            ]
        };

        res.json(textureProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
