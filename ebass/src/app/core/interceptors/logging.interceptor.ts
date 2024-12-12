import { HttpInterceptorFn } from '@angular/common/http';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(`Hi from loggin interceptor ${req.url}` );
  return next(req);
};
