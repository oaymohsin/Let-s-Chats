import { Component, Inject, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '../Services/socket.service';
import { UsersService } from '../Services/users.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-group-chat-dialog',
  templateUrl: './group-chat-dialog.component.html',
  styleUrls: ['./group-chat-dialog.component.css']
})
export class GroupChatDialogComponent implements OnInit,OnDestroy {
  @ViewChild('receivedMessageTone') receivedMessageTone: any;
  group:any;
  groupMembers:any=[]
  message: any;
  chatMessages:any=[]
  myId:any;
  private loggedInUserListener: Subscription | any;
  groupMemberButton:any=false;
  myUserDataObject:any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data:{groupData:any},
    private SocketService:SocketService,
    private userService:UsersService,
    private matDialogRef:MatDialogRef<GroupChatDialogComponent>,
    private dialog:MatDialog
  ){
    this.group=data.groupData;

    

   
    
  }

  ngOnInit(): void {

    const userId=localStorage.getItem('userId')
    const groupMembers= this.group.members;
    groupMembers.forEach((member:any) => {
      console.log(member)
      if(member._id==userId){
        this.myUserDataObject=member;
      }
    });
    // console.log(`ab dekho bhla ${this.userService.loggedUserId}`)
    // this.myId=this.userService.loggedUserId

    //this oberservable is not working dont know why
    this.loggedInUserListener=this.userService.getloggedInUserId().subscribe((id)=>{
      // this.myId=id;
      console.log(`My id is ${id}`)
    })
    
    this.myId=localStorage.getItem('userId')
    console.log(this.myId)

    this.SocketService.receiveMessageFromGroup().subscribe((data:any)=>{
      if(data.groupId==this.group._id && data.senderId!=this.myId){
        this.chatMessages.push({ type: 'received', message: data.message, person: data.sendername });
        this.playReceivedMessageTone();
      }
    })
  }

  ngOnDestroy(): void {
    this.loggedInUserListener.unsubscribe();
  }


  playReceivedMessageTone() {
    // Check if the template reference variable is defined
    const playSentTone=()=>{
      
    }

    if (this.receivedMessageTone) {
      // Access the native audio element using the template reference variable
      const audioElement: HTMLAudioElement = this.receivedMessageTone.nativeElement;

      // Check if the audio element is found and supported
      if (audioElement && typeof audioElement.play === 'function') {
        // Play the received message tone
        audioElement.play().catch(error => {
          console.error('Error playing received message tone:', error);
        });
      }
    }
  }

  showGroupMembers(groupId:any){
    this.SocketService.fetchGroupMembers(groupId).subscribe((result:any)=>{
      this.groupMembers=result.members
      // console.log(this.groupMembers)

    })
    this.groupMemberButton=true;
  }

  sendMessage(message:any, groupId:any){
    this.chatMessages.push({ type: 'sent', message: this.message, person:this.myUserDataObject.username }); 
    this.SocketService.sendMessageToGroup(groupId, message);
  }

  deleteGroup(groupId:any){
    this.SocketService.deleteGroup(groupId).subscribe((data:any)=>{
      console.log(data)
      if(data.result==true){
        this.matDialogRef.close()
      }
    })
  }

  makeAdmin(memberId:any,groupId:any){
    this.SocketService.makeGroupAdmin(groupId,memberId).subscribe((data:any)=>{
      console.log(data.message)
      this.showGroupMembers(groupId)

    })
  }

  removeAdmin(memberId:any,groupId:any){
    this.SocketService.removeGroupAdmin(groupId,memberId).subscribe((data:any)=>{
      console.log(data.message)
      this.showGroupMembers(groupId)
    

    })
    // this.group=data.groupData;
  }

  leaveGroup(groupId:any,userId:any){
    this.SocketService.leaveGroup(groupId,userId).subscribe((data:any)=>{
      console.log(data)
      this.showGroupMembers(groupId)
    })
  }
}
