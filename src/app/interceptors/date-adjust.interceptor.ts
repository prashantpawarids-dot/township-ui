// // src/app/interceptors/date-adjust.interceptor.ts

// import { HttpInterceptorFn } from '@angular/common/http';

// export const adjustDatesInPayload = (obj: any): any => {
//   // if (obj instanceof Date) {
//   //   const offset = obj.getTimezoneOffset() * 60000;
//   //   return new Date(obj.getTime() - offset).toISOString();
//   // } 

//   if (obj instanceof Date) {
//     const dd   = obj.getDate().toString().padStart(2, '0');
//     const mm   = (obj.getMonth() + 1).toString().padStart(2, '0');
//     const yyyy = obj.getFullYear();
//     return `${yyyy}-${mm}-${dd}`;
//   }
//   else if (Array.isArray(obj)) {
//     return obj.map(item => adjustDatesInPayload(item));
//   } else if (typeof obj === 'object' && obj !== null) {
//     const newObj: any = {};
//     for (const key in obj) {
//       if (Object.prototype.hasOwnProperty.call(obj, key)) {
//         newObj[key] = adjustDatesInPayload(obj[key]);
//       }
//     }
//     return newObj;
//   }
//   return obj;
// };

// export const DateAdjustInterceptor: HttpInterceptorFn = (req, next) => {
//   if (req.body instanceof FormData) {
//     return next(req);
//   }
//   if (req.body) {
//     const adjustedBody = adjustDatesInPayload(req.body);
//     const modifiedReq = req.clone({ body: adjustedBody });
//     return next(modifiedReq);
//   }
//   return next(req);
// };


// Replaced by dateSerializerInterceptor in date-serializer.interceptor.ts
// Kept only to avoid broken imports if referenced elsewhere

import { HttpInterceptorFn } from '@angular/common/http';

export const DateAdjustInterceptor: HttpInterceptorFn = (req, next) => next(req);