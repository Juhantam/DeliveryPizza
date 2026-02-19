import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {inject, NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatSortModule} from "@angular/material/sort";
import {MatTableModule} from "@angular/material/table";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {Router, RouterModule, Routes} from "@angular/router";
import {AdminComponent} from "./admin/admin.component";
import {AppComponent} from "./app.component";
import {HomeComponent} from "./home/home.component";
import {AuthInterceptorService} from "./interceptor/auth-interceptor.service";
import {DelivererNamesPipe} from "./pipe/deliverer-names.pipe";
import {EventTypePipe} from "./pipe/event-type.pipe";
import {AuthService} from "./service/auth.service";
import {SpinWheelComponent} from "./spin-wheel/spin-wheel.component";
import {YesNoPipe} from "./pipe/yes-no.pipe";

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'admin', component: AdminComponent, canActivate: [() => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.isAuthenticated || router.createUrlTree(['/']);
  }]}
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AdminComponent,
    SpinWheelComponent,
    EventTypePipe,
    YesNoPipe,
    DelivererNamesPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSortModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  providers: [
    provideAnimationsAsync(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
