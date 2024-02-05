import { Component, Inject, OnInit, ViewChild, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SocketService } from '../Services/socket.service';

@Component({
  selector: 'app-group-chat-dialog',
  templateUrl: './group-chat-dialog.component.html',
  styleUrls: ['./group-chat-dialog.component.css']
})
export class GroupChatDialogComponent implements OnInit {
  @ViewChild('receivedMessageTone') receivedMessageTone: any;
  group:any;
  message: any;
  chatMessages:any=[]
  myId:any;
  groupMemberButton:any=false;
  myUserDataObject:any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data:{groupData:any},
    private SocketService:SocketService
  ){
    this.group=data.groupData;
    const userId=localStorage.getItem('userId')
    const groupMembers= this.group.members;
    groupMembers.forEach((member:any) => {
      if(member._id==userId){
        this.myUserDataObject=member;
      }
    });
  }

  ngOnInit(): void {
    this.myId=localStorage.getItem('userId')

    this.SocketService.receiveMessageFromGroup().subscribe((data:any)=>{
      if(data.groupId==this.group._id && data.senderId!=this.myId){
        this.chatMessages.push({ type: 'received', message: data.message, person: data.sendername });
        this.playReceivedMessageTone();
      }
    })
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

  showGroupMembers(){
    this.groupMemberButton=true;
  }

  sendMessage(message:any, groupId:any){
    this.chatMessages.push({ type: 'sent', message: this.message, person:this.myUserDataObject.username }); 
    this.SocketService.sendMessageToGroup(groupId, message);
  }
}
