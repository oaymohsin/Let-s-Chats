import { Component, OnInit } from '@angular/core';
import { UsersService } from './Services/users.service';
import { SocketService } from './Services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Client';

  constructor(private userService:UsersService,
    private SocketService:SocketService
    ){}

  ngOnInit(): void {
    this.userService.autoAuthUser()
    // this.SocketService.receiveMessageFromUser().subscribe((receivedData:any)=>{
    //   console.log(`receivedMEssage Data ${receivedData.message}`)
    //   // this.recievedMessages=receivedData.message


    // })
    // console

    const usersId=localStorage.getItem('userId')
    // this.SocketService.receiveundeliverdmessage(usersId).subscribe((data:any)=>{
      // if(data.result.sender==this.user._id){
      //   this.chatMessages.push({
      //     type: 'received',
      //     message: data.result.content,
      //     sender: data.result.sender,
      //   });
      // }
      // console.log(data)
    // })
  }
}
