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

import swal from 'sweetalert2';


import { Subject, from } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView
} from 'angular-calendar';

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
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  

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

  //actions are used for showing modals while clicking on edit or delete button

  refresh: Subject<any> = new Subject();
  public events : MyEvent[]= [];
  activeDayIsOpen: boolean = true;
  public pageUserId: String;
  public userDetails: any;
  public adminFlag: boolean;
  public userName: String;
  public homePageFlag : boolean;
  public authToken : any;
  public userInfo : any;
  public userList : any = [];
  public disconnectedSocket : boolean;
  public notificationList : any = [];

  constructor(private modal: NgbModal, private meetingHttpservice: MeetingHttpService,
    private _route: ActivatedRoute, private router: Router, private appService: AppService,
    public SocketService:SocketService, public toastr:ToastrService) { }

  ngOnInit() {
    this.pageUserId = Cookie.get('receiverId')
    this.authToken = Cookie.get('authToken')
    this.userName = Cookie.get('receiverName')
    this.userInfo = this.appService.getUserInfoFromLocalStorage();
    console.log(this.userInfo)
    this.homePageFlag = true
    this.checkStatus()
    this.verifyConfirmation();
    this.getNotificationFromAUser();
    this.updateCalendar()
    
    // this.view = CalendarView.Month;
  }

  //this function starts listening for events with alerts from back end
  //the event name is its own userid
  //the type of alert is changed depending on job
  //if job = new-meeting , it is an alert realted to new meeting
  //if job = alert, it is related to alert for scheduled meeting before 1 minute
  public getNotificationFromAUser:any = () => {
    this.SocketService.NotificationByUserId(this.userInfo.userId).subscribe((data) =>{
      (this.pageUserId == data.userId)?this.notificationList.push(data):"";
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

  //this function checks for authToken stored in cookies

  public checkStatus = () => {
    if(Cookie.get('authToken') === undefined || Cookie.get('authToken') === '' || Cookie.get('authToken') === null ){
      this.router.navigate(["/"]);
      return false;
    }
    else {
      return true;
    }
  }
//this function checks for validity of  authToken from database

  public verifyConfirmation:any = () => {
    this.SocketService.verifyUser().subscribe((data) => {
      this.disconnectedSocket = false;
      this.SocketService.setUser(this.authToken);
      this.getOnlineUserList();
  
    })
  }

//this function check the online users and updates in redis database
  public getOnlineUserList = () => {
    this.SocketService.onlineUserList().subscribe((userList) => {
  
      this.userList = [];
      for (let x in userList) {
        let temp = {'userId':x,'name':userList[x],'unread':0,'chatting':false};
        this.userList.push(temp);
      }
      console.log(this.userList);
    })
  
  }



//this function is trigger when a day is clicked on the calendar


  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
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

  //this changes the view from week to day on clicking of header

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

  //this function creates form for giving details about new meeting  - not used in this component

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

  //this function deletes a meeting from database  - not used in this component

  deleteEvent(eventToDelete) {
    console.log("delete event")
    this.events = this.events.filter(event => event !== eventToDelete);
    this.meetingHttpservice.deleteMeeting(eventToDelete.meetingId).subscribe(
      data => {
        console.log("meeting deleted successfully")
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

  //this function is used for saving an updated to the meeting  - not used in this component

  saveEvent(event) {
    console.log("Save event")
    console.log(event)
    let meetingData = event
    this.meetingHttpservice.editMeeting(meetingData.meetingId, meetingData).subscribe(
      data => {
        console.log(data['data'])
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
    meetingDetais.adminId = Cookie.get('receiverId')
    this.meetingHttpservice.createMeeting(
      meetingDetais
    ).subscribe(
      data => {
        console.log("meeting created")
        console.log(data)
        console.log("update calendar start")
        this.updateCalendar()

        console.log("update calendar stop ")

      },
      error => {
        console.log("Some error occured")
        console.log(error)
      }
    )

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

          // this.router.navigate(['meeting',this.pageUserId])
        }
      },
      error => {
        // this.events = []
        console.log(error)
      }
    )

    $("#createButton").hide()

  }
//it is used to show data on modals
  handleEvent(action: string, event: MyEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }
  // this is used to updated the calendar based on alerts
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
            //  event.actions = this.actions
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
    // $("#monthView").refresh()
  }

  testButton(){
    // swal.fire('Test')
    const swalWithBootstrapButtons = swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })
    swal.fire('Test')
    swal.fire({
      title: 'You have meeting in one minute',
      text: `Meeting title :  `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Snooze',
      cancelButtonText: 'Dismiss!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        swal.fire(
          'Snoozed!',
          'You will receive an alert in 10 sec',
          'success'
        )
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === swal.DismissReason.cancel
      ) {
        swal.fire(
          'Dismissed',
          'Meeting alert is dismissed :)',
          'error'
        )
      }
    })




  }


}
