import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: FormGroup;
  mode: 'login' | 'register' = 'login';
  loading = false;
  error = '';
  submitted = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      role: ['manager', Validators.required]
    });
  }

  toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = '';
    this.submitted = false;

    if (this.mode === 'register') {
      this.form.controls['name'].addValidators([Validators.required]);
    } else {
      this.form.controls['name'].clearValidators();
      this.form.controls['name'].setValue('');
    }
    this.form.controls['name'].updateValueAndValidity();
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error = '';
    this.loading = true;

    const { name, email, password, role } = this.form.value;
    const request$ = this.mode === 'login'
      ? this.authService.login({ email, password, role })
      : this.authService.register({ name, email, password, role });

    request$.subscribe({
      next: () => this.loading = false,
      error: () => {
        this.error = 'Authentication failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
