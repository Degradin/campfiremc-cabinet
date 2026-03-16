const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db');
const path = require('path');
const jwt = require('jsonwebtoken');

// TODO: Move this to a .env file
const JWT_SECRET = 'your-super-secret-key';

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

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'skin') {
            cb(null, 'uploads/skins/');
        } else if (file.fieldname === 'cape') {
            cb(null, 'uploads/capes/');
        }
    },
    filename: function (req, file, cb) {
        // Name files after the user's UUID to ensure uniqueness
        cb(null, req.user.uuid + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// POST /textures/upload - Upload skin and cape
router.post('/upload', verifyToken, upload.fields([{ name: 'skin', maxCount: 1 }, { name: 'cape', maxCount: 1 }]), async (req, res) => {
    const userId = req.user.id;
    const userUuid = req.user.uuid;

    try {
        let skinPath = null;
        let capePath = null;

        if (req.files.skin) {
            skinPath = `/uploads/skins/${userUuid}${path.extname(req.files.skin[0].originalname)}`;
        }
        if (req.files.cape) {
            capePath = `/uploads/capes/${userUuid}${path.extname(req.files.cape[0].originalname)}`;
        }

        // Upsert logic: Insert or update texture paths
        await db.query(
            `INSERT INTO user_textures (user_id, skin_path, cape_path) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (user_id) 
             DO UPDATE SET skin_path = COALESCE($2, user_textures.skin_path), cape_path = COALESCE($3, user_textures.cape_path)`,
            [userId, skinPath, capePath]
        );

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
        const userResult = await db.query('SELECT id FROM users WHERE uuid = $1', [uuid]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = userResult.rows[0].id;

        const texturesResult = await db.query('SELECT skin_path, cape_path FROM user_textures WHERE user_id = $1', [userId]);
        
        const textures = {};
        if (texturesResult.rows.length > 0) {
            const { skin_path, cape_path } = texturesResult.rows[0];
            const baseUrl = `${req.protocol}://${req.get('host')}`;

            if (skin_path) {
                textures.SKIN = { url: `${baseUrl}${skin_path}` };
            }
            if (cape_path) {
                textures.CAPE = { url: `${baseUrl}${cape_path}` };
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
