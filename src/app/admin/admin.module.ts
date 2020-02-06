import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserlistComponent } from './userlist/userlist.component';
import { MeetingComponent } from './meeting/meeting.component';
import { RouterModule,Routes } from '@angular/router';
import {FormsModule,ReactiveFormsModule} from '@angular/forms'
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarModule } from 'angular-calendar';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { HomePageComponent } from './home-page/home-page.component'

@NgModule({
  declarations: [UserlistComponent, MeetingComponent, HomePageComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    MaterialModule,
    RouterModule.forChild([
      {path:'meeting/:userId/userName/:userName',component:MeetingComponent},
      {path:'users',component:UserlistComponent,pathMatch:'full'},
      {path:'home',component:HomePageComponent,pathMatch:'full'}
    ]),
    SharedModule,
    NgbModalModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ]
})
export class AdminModule { }
