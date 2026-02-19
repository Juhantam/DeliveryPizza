import {HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {AuthService} from "../service/auth.service";

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  private readonly rtdbHost = 'delivery-pizza-a4ea7-default-rtdb.europe-west1.firebasedatabase.app';

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.token;

    if (token && req.url.includes(this.rtdbHost)) {
      const modifiedRequest = req.clone({
        params: req.params.set('auth', token)
      });
      return next.handle(modifiedRequest);
    }

    return next.handle(req);
  }
}
