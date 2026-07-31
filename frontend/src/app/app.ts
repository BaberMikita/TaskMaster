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
    <div class="page" [class.light-theme]="!themeService.isDarkMode">
      <div class="card">
        <div class="header-row">
          <h1 class="title" style="margin: 0;">📝 My Tasks</h1>
          <div class="header-actions">
            <button class="theme-toggle" type="button" (click)="toggleTheme()" [attr.aria-label]="themeService.isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'">
              {{ themeService.isDarkMode ? '🌞' : '🌙' }}
            </button>
            <button *ngIf="authService.isLoggedIn()" class="btn-logout" (click)="logout()">Log out</button>
          </div>
        </div>
        <p class="subtitle">Angular + Node.js + MongoDB</p>

        <!-- Форма авторизации -->
        <div *ngIf="!authService.isLoggedIn()" class="auth-container">
          <h3 class="auth-title">Sign In / Sign Up</h3>
          <input #email type="email" placeholder="Email" class="auth-input">
          <input #password type="password" placeholder="Password" class="auth-input">
          <div class="auth-actions">
            <button class="btn-add" style="flex: 1;" (click)="login(email.value, password.value)">Sign In</button>
            <button class="btn-secondary" style="flex: 1;" (click)="register(email.value, password.value)">Create account</button>
          </div>
        </div>
        
        <!-- Tasks (shown only when logged in) -->
        <div *ngIf="authService.isLoggedIn()">
          <div class="task-add-block">
            <input
              type="text"
              [(ngModel)]="newTaskTitle"
              placeholder="New task title..."
              class="task-input"
            />
            <input
              type="date"
              [(ngModel)]="selectedDate"
              class="task-date-input"
            />
            <button class="btn-add" (click)="addNewTask()">+ Add</button>
          </div>

          <div class="task-add-block" style="margin-top: 12px;">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchInput()"
              placeholder="Search tasks..."
              class="task-input"
              style="flex: 1;"
            />
            <input
              type="date"
              [(ngModel)]="filterDate"
              (change)="applyFilter()"
              class="task-date-input"
            />
            <button class="btn-secondary" (click)="clearFilter()">Reset</button>
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
            🎉 No tasks yet. The database is empty!
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
  searchQuery = '';
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private taskService: TaskService,
    public authService: AuthService,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.fetchTasks();
      this.loadTasks();
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
        alert('Login failed');
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
          alert('Registration successful! Please sign in with your credentials.');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Registration failed');
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
      error: (err) => console.error('Server connection error:', err)
    });
  }

  onSearchInput() {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.applyFilter();
    }, 300);
  }

  applyFilter() {
    const query = this.searchQuery.trim().toLowerCase();

    this.visibleTasks = this.tasks.filter(task => {
      const matchesSearch = !query || (task.title || '').toLowerCase().includes(query);
      const matchesDate = !this.filterDate || this.getDateKey(task.createdAt) === this.filterDate;
      return matchesSearch && matchesDate;
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
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }

    this.filterDate = '';
    this.searchQuery = '';
    this.applyFilter();
  }

  formatCreatedAt(value?: string): string {
    if (!value) {
      return 'Date not specified';
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
      return alert('Please enter a task title');
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
      error: (err) => console.error('Error creating task:', err)
    });
  }

  deleteTask(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t._id !== id);
          this.applyFilter();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error deleting task:', err)
      });
    }
  }
  saveTask(id: any) {
    const newTitle = prompt('New task title:', this.tasks.find(t => t._id === id)?.title);
    if (newTitle) {
      this.taskService.updateTask(id, newTitle).subscribe({
        next: (updatedTask) => {
          this.tasks = this.tasks.map(t => t._id === id ? updatedTask : t);
          this.applyFilter();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error:', err)
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
      error: (err) => console.error('Error changing task status:', err)
    });
  }

  loadTasks() {
    this.taskService.getTasks(this.searchQuery, this.filterDate).subscribe({
      next: (data) => {
        this.tasks = data;
        this.applyFilter();
      }
    });
  }
}

