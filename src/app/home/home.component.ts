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

import { MeetingHttpService } from 'src/app/meeting-http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import * as $ from 'jquery';
import { AppService } from 'src/app/app.service';


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
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();
  public events: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;
  public pageUserId: String;
  public userDetails:any;
  public adminFlag:boolean;
  public userName : String;

  constructor(private modal: NgbModal, private meetingHttpservice: MeetingHttpService,
    private _route: ActivatedRoute, private router: Router,private appService : AppService) { }

  ngOnInit() {
    this.pageUserId = Cookie.get('receiverId')
    this.userName = Cookie.get('receiverName')
    this.updateCalendar()
  }
//this component is not being used in the project

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


  weekHeaderClicked(date) {
    this.viewDate = date;
    this.view = CalendarView.Day;
  }

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
        }
      }
    ];
    console.log("add new event")
    console.log(this.events)
  }

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

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }
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
          
          
        }
      },
      error => {
        // this.events = []
        console.log(error)
      }
    )
    $("#monthView").refresh()
  }

}
