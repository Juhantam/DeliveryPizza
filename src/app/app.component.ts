import {Component} from '@angular/core';
import {Subscription} from "rxjs";
import {AuthService} from "./service/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  subscriptions: Subscription[] = [];

  showLoginInput = false;
  password = '';
  loginError = '';
  isLoggingIn = false;

  constructor(public authService: AuthService) {
  }

  onAuthButtonClick(): void {
    if (this.authService.isAuthenticated) {
      this.authService.logout();
      this.showLoginInput = false;
    } else {
      this.showLoginInput = !this.showLoginInput;
      this.loginError = '';
    }
  }

  onLogin(): void {
    if (!this.password || this.isLoggingIn) return;

    this.isLoggingIn = true;
    this.loginError = '';

    this.subscriptions.push(
      this.authService.login(this.password).subscribe({
        next: () => {
          this.password = '';
          this.isLoggingIn = false;
          this.showLoginInput = false;
        },
        error: (err: Error) => {
          this.isLoggingIn = false;
          if (err.message.startsWith('TOO_MANY_ATTEMPTS')) {
            this.loginError = 'Liiga palju katseid, proovi hiljem';
          } else {
            this.loginError = 'Vale parool';
          }
        }
      })
    );
  }
}
