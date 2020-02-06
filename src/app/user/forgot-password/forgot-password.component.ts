import { Component, OnInit,ViewContainerRef } from '@angular/core';

import { FormGroup,Validators,FormControl } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  RequestResetForm:FormGroup;
  forbiddenEmails : any;
  errorMessage : string;
  successMessage:string;
  IsvalidForm = true;

  constructor(
    private appService:AppService,
    private router : Router,
    public toastr:ToastrService,
    vcr:ViewContainerRef) { }

  ngOnInit() {

    this.RequestResetForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email], this.forbiddenEmails),
    });
  }

//sending email  from form to backend to send a reset password link to users mailbox
  RequestResetUser(form) {
    console.log(form)
    if (form.valid) {
      this.IsvalidForm = true;
      this.appService.sendMailRequest(this.RequestResetForm.value).subscribe(
        data => {
          this.RequestResetForm.reset();
          this.successMessage = "Reset password link send to email sucessfully.";
          this.toastr.warning("Reset password link send to email sucessfully.")
          setTimeout(() => {
            this.successMessage = null;
            this.router.navigate(['login']);
          }, 3000);
        },
        err => {

          if (err.error.message) {
            this.errorMessage = err.error.message;
          }
        }
      );
    } else {
      this.IsvalidForm = false;
    }
  }
  

}
