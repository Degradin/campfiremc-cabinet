const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Verify that R2 environment variables are loaded
const requiredEnv = ['JWT_SECRET'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
    console.error(`Error: Missing required environment variables: ${missingEnv.join(', ')}`);
    console.error('Please ensure the .env file in the /server directory is correctly configured.');
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
const initializeDatabase = require('./initDb');


initializeDatabase();

const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const texturesRoutes = require('./routes/textures');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRoutes);
app.use('/news', newsRoutes);
app.use('/textures', texturesRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
