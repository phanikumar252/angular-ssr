import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, take } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditlogService {

  apiEndPoint: string = "";

  password = "ova-inc";
  salt = "3FF2EC019C627B945225DEBAD71A01B6985FE84C95A70EB132882F88C0A59A55";
  iv = "3C46C00F3C46C00F3C46C00F3C46C00F";

  key = CryptoJS.PBKDF2( 
                       this.password, 
                       CryptoJS.enc.Hex.parse(this.salt), 
                       {
                           keySize: 256/32, 
                           iterations: 10
                       }
                 );

constructor(private http: HttpClient, private router: Router) {
    console.log(environment);
    this.apiEndPoint = environment.apiUrl;
  }

  encryptAES(plainText : string) {
    //alert(123);
    return plainText;
    let encstr = CryptoJS.AES.encrypt(plainText, this.key, {iv: CryptoJS.enc.Hex.parse(this.iv)}).ciphertext.toString(CryptoJS.enc.Base64);
    return encstr;
  }

  decryptAES(encstr : string) { 
    //alert(123);
    return encstr;
    encstr = encstr.replace(/\r\n/g, '');
    if(/\s/g.test(encstr)){
      return '';
    }
    let cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(encstr)
    });
    let decrypted = CryptoJS.AES.decrypt(
                        cipherParams,
                        this.key,
                        { iv: CryptoJS.enc.Hex.parse(this.iv) }
                    );
    let decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedStr;
  }

 

  staticAuditLogSave(data: any): Observable<any> {
    let API_URL = `${this.apiEndPoint}`;
    return this.http.post(API_URL + 'saveauditlog', data)
      .pipe(
        catchError(this.handleError)
      )
  }

  // Handle API errors
  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Something bad happened; please try again later.');
  };

}
