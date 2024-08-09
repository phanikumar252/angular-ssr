import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserAuthService } from '../user-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router : Router,private userAuthService:UserAuthService){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      //console.log(localStorage.getItem('userToken'));
      // if(localStorage.getItem('userToken') != null){
      //   return true;
      // } else {
      //   this.router.navigate(['/login']);
      //   return false;
      // }

      
      if(this.userAuthService.isUserLoggedIn()){
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }


    }
  
}
