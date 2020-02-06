import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  public userId : String;
  public username : String;

  constructor(private AppService:AppService,private router:Router,private toastr:ToastrService) { }

  ngOnInit() {
    this.userId = Cookie.get("receiverId")
    this.username = Cookie.get('receiverName')
  }
//not being used
  public gotoTaskPage(){
    this.router.navigate(['/tasks',this.userId])
   
  }
//logout module which deleted all cookies  
  public logout:any = () => {
    this.AppService.logout().subscribe((apiResponse) => {
      if(apiResponse.status == 200){
        console.log("logout called");
        Cookie.delete('authToken');
        Cookie.delete('receiverId');
        Cookie.delete('receiverName');
        this.router.navigate(["/"]);
      }
      else {
        this.toastr.error(apiResponse.message);
        // console.log(apiResponse.message)
      }
  
    },(err) => {
      this.toastr.error("Some error occured");
    })
  }
  
}
