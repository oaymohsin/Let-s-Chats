import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from './error/error.component';

@Injectable()
export class ErrorHandlingInterceptor implements HttpInterceptor {
  constructor(private dialog:MatDialog) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage="An unknown error occured"
        // alert(error.error.error);
        // const err = new Error('test'); throwError(() => err);
        // return throwError(error);
        if(error.error.message){
          errorMessage=error.error.message;
        }
        this.dialog.open(ErrorComponent,{data:{message:errorMessage}})
        return throwError(() => new Error(error.error.message));
      })
    );
  }
}
