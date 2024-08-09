// import { Component, OnInit } from '@angular/core';
import { Component, OnInit, Inject, Output, EventEmitter, Input, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-verify-email-account',
  templateUrl: './verify-email-account.component.html',
  styleUrls: ['./verify-email-account.component.css']
})
export class VerifyEmailAccountComponent implements OnInit {
  otpForm: FormGroup;
    otpInvalid = false;
    recievedData = {};
    invalidLength = false;
    emailId='';
    firstName = '';

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<VerifyEmailAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    this.otpForm = this.formBuilder.group({
      one: [''],
      two: [''],
      three: [''],
      four: ['']
    });

    // formBuilder.group(
    //   {
    //     one: new FormControl({ value: '' }),
    //     two: new FormControl({ value: '' }),
    //     three: new FormControl({ value: '' }),
    //     four: new FormControl({ value: '' })
    //   }
    //  ); 
    }

    inputBlur():void{
      this.invalidLength = false;
      this.otpInvalid = false;
    }

    changeDetails(){


      const response = {
        "Success": true,
        "Status": 200,
        "changeEmail":true
      }

      //this.staticAuditLogAPI('138', JSON.stringify(this.candDataOtp));

      this.dialogRef.close(response);
      
    }

  verify(): void{
    var enteredOTP = this.otpForm.value.one + this.otpForm.value.two + this.otpForm.value.three + this.otpForm.value.four;
    console.log(enteredOTP);
    this.invalidLength = (enteredOTP.toString()).length == 4 ? false : true;
    if(enteredOTP != this.data.data.otp){
      this.otpInvalid = true;
    } else {
      this.otpInvalid = false;

      const response = {
        "Success": true,
        "Status": 200,
        "changeEmail":false
      }

      //this.staticAuditLogAPI('138', JSON.stringify(this.candDataOtp));

      this.dialogRef.close(response);

    }
  }

  ngOnInit(): void {
    // this.recievedData = this.data;
    this.emailId = this.data.data.email;
    this.firstName = this.data.data.firstName;
  }

}
