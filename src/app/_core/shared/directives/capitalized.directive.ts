import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[autoCapitalizeFirst]'
})
export class AutoCapitalizeFirstDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value && value.length > 0) {
      const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
      if (value !== capitalized) {
        input.value = capitalized;

        // Dispatch 'input' event again to notify Angular's form control
        input.dispatchEvent(new Event('input'));
      }
    }
  }
}