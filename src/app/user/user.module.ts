import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { SignupComponent } from './signup/signup.component';
import { RouterModule,Routes } from '@angular/router';
import {FormsModule,ReactiveFormsModule} from '@angular/forms'
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material/material.module';
import { HomeComponent } from '../home/home.component';
import { MeetingComponent } from '../admin/meeting/meeting.component';
import { HomePageComponent } from '../admin/home-page/home-page.component';



@NgModule({
  declarations: [ForgotPasswordComponent, LoginComponent, NewPasswordComponent, SignupComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    RouterModule.forChild([
      {path:'signup',component:SignupComponent,pathMatch:'full'},
      {path:'forgotPassword',component:ForgotPasswordComponent,pathMatch:'full'},
      {path:'response-reset-password/:resettoken',component:NewPasswordComponent}
      
    ]),
    ToastrModule.forRoot(),
    MaterialModule
  ]
})
export class UserModule { }
