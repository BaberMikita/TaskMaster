import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import { TaskService } from './services/task.service';
import { AuthService } from './services/auth.service';
import { of } from 'rxjs';
import { Task } from './services/task.model';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        {
          provide: TaskService,
          useValue: {
            getTasks: () => of([]),
            addTask: () => of({} as Task),
            deleteTask: () => of({}),
            updateTask: () => of({} as Task),
            toggleTask: () => of({} as Task),
          },
        },
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => true,
            login: () => of({}),
            register: () => of({}),
            logout: () => { },
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should filter tasks by selected date and format createdAt', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    component.tasks = [
      { _id: '1', title: 'Первая', isCompleted: false, createdAt: '2026-07-24T12:30:00.000Z' },
      { _id: '2', title: 'Вторая', isCompleted: false, createdAt: '2026-07-25T08:00:00.000Z' },
    ] as Task[];
    component.filterDate = '2026-07-24';
    component.applyFilter();

    expect(component.visibleTasks.length).toBe(1);
    expect(component.visibleTasks[0].title).toBe('Первая');
    expect(component.formatCreatedAt(component.tasks[0].createdAt)).toContain('24');
  });
});
