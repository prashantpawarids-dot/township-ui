import { Injectable } from '@angular/core';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(private alertService: AlertService) { }

  handleError(error: any) {
    let errorMessage = 'An error occurred.';

    if (error.error && error.error.errors) {
      // Handle validation errors
      errorMessage = Object.keys(error.error.errors).map(field => {
        return `${field}: ${error.error.errors[field].join(', ')}`;
      }).join('\n');
    } else {
      // Handle other errors (non-validation)
      errorMessage = error.message || errorMessage;
    }

    this.alertService.openError(errorMessage); // Use SnackbarService to show the error message
  }
}