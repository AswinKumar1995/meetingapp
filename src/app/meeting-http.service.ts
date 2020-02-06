import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {Cookie} from 'ng2-cookies/ng2-cookies'
import {HttpClient,HttpHeaders, HttpParams, HttpErrorResponse, HttpBackend} from '@angular/common/http'



@Injectable({
  providedIn: 'root'
})
export class MeetingHttpService {
  private basrUrl = "http://localhost:3000/api/v1/meetings";
  // private basrUrl = "http://api.kiddify.co.in/api/v1/meetings";
  public allMeetings;

  constructor(private http:HttpClient) {
    console.log("meeting http is called")
   }
//extract all meetings of that user
   public getAllUserMeetings(userId):any{
     let myResponse = this.http.get(this.basrUrl + "/"+userId + "/all")
     console.log(myResponse)
     return myResponse
   }
//create new meeting
   public createMeeting(meetingData):any{
     let data = {};
     let myResponse = this.http.post(this.basrUrl+"/create",meetingData)
     console.log(myResponse)
     return myResponse
   }
//update the meeting details
   public editMeeting(meetingId,meetingData):any{
    let data = {};
    let myResponse = this.http.put(this.basrUrl+"/"+meetingId+"/edit",meetingData)
    console.log(myResponse)
    return myResponse
   }
//delete a meeting
   public deleteMeeting(meetingId):any{
    let data = {}
    let myResponse = this.http.post(this.basrUrl+"/"+meetingId+"/delete",data)
    console.log(myResponse)
    return myResponse
   }

}
