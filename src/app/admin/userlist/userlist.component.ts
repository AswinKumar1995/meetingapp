import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss']
})
export class UserlistComponent implements OnInit {

  public userId :String;
  public userDetails : any;
  public adminFlag : boolean;
  constructor(private AppService:AppService,private router:Router,private toastr:ToastrService) { }
  public allUsers :any;
  ngOnInit() {
    this.userId = Cookie.get("receiverId")
    //checking for user Role from DB
    this.AppService.getUserDetails(this.userId).subscribe(
      data=> {
        this.userDetails = data['data']
        console.log("user details")
        console.log(data)
        if(this.userDetails.role == 'Admin'){
          this.adminFlag = true
        }
        else{
          this.adminFlag = false
        }
        if(this.adminFlag){
          console.log("user is admin")
        }
        else{
          console.log("user is not admin")
        }
      },
      error => {
        console.log("Some error occured")
        console.log(error)
      }
    )

    this.AppService.getAllUsers().subscribe(
      data => {
        console.log(data)
        this.allUsers = data['data']
      },
      error => {
        console.log("some error occurred")
        console.log(error)
      }
    )
  }
  // route to users page for editing their schedules
  public routeToMeetingPage(userDetails){
    console.log(userDetails)
    let path = "/meeting/"+ userDetails.userId + "/userName/"+ userDetails.firstName + "_" + userDetails.lastName
    this.router.navigate([path])
  }
}
