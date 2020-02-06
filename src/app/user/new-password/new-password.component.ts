import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnInit {

  ResponseResetForm: FormGroup;
  errorMessage: string;
  successMessage: string;
  resetToken: string;
  CurrentState: any;
  IsResetFormValid = true;

  constructor(private appService:AppService,private router : Router,private _route: ActivatedRoute,
    private fb : FormBuilder,private toastr:ToastrService) {

      this.CurrentState = "Wait";
      this.CurrentState = 'Verified';
     }

  ngOnInit() {
    //extract reset token from URL
    this.resetToken = this._route.snapshot.paramMap.get("resettoken")
    this.Init();
  }

  Init(){
    //extract new password and confirm password from forms
    this.ResponseResetForm = this.fb.group(
      {
        resetToken:[this.resetToken],
        newPassword:['',[Validators.required,Validators.minLength(4)]],
        confirmPassword:['',[Validators.required,Validators.minLength(4)]]
      }
    )
  };

  // validating new password and confirm password
  Validate(passwordFormGroup:FormGroup){
    const new_password = passwordFormGroup.controls.newPassword.value
    const confirm_password = passwordFormGroup.controls.confirmPassword.value
    if (confirm_password.length <= 0) {
      return null;
    }
    if (confirm_password !== new_password) {
      return {
        doesNotMatch: true
      };
    }
    return null;
  }

  //updating new password in database

  ResetPassword(form){
    console.log(form.get('confirmPassword'));
    if(form.valid){
      this.IsResetFormValid = true;
      this.appService.resetPassword(this.ResponseResetForm.value).subscribe(
        data => {
          this.ResponseResetForm.reset();
          this.successMessage = data.message;
          this.toastr.warning("New password is updated.Please Try to Login Again.")
          setTimeout(() => {
            this.successMessage = null;
            this.router.navigate(['login']);
          }, 3000);
        },
        err => {
          if(err.error.message){
            this.errorMessage = err.error.message;
          }
        }
      );
    }
    else{
      this.IsResetFormValid = false;
    }
  }

}
