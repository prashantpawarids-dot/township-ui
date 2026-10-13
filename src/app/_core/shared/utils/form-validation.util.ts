export function formvalidation(form: any): boolean {
  if (form.invalid) {
    form.control.markAllAsTouched();
    const firstInvalid = document.querySelector('.ng-invalid[formcontrolname], .ng-invalid[name]');
    if (firstInvalid) {
      (firstInvalid as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return false;
  }
  return true;
}