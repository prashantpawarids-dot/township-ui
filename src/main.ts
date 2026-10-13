import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

// import { DateAdjustInterceptor } from './app/interceptors/date-adjust.interceptor';
import { dateSerializerInterceptor } from './app/_core/shared/utils/date-serializer.interceptor';
import { dateResponseInterceptor } from './app/_core/shared/utils/date-response.interceptor';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      MatNativeDateModule,
      MatDatepickerModule
    ),
    provideAnimations(),
    provideAnimationsAsync(),
    // provideHttpClient(withInterceptors([DateAdjustInterceptor])),
    provideHttpClient(withInterceptors([dateSerializerInterceptor, dateResponseInterceptor])),
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
}).catch((err) => console.error(err));