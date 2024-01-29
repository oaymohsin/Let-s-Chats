import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SocketService } from '../Services/socket.service';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css']
})
export class CreateGroupComponent implements OnInit {
// @ViewChild ('groupform') groupform: any;
public groupform:FormGroup | any;
UsersList:any=[]

constructor( public formBuilder: FormBuilder, private socketService:SocketService){}

ngOnInit(): void {
  this.groupFormModel()

 const usersArray=this.socketService.getUsersList()
this.UsersList=usersArray
// this.UsersList.push(usersArray)
// console.log(this.UsersList)

}

groupFormModel(){
  this.groupform=this.formBuilder.group({
    groupName:new FormControl(''),
    // createdBy:new FormControl(''),
    members:new FormControl('')
  })
}
createGroup(){
  // console.log(this.groupform.value)

  const createdBy:any=localStorage.getItem('userId')

  //Geting ids of members because we have to send ids in backend
  const membersId:any=[];
  this.groupform.value.members.forEach((element:any) => {
    membersId.push(element._id)
  })

  const groupData={
    groupName:this.groupform.value.groupName,
    createdBy:createdBy,
    members:membersId
  }

  this.socketService.createGroup(groupData.groupName,groupData.createdBy,this.groupform.value.members).subscribe((data:any)=>{
    console.log(data)
  })
  // console.log(groupData)
}

}