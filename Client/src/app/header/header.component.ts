import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsersService } from '../Services/users.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChatDialogComponent } from '../chat-dialog/chat-dialog.component';
import { SocketService } from '../Services/socket.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  loginStatus: any = false;
  private authListenerSubs: Subscription | any;
  UsersList: any = [];
  openedDialogList:any=[]
  myGroups:any=[]  
  myId:any;
  constructor(private userService: UsersService,
     private dialog: MatDialog,
     private socketService:SocketService) {}

  ngOnInit(): void {
    // console.log(this.userService.getloginStatus())
    this.socketService.connectToSocket()
    this.loginStatus = this.userService.getloginStatus();

    this.authListenerSubs = this.userService
      .getauthStatusListener()
      .subscribe((Response) => {
        this.loginStatus = Response;
      });
    // console.log(this.loginStatus)
    // const token=localStorage.getItem("token")
    // if (token){
    //   this.loginStatus=true
    // }
    // console.log(this.loginStatus);
  }

  logOut() {
    this.userService.logOut();
    // this.loginStatus=false;
  }
  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe();
  }

  fetchUsers() {
    this.userService.fetchAllUsers().subscribe((users: any) => {
      this.UsersList = users.result;
      // console.log(this.UsersList)
    });
  }

  openChatDialog(user: any) {
    const dialogPosition = { bottom: '170px', right: '20px' };
  
    if (this.openedDialogList.length > 0) {
      // Calculate the total horizontal offset based on existing dialogs
      let totalOffset = 0;
      for (let i = 0; i < this.openedDialogList.length; i++) {
        totalOffset += 560; // Adjust based on dialog width and spacing
      }
      dialogPosition.right = `${totalOffset}px`;
    }
  
    const dialogRef = this.dialog.open(ChatDialogComponent, {
      disableClose: true,
      width: '500', // Adjust as needed
      position: dialogPosition,
      hasBackdrop: false,
      data: { user },
    });
  
    this.openedDialogList.push(user._id);
  
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog Result: ${result}`);
      this.openedDialogList = this.openedDialogList.filter((id: any) => id !== user._id);
    });
  
    this.socketService.connectToUser(user._id);
  }
  
  createGroup(){
  }

  fetchGroups(){
    const myId=localStorage.getItem('userId')
    this.myId=myId;
    this.userService.fetchMyGroups(myId).subscribe((result:any)=>{
      this.myGroups=result.data;
      console.log(this.myGroups)
    })
  }
  openGroupDialog(group:any){}
}
