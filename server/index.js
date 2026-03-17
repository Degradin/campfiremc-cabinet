const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const initializeDatabase = require('./initDb');

dotenv.config();
initializeDatabase();

const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const texturesRoutes = require('./routes/textures');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/auth', authRoutes);
app.use('/news', newsRoutes);
app.use('/textures', texturesRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
