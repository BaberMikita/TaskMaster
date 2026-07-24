// файл: routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); // Импортируем нашу модель из соседней папки
const authMiddleware = require('../middleware/auth');

// Обрати внимание: мы убрали '/api/tasks' из каждого пути, 
// потому что мы зададим этот базовый префикс в главном файле.
// Теперь тут просто '/' или '/:id'

// 1. ЧТЕНИЕ ВСЕХ ЗАДАЧ (GET)
// 1. GET: Получить ТОЛЬКО СВОИ задачи (с фильтром по дате)
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Базовый фильтр - всегда ищем только задачи текущего юзера
        const filter = { user: req.user.userId };

        // Если в URL есть параметр date (например /api/tasks?date=2026-07-22)
        if (req.query.date) {
            filter.date = req.query.date; // Добавляем дату в фильтр
        }

        // Ищем в базе по нашему собранному фильтру
        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Не удалось получить список задач" });
    }
});

// 2. СОЗДАНИЕ (POST)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const newTask = await Task.create({
            title: req.body.title,
            isCompleted: req.body.isCompleted,
            user: req.user.userId
        });
        res.status(201).json(newTask);
    } catch (error) {
        console.error('POST /tasks error:', error.name, error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: "Ошибка валидации данных",
                details: error.message
            });
        }
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

// 3. ОБНОВЛЕНИЕ (PATCH)
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId }, // проверяем и ID задачи, и владельца
            req.body,
            { new: true }
        );
        if (!updatedTask) return res.status(404).json({ error: "Задача не найдена или нет доступа" });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при обновлении" });
    }
});

// 4. УДАЛЕНИЕ (DELETE)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete(
            { _id: req.params.id, user: req.user.userId } // проверяем и ID задачи, и владельца
        );
        if (!deletedTask) return res.status(404).json({ error: "Задача не найдена или нет доступа" });
        res.status(200).json({ message: "Задача успешно удалена" });
    } catch (error) {
        res.status(500).json({ error: "Ошибка при удалении" });
    }
});

// Экспортируем роутер
module.exports = router;