import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit } from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours
} from 'date-fns';

import { Subject, from } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView
} from 'angular-calendar';
import swal from 'sweetalert2';

import { MeetingHttpService } from 'src/app/meeting-http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import * as $ from 'jquery';
import { AppService } from 'src/app/app.service';
import { SocketService } from 'src/app/socket.service';
import { ToastrService } from 'ngx-toastr';


const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};
interface MyEvent extends CalendarEvent {
  location: string,
  adminName:string
}

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit {

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;
  viewDate: Date = new Date();


  modalData: {
    action: string;
    event: MyEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: MyEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: MyEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();
  public events:MyEvent[]= []; //: CalendarEvent[] 
  activeDayIsOpen: boolean = true;
  public pageUserId: String;
  public userDetails:any;
  public adminFlag:boolean;
  public userName : String;
  public meetingLocation = 'Select Meeting Location'
  public meetingLocationList = ['Meeting Room 1','Meeting Room 2','Meeting Room 3']
  public adminId:String;
  public adminName:String;
  public userInfo : any;
  public notificationList : any = [];

  constructor(private modal: NgbModal, private meetingHttpservice: MeetingHttpService,
    private _route: ActivatedRoute, private router: Router,private appService : AppService,public SocketService : SocketService,public toastr:ToastrService) {

  }

  ngOnInit() {
    this.pageUserId = this._route.snapshot.paramMap.get('userId');
    this.userName = this._route.snapshot.paramMap.get('userName');
    this.userInfo = this.appService.getUserInfoFromLocalStorage();
    this.adminId = Cookie.get('receiverId')
    this.adminName = Cookie.get('receiverName')
    console.log(this.pageUserId)
    this.updateCalendar()
    this.getNotificationFromAUser()

    // this.getUserName(this.pageUserId)
  }
//this function starts listening for events with alerts from back end
  //the event name is its own userid
  //the type of alert is changed depending on "job" key in the sent data
  //if job = new-meeting , it is an alert realted to new meeting
  //if job = alert, it is related to alert for scheduled meeting before 1 minute


  public getNotificationFromAUser:any = () => {
    this.SocketService.NotificationByUserId(this.userInfo.userId).subscribe((data) =>{
      (this.userInfo.userId == data.userId)?this.notificationList.push(data):"";
      console.log("Notification received")
      console.log(data)
      let timeString = new Date(data.start)
      if(data.job === 'new-meeting'){
      this.toastr.success(` New meeting created : ${data.title} scheduled at  : ${timeString}`);
      }
      else if(data.job === 'alert'){
        // this.toastr.warning(`You have a meeting in one minute. Purpose : ${data.title} `)
        const swalWithBootstrapButtons = swal.mixin({
          customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: false
        })
        
        swalWithBootstrapButtons.fire({
          title: 'You have meeting in one minute',
          text: `Meeting title :  ${data.title} `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Snooze',
          cancelButtonText: 'Dismiss!',
          reverseButtons: true
        }).then((result) => {
          if (result.value) {
            this.SocketService.snoozeAlert(data)
            swalWithBootstrapButtons.fire(
              'Snoozed!',
              'You will receive an alert in 10 sec',
              'success'
            )
          } else if (
            /* Read more about handling dismissals below */
            result.dismiss === swal.DismissReason.cancel
          ) {
            swalWithBootstrapButtons.fire(
              'Dismissed',
              'Meeting alert is dismissed :)',
              'error'
            )
          }
        })
       

      }
      setTimeout(() => {
        this.updateCalendar()
      }, 3000);
    })
  }

  getUserName(pageUserId){
    this.appService.getUserDetails(pageUserId).subscribe(
      data=> {
        this.userDetails = data['data']
        console.log("user details")
        console.log(data)
        this.userName = this.userDetails.firstName + " " + this.userDetails.lastName
      },
      error => {
        console.log("Some error occured")
        console.log(error)
      }
    )
  }




//this  function is used for adjusting the day view
  dayClicked({ date, events }: { date: Date; events: MyEvent[] }): void {
    console.log("day clicked")
    console.log(this.viewDate)
    console.log(date)
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }

    this.viewDate = date;
    this.view = CalendarView.Day;
  }
//change the view from week to day by clicking on week day header
  weekHeaderClicked(date) {
    this.viewDate = date;
    this.view = CalendarView.Day;
  }
 //this function is not being used for now
  //It is used to change the timings of meeting based on dragging of the meeting
  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map(iEvent => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd
        };
      }
      return iEvent;
    });
    console.log("time has changed or title has changed")
    console.log(this.events)
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: MyEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }
 //this function creates form for giving details about new meeting  

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true
        },
        location:'',
        adminName:''
      }
    ];
    console.log("add new event")
    console.log(this.events)
  }
  //this function deletes a meeting from database 
  deleteEvent(eventToDelete) {
    console.log("delete event")
    this.events = this.events.filter(event => event !== eventToDelete);
    this.meetingHttpservice.deleteMeeting(eventToDelete.meetingId).subscribe(
      data => {
        console.log("meeting deleted successfully")
        this.toastr.warning("Ticket deleted successfully")
      },
      error => {
        console.log("Some error occured")
        console.log(error)
      }
    )

    
    this.updateCalendar()
  }

  setView(view: CalendarView) {
    this.view = view;
    console.log("setView")
    console.log(this.events)
  }

  closeOpenMonthViewDay() {
    console.log("Close open month view")
    this.activeDayIsOpen = false;
  }

   //this function is used for saving an updated properties to the meeting 

  saveEvent(event) {
    console.log("Save event")
    console.log(event)
    let meetingData = event
    this.meetingHttpservice.editMeeting(meetingData.meetingId, meetingData).subscribe(
      data => {
        console.log(data['data'])
        this.toastr.success("Ticket edited successfully")
        this.updateCalendar()
      },
      error => {
        console.log("some error occured")
        console.log(error)
      }
    )
  }

  //this function is used to create a new meeting in database with event - not used in this component
  createEvent(event) {
    console.log("Create event")
    console.log(event)
    let meetingDetais = event
    meetingDetais.userId = this.pageUserId
    meetingDetais.userName = this.userName
    meetingDetais.adminId = this.adminId
    meetingDetais.adminName = this.adminName
    meetingDetais.location = this.meetingLocation
    this.meetingLocation = null
    // this.meetingHttpservice.createMeeting(
    //   meetingDetais
    // ).subscribe(
    //   data => {
    //     console.log("meeting created")
    //     console.log(data)
    //     console.log("update calendar start")
    //     this.updateCalendar()
        
    //     console.log("update calendar stop ")

    //   },
    //   error => {
    //     console.log("Some error occured")
    //     console.log(error)
    //   }
    // )


    this.SocketService.sendNewMeetingData(meetingDetais);
    
     $("#createButton").hide()
     setTimeout(() => {
      this.toastr.success("Ticket created successfully")
      this.updateCalendar()
    }, 3000);
    
  }

  //this function updates the visible calendar
  updateCalendar() {
    // this.getUserName()
    this.meetingHttpservice.getAllUserMeetings(this.pageUserId).subscribe(
      data => {
        console.log("get all event data")
        if (data['status'] != 200) {
          this.events = []
        }
        else {
          this.events = data['data']
          for (let event of this.events) {
            event.start = new Date(event.start)
            event.end = new Date(event.end)
            event.actions = this.actions
          }
          console.log("Received data")
          this.refresh.next()
        }
      },
      error => {
        // this.events = []
        console.log(error)
      }
    )
   
  }
}
