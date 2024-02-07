import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '../Services/socket.service';

@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.css'],
})
export class ChatDialogComponent implements OnInit {
  @ViewChild('receivedMessageTone') receivedMessageTone: any;
  user: any;
  message: any;
  chatMessages: any = [];
  sentMessages: any = [];
  receivedMessages: any = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user: any },
    private SocketService: SocketService,
    private matDialogRef:MatDialogRef<ChatDialogComponent>,
    private dialog:MatDialog
  ) {
    this.user = data.user;
    console.log(this.user);
  }
  ngOnInit(): void {
    this.SocketService.connectToUser(this.user._id);

    const usersId = localStorage.getItem('userId');
    this.SocketService.receiveundeliverdmessage(usersId).subscribe(
      (data: any) => {
        
        //   if(data.result.sender==this.user._id){
        if (Array.isArray(data.result)) {
          data.result.forEach((element: any) => {
            if (element.sender == this.user._id) {
    const { dateNow, timeNow } = this.SocketService.currentDateAndTime();

              this.chatMessages.push({
                type: 'received',
                message: element.content,
                sender: element.sender,
                Time:timeNow,
                Date:dateNow
              });
              this.playReceivedMessageTone();
              console.log(`Elemnt:${element._id}`);
              //jo jo message push ho seen ho jy to us ko deleiverd true kro api create kro jo seen honay k bd messages ko deleiverd true kr dy r delete b kr dy
              this.SocketService.deleteMessageAfterSeen(element._id).subscribe(
                (response) => {
                  console.log(`deleted message response:  ${response}`);
                }
              );
            }
          });
        }

        // console.log(data)

        // }
      }
    );

    this.SocketService.receiveMessageFromUser().subscribe(
      (receivedData: any) => {
        console.log(`receivedMEssage Data ${receivedData.sender}`);
        // this.receivedMessages=receivedData.message
        console.log(
          `this is the id whic is being opened on chat diaglog ${this.user._id}`
        );
        if (receivedData.sender == this.user._id) {

          // this.dialog.open(ChatDialogComponent, {
          //   disableClose: true,
          //   data: {
          //     user: this.user,
          //   },
          // })
    const { dateNow, timeNow } = this.SocketService.currentDateAndTime();

          this.chatMessages.push({
            type: 'received',
            message: receivedData.message,
            sender: receivedData.sender,
            Date:dateNow,
            Time:timeNow
          });
          this.playReceivedMessageTone();
          // console.log(this.chatMessages)
        }
      }
    );

    
  }

  sendMessage(message: any, userId: any) {
    console.log(message);
    const { dateNow, timeNow } = this.SocketService.currentDateAndTime();
    // console.log('Date in component:', dateNow);
    // console.log('Time in component:', timeNow);
    this.SocketService.sendMessageToUser(userId, message);

    this.chatMessages.push({ type: 'sent', message: this.message ,Date:dateNow,Time:timeNow });

    // const usersId=localStorage.getItem('userId')
    // this.SocketService.receiveundeliverdmessage(usersId).subscribe((data:any)=>{
    //   if(data.result.sender==this.user._id){
    //     this.chatMessages.push({
    //       type: 'received',
    //       message: data.result.content,
    //       sender: data.result.sender,
    //     });
    //   }
    // })
    // console.log(message)
    this.message = '';
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
}
