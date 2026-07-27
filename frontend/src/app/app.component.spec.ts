import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import { TaskService } from './services/task.service';
import { AuthService } from './services/auth.service';
import { of } from 'rxjs';
import { Task } from './services/task.model';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

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

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
