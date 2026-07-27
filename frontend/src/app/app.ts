import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from './services/task.service';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { Task } from './services/task.model';
import { CommonModule } from '@angular/common'; // Обязательно для *ngFor и *ngIf

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./app.component.css'],
  template: `
    <div class="page">
      <div class="card">
        <div class="header-row">
          <h1 class="title" style="margin: 0;">📝 Мои задачи</h1>
          <div class="header-actions">
            <button class="theme-toggle" type="button" (click)="toggleTheme()">
              {{ themeService.isDarkMode ? '☀️ Светлая' : '🌙 Темная' }}
            </button>
            <button *ngIf="authService.isLoggedIn()" class="btn-logout" (click)="logout()">Выйти</button>
          </div>
        </div>
        <p class="subtitle">Angular + Node.js + MongoDB</p>

        <!-- Форма авторизации -->
        <div *ngIf="!authService.isLoggedIn()" class="auth-container">
          <h3 class="auth-title">Вход / Регистрация</h3>
          <input #email type="email" placeholder="Email" class="auth-input">
          <input #password type="password" placeholder="Пароль" class="auth-input">
          <div class="auth-actions">
            <button class="btn-add" style="flex: 1;" (click)="login(email.value, password.value)">Войти</button>
            <button class="btn-secondary" style="flex: 1;" (click)="register(email.value, password.value)">Создать аккаунт</button>
          </div>
        </div>
        
        <!-- Задачи (показываем только если авторизован) -->
        <div *ngIf="authService.isLoggedIn()">
          <div class="task-add-block">
            <input
              type="text"
              [(ngModel)]="newTaskTitle"
              placeholder="Название новой задачи..."
              class="task-input"
            />
            <input
              type="date"
              [(ngModel)]="selectedDate"
              class="task-date-input"
            />
            <button class="btn-add" (click)="addNewTask()">+ Добавить</button>
          </div>

          <div class="task-add-block" style="margin-top: 12px;">
            <input
              type="date"
              [(ngModel)]="filterDate"
              (change)="applyFilter()"
              class="task-date-input"
            />
            <button class="btn-secondary" (click)="clearFilter()">Сбросить</button>
          </div>

          <ul class="task-list">
            <li class="task-item" *ngFor="let task of visibleTasks">
              <input type="checkbox" [checked]="task.isCompleted" (change)="toggleTask(task)" class="task-checkbox">
              <span class="task-title" [class.completed-text]="task.isCompleted">{{ task.title }}</span>
              <span class="task-date" style="margin-left: 8px; color: #64748b; font-size: 12px;">{{ formatCreatedAt(task.createdAt) }}</span>
              <button class="btn-edit" (click)="saveTask(task._id)">✎</button>
              <button class="btn-delete" (click)="deleteTask(task._id)">✕</button>
            </li>
          </ul>
          <p class="empty-msg" *ngIf="visibleTasks.length === 0">
            🎉 Задач пока нет. База пуста!
          </p>
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  tasks: Task[] = []; // Сюда лягут данные с нашего бэкенда
  visibleTasks: Task[] = [];
  newTaskTitle = '';
  selectedDate = new Date().toISOString().split('T')[0];
  filterDate = '';

  constructor(
    private taskService: TaskService,
    public authService: AuthService,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.fetchTasks();
    }
  }

  login(email: string, password: string) {
    if (!email || !password) return alert('Введите email и пароль');
    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.fetchTasks();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Ошибка при входе');
      }
    });
  }

  register(email: string, password: string) {
    if (!email || !password) return alert('Введите email и пароль');
    this.authService.register({ email, password }).subscribe({
      next: (res) => {
        if (res.token) {
          this.fetchTasks(); // Если сервер вернул токен, сразу входим
        } else {
          alert('Регистрация успешна! Теперь войдите с вашими данными.');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Ошибка при регистрации');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.tasks = [];
    this.cdr.detectChanges();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  fetchTasks() {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Ошибка соединения с сервером:', err)
    });
  }

  applyFilter() {
    if (!this.filterDate) {
      this.visibleTasks = [...this.tasks];
      return;
    }

    this.visibleTasks = this.tasks.filter(task => {
      const taskDate = this.getDateKey(task.createdAt);
      return taskDate === this.filterDate;
    });
  }

  private getDateKey(value?: string): string | null {
    if (!value) {
      return null;
    }

    const normalized = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return normalized;
    }

    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString().split('T')[0];
  }

  clearFilter() {
    this.filterDate = '';
    this.applyFilter();
  }

  formatCreatedAt(value?: string): string {
    if (!value) {
      return 'Дата не указана';
    }

    const normalized = value.trim();
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      return normalized;
    }

    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  addNewTask() {
    if (!this.newTaskTitle) {
      return alert('Введите название задачи');
    }

    const newTaskPayload = {
      title: this.newTaskTitle,
      createdAt: this.selectedDate
    };

    this.taskService.addTask(newTaskPayload).subscribe({
      next: (newTask) => {
        this.tasks = [...this.tasks, newTask];
        this.applyFilter();
        this.newTaskTitle = '';
        this.selectedDate = new Date().toISOString().split('T')[0];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Ошибка при создании:', err)
    });
  }

  deleteTask(id: string) {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t._id !== id);
          this.applyFilter();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Ошибка удаления:', err)
      });
    }
  }
  saveTask(id: any) {
    const newTitle = prompt('Новое название задачи:', this.tasks.find(t => t._id === id)?.title);
    if (newTitle) {
      this.taskService.updateTask(id, newTitle).subscribe({
        next: (updatedTask) => {
          this.tasks = this.tasks.map(t => t._id === id ? updatedTask : t);
          this.applyFilter();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Ошибка:', err)
      })
    }
  }

  toggleTask(task: Task) {
    const newStatus = !task.isCompleted;
    this.taskService.toggleTask(task._id, newStatus).subscribe({
      next: (updatedTask) => {
        this.tasks = this.tasks.map(t => t._id === task._id ? updatedTask : t);
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Ошибка при изменении статуса:', err)
    });
  }
}

