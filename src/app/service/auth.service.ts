import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subscription, catchError, tap, throwError, timer} from 'rxjs';
import {environment} from '../../environments/environment';

interface FirebaseAuthResponse {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface FirebaseRefreshResponse {
  id_token: string;
  refresh_token: string;
  expires_in: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseApiKey}`;
  private refreshUrl = `https://securetoken.googleapis.com/v1/token?key=${environment.firebaseApiKey}`;

  private tokenSubject = new BehaviorSubject<string | null>(null);
  private refreshTimerSub: Subscription | null = null;

  constructor(private http: HttpClient) {
    this.tryRestoreSession();
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  login(password: string): Observable<FirebaseAuthResponse> {
    return this.http.post<FirebaseAuthResponse>(this.signInUrl, {
      email: environment.firebaseAuthEmail,
      password: password,
      returnSecureToken: true
    }).pipe(
      tap(response => {
        this.handleAuthSuccess(response.idToken, response.refreshToken, +response.expiresIn);
      }),
      catchError(error => {
        const message = error?.error?.error?.message || 'LOGIN_FAILED';
        return throwError(() => new Error(message));
      })
    );
  }

  logout(): void {
    this.tokenSubject.next(null);
    this.clearRefreshTimer();
    sessionStorage.removeItem('fb_idToken');
    sessionStorage.removeItem('fb_refreshToken');
    sessionStorage.removeItem('fb_tokenExpiry');
  }

  private handleAuthSuccess(idToken: string, refreshToken: string, expiresInSeconds: number): void {
    this.tokenSubject.next(idToken);

    const expiryTimestamp = Date.now() + expiresInSeconds * 1000;
    sessionStorage.setItem('fb_idToken', idToken);
    sessionStorage.setItem('fb_refreshToken', refreshToken);
    sessionStorage.setItem('fb_tokenExpiry', expiryTimestamp.toString());

    this.scheduleTokenRefresh(expiresInSeconds);
  }

  private scheduleTokenRefresh(expiresInSeconds: number): void {
    this.clearRefreshTimer();
    const refreshInMs = Math.max((expiresInSeconds - 300) * 1000, 30000);
    this.refreshTimerSub = timer(refreshInMs).subscribe(() => this.refreshToken());
  }

  private refreshToken(): void {
    const refreshToken = sessionStorage.getItem('fb_refreshToken');
    if (!refreshToken) {
      this.logout();
      return;
    }

    this.http.post<FirebaseRefreshResponse>(this.refreshUrl, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }).subscribe({
      next: response => {
        this.handleAuthSuccess(response.id_token, response.refresh_token, +response.expires_in);
      },
      error: () => {
        this.logout();
      }
    });
  }

  private tryRestoreSession(): void {
    const idToken = sessionStorage.getItem('fb_idToken');
    const refreshToken = sessionStorage.getItem('fb_refreshToken');
    const expiryStr = sessionStorage.getItem('fb_tokenExpiry');

    if (!idToken || !refreshToken || !expiryStr) {
      return;
    }

    const expiry = +expiryStr;
    const now = Date.now();

    if (now >= expiry) {
      this.http.post<FirebaseRefreshResponse>(this.refreshUrl, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }).subscribe({
        next: response => {
          this.handleAuthSuccess(response.id_token, response.refresh_token, +response.expires_in);
        },
        error: () => {
          this.logout();
        }
      });
    } else {
      this.tokenSubject.next(idToken);
      const remainingSeconds = Math.floor((expiry - now) / 1000);
      this.scheduleTokenRefresh(remainingSeconds);
    }
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimerSub) {
      this.refreshTimerSub.unsubscribe();
      this.refreshTimerSub = null;
    }
  }
}
