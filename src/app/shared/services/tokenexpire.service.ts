import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse, HttpErrorResponse }   from '@angular/common/http';
import { Injectable } from "@angular/core"
import { Observable, of } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UserAuthService } from 'src/app/user-auth.service';
import { Emitters } from 'src/app/class/emitters/emitters';


@Injectable({
  providedIn: 'root'
})
export class TokenexpireService {

  authenticated = false;

  constructor(private userService: UserAuthService,private router:Router) {
    // Emitters.authEmitter.subscribe(
    //   (auth:boolean)=>{
    //       this.authenticated = auth;
    //   }

    // );

  }


  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    
    return next.handle(req).pipe(
      tap(evt => {
        //debugger;
        if (evt instanceof HttpResponse) {
            if(evt.body.tokenExpired == true){
              this.authenticated = false;
              this.userService.logout();
            }
          }
      }),
      catchError((err: any) => {
        if(err instanceof HttpErrorResponse) {
           //log error 
      }
    return of(err);

}));






  }

  
}
