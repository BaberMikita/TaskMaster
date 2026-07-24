const jwt = require('jsonwebtoken');

// Секретный ключ ДОЛЖЕН совпадать с тем, которым мы подписывали токен в routes/auth.js
const JWT_SECRET = 'my_super_secret_key_12345';

module.exports = function (req, res, next) {
    // 1. Ищем токен в заголовках (клиент должен присылать его в заголовке Authorization)
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Доступ запрещен. Токен не предоставлен.' });
    }

    // Заголовок обычно выглядит так: "Bearer eyJhbGciOi..."
    // Нам нужно отрезать слово "Bearer " и взять саму абракадабру
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Неверный формат токена.' });
    }

    try {
        // 2. ПРОВЕРКА ПОДПИСИ (Та самая математика)
        // Если хакер изменил хоть одну букву или срок годности истек, jwt.verify выдаст ошибку
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. ПЕРЕДАЧА ДАННЫХ ДАЛЬШЕ
        // В decoded сейчас лежит наш Payload: { userId: '123456...', iat: ..., exp: ... }
        // Мы кладем эти данные в объект req, чтобы наши роуты задач знали, какой именно юзер к ним пришел.
        req.user = decoded;

        // 4. Пропускаем запрос дальше (к роутам задач)
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Токен недействителен или просрочен.' });
    }
};