import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();
  const isApiUrl = req.url.startsWith(environment.apiUrl);

  let authReq = req;
  if (token && isApiUrl) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't intercept 401s on login, register, or refresh endpoints
      const isAuthEndpoint = req.url.includes('/auth/login') ||
                             req.url.includes('/auth/register') ||
                             req.url.includes('/auth/refresh');

      if (error.status === 401 && !isAuthEndpoint && authService.refreshTokenStr()) {
        return authService.refreshToken().pipe(
          switchMap((res) => {
            if (res && res.data) {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.data.accessToken}`
                }
              });
              return next(retryReq);
            }
            authService.logout();
            return throwError(() => error);
          }),
          catchError((refreshErr) => {
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

