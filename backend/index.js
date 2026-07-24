const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json()); // ВАЖНО: это должно быть ДО любых роутов, чтобы req.body работало

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const DB_URI = process.env.DB_URI;

mongoose.connect(DB_URI)
    .then(() => console.log('База данных MongoDB успешно подключена!'))
    .catch((err) => console.error('Ошибка подключения к базе:', err));


const taskRoutes = require('./routes/tasks');

app.use('/api/tasks', taskRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})
