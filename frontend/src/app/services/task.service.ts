import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from './task.model';
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // Адрес твоего запущенного бэкенда на Node.js
  private apiUrl = 'http://localhost:3000/api/tasks';

  constructor(private http: HttpClient) { }

  // Получить все задачи (READ)
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  // Создать новую задачу (CREATE)
  addTask(task: { title: string; createdAt?: string; description?: string }): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  updateTask(id: string, title: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, { title });
  }

  // Переключить статус выполнения задачи (toggle completed)
  toggleTask(id: string, isCompleted: boolean): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, { isCompleted });
  }
}
