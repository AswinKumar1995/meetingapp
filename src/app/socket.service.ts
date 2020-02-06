import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Observable } from 'rxjs';
import { HttpClient,HttpHeaders, HttpParams,HttpErrorResponse } from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class SocketService {

   private url = "http://localhost:3000";
  // private url = "http://api.kiddify.co.in"
  private socket;

  constructor(public http : HttpClient) { 
    this.socket = io(this.url);
  }
//check for user
  public verifyUser = () => {
    return Observable.create((observer) => {
      this.socket.on('verifyUser',(data) => {
        observer.next(data);
      })//end socket
    })//end observable
  }// end verify user
//update online user list
  public onlineUserList = () => {
    return Observable.create((observer) => {
      this.socket.on('online-user-list',(userList) => {
        observer.next(userList);
      })
    })
  }
//check for disconnected socket
  public disconnectedSocket = () => {
    return Observable.create((observer) => {
      this.socket.on('disconnect',() => {
        observer.next();
      });
    });
  }
//check for user validity with auth token
  public setUser = (authToken) => {
    this.socket.emit('set-user',authToken);
  }
//emit snooze event to trigger the same alert after 10 sec
  public snoozeAlert = (data) => {
    this.socket.emit('snooze-alert',data)
  }

//update new meeting data in db thorugh event emitter
  public sendNewMeetingData = (meetingData) => {
    this.socket.emit('new-meeting',meetingData)
  }
  //exit the socket
  public exitSocket = () => {
    this.socket.disconnect();
  }
//receive the notification from backend
  public NotificationByUserId = (userId) => {
    return Observable.create((observer) => {
      this.socket.on(userId,(data) => {
        observer.next(data)
      });

    })
  };

  private handleError(err:HttpErrorResponse) {
    let errorMessage = ''
    if(err.error instanceof Error) {
      errorMessage = "some error occured :" + err.error.message; 
    }
    else {

      errorMessage = `Server returned code : ${err.status} error is ${err.error.message}`
    }
    console.log(errorMessage);
    return Observable.throw(errorMessage);
  }

}
