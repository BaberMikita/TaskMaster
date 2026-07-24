const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email не может быть пустым!'],
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Пароль не может быть пустым!'],
        trim: true,
        minlength: [6, 'Пароль должен быть минимум из 6 символов'],
    }
})

module.exports = mongoose.model('User', userSchema);