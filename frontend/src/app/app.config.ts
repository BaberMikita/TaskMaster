
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// ИМПОРТИРУЕМ НУЖНЫЕ ФУНКЦИИ И НАШ ПЕРЕХВАТЧИК
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // ПОДКЛЮЧАЕМ ПЕРЕХВАТЧИК СЮДА
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};