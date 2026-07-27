import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public isDarkMode = true;

  constructor() {
    const savedTheme = localStorage.getItem('app-theme');
    this.applyTheme(savedTheme !== 'light');
  }

  toggleTheme(): void {
    this.applyTheme(!this.isDarkMode);
  }

  private applyTheme(isDark: boolean): void {
    this.isDarkMode = isDark;
    document.body.classList.toggle('light-theme', !isDark);
    localStorage.setItem('app-theme', isDark ? 'dark' : 'light');
  }
}

