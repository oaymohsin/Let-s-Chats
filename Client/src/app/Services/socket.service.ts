import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import io from 'socket.io-client';
import { ChatDialogComponent } from '../chat-dialog/chat-dialog.component';
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private userList: any = [];
  private socket: any;
  private serverUrl = 'http://localhost:3050';
  // private CurrentDateTime={}
  constructor(private HttpClient: HttpClient, private dialog: MatDialog) {
    this.connectToSocket();
    this.fetchAllUsers();
    console.log(this.userList)
    // this.currentDateAndTime()
    // this.openChatDialog('65aa96cef55a55e7b1d18f97');
  }

  getUsersList(){
    return this.userList
  }
  fetchAllUsers() {
    this.HttpClient.get('http://localhost:3050/api/user/getUsers').subscribe(
      (users: any) => {
        users.result.forEach((element:any) => {
        this.userList.push(element);
          
        });
        console.log(this.userList)
        // this.openChatDialog('65aa96cef55a55e7b1d18f97');
      }
    );
  }

  connectToSocket() {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        this.socket = io(this.serverUrl, {
          auth: {
            token: token,
          },
        });
        // this.fetchAllUsers()
        // Handle socket events or perform additional setup here
        // this.setupSocketEvents();
      } catch (error) {
        console.error('Error connecting to socket:', error);
      }
    } else {
      console.warn('Token is not available. Socket connection aborted.');
    }
  }
  disconnectFromSocket() {
    // Disconnect from the Socket.IO server
    this.socket.disconnect();
  }

  connectToUser(userId: string): void {
    this.socket.emit('connectToUser', userId);
  }

  sendMessageToUser(targetUserId: string, message: string): void {
    this.socket.emit('sendMessageToUser', { targetUserId, message });
  }

  receiveMessageFromUser(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('receiveMessageFromUser', (data: any) => {
        observer.next(data);
        setTimeout(() => {
        this.openChatDialog(data.sender)
          
        }, 500);
      });
    });
  }

  receiveundeliverdmessage(userId: any) {
    return this.HttpClient.get(
      `http://localhost:3050/api/messages/getMessages/${userId}`
    );
  }

  deleteMessageAfterSeen(messageId: any) {
    return this.HttpClient.delete(
      `http://localhost:3050/api/messages/deleteSeenMessage/${messageId}`
    );
  }

  openChatDialog(userId: any) {
    const filteredUser = this.userList.filter(
      (user: any) => user._id == userId
    );
    console.log(filteredUser);
    //   const dialogRef = this.dialog.open(ChatDialogComponent, {
    //     disableClose: true,
    //     data: { filteredUser },
    //   });
  }

  currentDateAndTime(){
    // Create a new Date object
const currentDate = new Date();

// Get the current date
const day = currentDate.getDate();
const month = currentDate.getMonth() + 1; // Months are zero-based
const year = currentDate.getFullYear();

// Get the current time
const hours = currentDate.getHours();
const minutes = currentDate.getMinutes();
const seconds = currentDate.getSeconds();

// Format the date and time
const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
const formattedTime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

// Display the result
// console.log('Current Date:', formattedDate);


// console.log('Current Time:', formattedTime);

return {
  dateNow:formattedDate,
  timeNow:formattedTime
}

  }

  createGroup(groupName:string,createdBy:string,members:any){
    const data={
      groupName:groupName,
      createdBy:createdBy,
      members:members
    }
  return this.HttpClient.post('http://localhost:3050/api/groups/createGroup',data);
  }
}
