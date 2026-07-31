import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    // По умолчанию считаем, что тема темная
    public isDarkMode = true;

    constructor() {
        // При старте приложения проверяем память браузера
        const savedTheme = localStorage.getItem('app-theme');

        if (savedTheme === 'light') {
            this.isDarkMode = false;
            document.body.classList.add('light-theme'); // Включаем светлую тему
        }
    }

    // Метод для кнопки-переключателя
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;

        if (this.isDarkMode) {
            document.body.classList.remove('light-theme');
            localStorage.setItem('app-theme', 'dark');
        } else {
            document.body.classList.add('light-theme');
            localStorage.setItem('app-theme', 'light');
        }
    }
}
