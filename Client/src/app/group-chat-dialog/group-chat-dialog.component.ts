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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data:{groupData:any},
    private SocketService:SocketService
  ){
    this.group=data.groupData;
  }

  ngOnInit(): void {
    
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

  sendMessage(message:any, groupId:any){}
}
