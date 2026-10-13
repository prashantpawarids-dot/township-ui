import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

// Backend stores dates as local (IST, UTC+5:30) midnight but serializes them
// to JSON as UTC ("...T18:30:00.000Z"). Parsing that string with the
// browser's own timezone silently rolls the calendar date back by a day.
// This corrects it back to the date the user actually picked, returning a
// real local Date object safe to bind to [(ngModel)] + matDatepicker.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const ISO_DATE_ONLY  = /^\d{4}-\d{2}-\d{2}$/;
const ISO_WITH_TIME  = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function fixServerDate(value: string): Date {
  if (ISO_DATE_ONLY.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const shifted = new Date(new Date(value).getTime() + IST_OFFSET_MS);
  return new Date(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
}

function fixDatesInResponse(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string' && (ISO_DATE_ONLY.test(obj) || ISO_WITH_TIME.test(obj))) {
    return fixServerDate(obj);
  }
  if (Array.isArray(obj)) return obj.map(fixDatesInResponse);
  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      obj[key] = fixDatesInResponse(obj[key]);
    }
    return obj;
  }
  return obj;
}

export const dateResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse && event.body && typeof event.body === 'object') {
        return event.clone({ body: fixDatesInResponse(event.body) });
      }
      return event;
    })
  );
};