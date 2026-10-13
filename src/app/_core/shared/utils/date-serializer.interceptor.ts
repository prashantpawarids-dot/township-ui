import { HttpInterceptorFn } from '@angular/common/http';

function toLocalISO(date: Date): string {
  const dd   = date.getDate().toString().padStart(2, '0');
  const mm   = (date.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;          // "2024-06-15" — no T, no Z, no UTC shift
}

const ISO_WITH_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function sanitizeDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return toLocalISO(obj);
  if (typeof obj === 'string' && ISO_WITH_TIME.test(obj)) {
    return obj.split('T')[0];             // "2026-05-15T00:00:00" → "2026-05-15"
  }
  if (Array.isArray(obj))  return obj.map(sanitizeDates);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = sanitizeDates(obj[key]);
    }
    return result;
  }
  return obj;
}

export const dateSerializerInterceptor: HttpInterceptorFn = (req, next) => {
  if (
    req.body &&
    typeof req.body === 'object' &&
    !(req.body instanceof FormData)       // never touch file uploads
  ) {
    req = req.clone({ body: sanitizeDates(req.body) });
  }
  return next(req);
};