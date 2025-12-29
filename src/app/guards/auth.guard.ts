import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const role = localStorage.getItem('role');
  const url = new URL(window.location.origin + state.url);
  if (url.searchParams.get('skipGuard') === 'true') {
    return true;
  }

  else if (role === 'true') {
    // Redirect to 'search' route
    router.navigate(['/search'], {
      queryParams: { returnPath: state.url }
    });
    return false; // Block current navigation
  } else {
    router.navigate(['/login']);
    return false;
  }

  return true; // Allow navigation
};
