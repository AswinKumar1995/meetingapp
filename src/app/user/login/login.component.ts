import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Route } from '@angular/compiler/src/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public email:any;
  public password:any;


  constructor(
    public appService:AppService,
    public router : Router,
    public toastr : ToastrService
  ) { }

  ngOnInit() {
  }

// route to register component
  public goToSignUp: any = () => {
    this.router.navigate(["/signup"])
  }
//sign in function to check email and pasword
  public signinFunction:any = () => {
    if(!this.email){
      this.toastr.warning("enter email");
    }
    else if(!this.password){
      this.toastr.warning("enter password");
    }
    else{

      let data = {email:this.email,
                  password:this.password}

      this.appService.signinFunction(data).subscribe((apiResponse) => {

        if(apiResponse.status == 200){
          console.log("userData")
          console.log(apiResponse)
          Cookie.set('authToken',apiResponse.data.authToken);
          Cookie.set('receiverId',apiResponse.data.userDetails.userId);
          console.log(Cookie.get("receiverId"))
          Cookie.set('receiverName',apiResponse.data.userDetails.firstName + ' ' + apiResponse.data.userDetails.lastName );
          this.appService.setUserInFoInLocalStorage(apiResponse.data.userDetails);
         
         // after login go to dashboard
          this.router.navigate(["/home"]);
        }
        else if(apiResponse.status == 500){
          this.toastr.warning("User Credentials are invalid")
        }
        else {
          this.toastr.error(apiResponse.message)
        }
      },(err) => {
        this.toastr.error("User Credentials are invalid");
      })

    }
  }
}
