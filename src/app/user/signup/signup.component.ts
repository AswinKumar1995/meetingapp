import { Component, OnInit,ViewContainerRef } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import countryAbbreviations from "../../../assets/country.json"
import countryCodes from "../../../assets/country-code.json"

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  public userRole : string
  public countryCode :string = "Select Country.."
  public country:string = ""
  public sortOrders: string[] = []
  public allCountrywithCodes :any;
  public allCountriesSymbols = Object.keys(countryAbbreviations)
  public allCountriesCodes = Object.values(countryCodes)
  public allCountryNames = Object.values(countryAbbreviations)
  public selectedCode : any;
  public roleTypes = ['Admin','Normal']


  public firstName:any;
  public lastName:any;
  public mobile:any;
  public email:any;
  public password:any;


  constructor(
    public appService : AppService,
    public router : Router,
    public toastr:ToastrService,
    vcr:ViewContainerRef
  ) { }

  ngOnInit() {

    for (let code of (this.allCountriesSymbols)){
      var countryName = countryAbbreviations[code]
      var countryCode = countryCodes[code]
      this.sortOrders.push(countryName + " ( "+ countryCode + " )")
    }
  }


  public goToSignIn:any = () => {
    this.router.navigate(["/"]);
  }

  //extracting user details from form
  public signupFunction:any = () => {
    if (!this.firstName) {
      this.toastr.warning("Please enter first name");
    }
    else if (!this.lastName) {
      this.toastr.warning("Please enter last name");
    }
    else if (!this.selectedCode) {
      this.toastr.warning("Please select Country");
    }
    else if (!this.mobile) {
      this.toastr.warning("Please enter mobile number");
    }
    else if (!this.email) {
      this.toastr.warning("Please enter email");
    }
    else if (!this.password) {
      this.toastr.warning("Please enter password");
    }
    else if (!this.userRole) {
      this.toastr.warning("Please select role");
    }
    else {

      this.changeCountryCode(this.selectedCode)
      this.mobile = this.countryCode + "-"+this.mobile
      if(this.userRole == 'Admin'){
        this.lastName = this.lastName + "-admin"
      }
      let data = {
        firstName:this.firstName,
        lastName:this.lastName,
        mobile:this.mobile,
        email:this.email,
        password:this.password,
        location:this.country,
        role:this.userRole
      }
      console.log("Form Data")
      console.log(data)
      this.appService.signUpFunction(data).subscribe((apiResponse) => {
        console.log(apiResponse);
        if(apiResponse.status == 200){
          this.toastr.success("SignUp Successful");
          setTimeout(() => {
            this.goToSignIn();
          },2000)
        }
        else{
          this.toastr.error(apiResponse.message);
        }
  
        
      },(err) => {
        console.log(err)
        this.toastr.error(err);
      }); 

    }
  }
//storing country code and country
  public changeCountryCode(value:any){
    console.log("Option clicked")
    console.log(value)
    this.countryCode = this.strip(value.split("(")[1].split(")")[0])
    this.country = this.strip(value.split("(")[0])
    console.log("Country Code : ",this.countryCode)
  }

  public strip(str) {
    return str.replace(/^\s+|\s+$/g, '');
}

}
