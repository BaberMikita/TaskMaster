import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Просим Angular дать нам сервис авторизации
    const authService = inject(AuthService);

    // Достаем токен из localStorage
    const token = authService.getToken();

    // Если токен есть, приклеиваем его к запросу
    if (token) {
        const clonedRequest = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        // Отправляем измененный запрос на бэкенд
        return next(clonedRequest);
    }

    // Если токена нет, отправляем запрос как есть
    return next(req);
};
