import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) { }

  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user).pipe(
      tap((response: any) => {
        // Если бэкенд сразу отдает токен при регистрации, сохраняем его
        if (response.token) {
          this.saveToken(response.token);
        }
      })
    );
  }

  login(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, user).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  private handleAuthResponse(response: any): void {
    if (response?.token) {
      this.saveToken(response.token);
    }
  }

  private saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
