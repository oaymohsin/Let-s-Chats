import { Component, ElementRef, ViewChild } from '@angular/core';
import { UsersService } from 'src/app/Services/users.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
 @ViewChild('myform') myform!: ElementRef |any;

 constructor(private userService:UsersService){}

  onSubmit(){
    const username=this.myform.form.value.username;
    const email= this.myform.form.value.email;
    const password=this.myform.form.value.password;

    // console.log(this.myform.form.value)

    this.userService.createUser(username,email,password)
    .subscribe((response)=>{
      console.log(response)
    })
  }
}
