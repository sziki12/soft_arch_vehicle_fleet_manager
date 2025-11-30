import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  success = '';
  error = '';
  submitted = false;

  @Output() switchToLogin = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      role: ['fleet_operator', [Validators.required]]
    });
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';
    const { username, password, role } = this.form.value;
    this.userService.registerUser({ name: username, password, role }).subscribe({
      next: () => {
        this.success = 'Registration successful. Redirecting to login...';
        this.error = '';
        this.loading = false;
        setTimeout(() => this.switchToLogin.emit(), 1200);
      },
      error: (err) => {
        this.error = this.parseError(err) ?? 'Registration failed.';
        this.success = '';
        this.loading = false;
      }
    });
  }

  private parseError(err: any): string | null {
    if (!err) return null;
    if (typeof err.error === 'string') return err.error;
    if (err.error && typeof err.error === 'object') {
      if (err.error.message) return err.error.message;
      if (err.error.errors) {
        const firstKey = Object.keys(err.error.errors)[0];
        const first = err.error.errors[firstKey];
        if (Array.isArray(first) && first.length) return first[0];
      }
    }
    if (err.message) return err.message;
    if (err.status && err.statusText) return `${err.status} ${err.statusText}`;
    return null;
  }
}
