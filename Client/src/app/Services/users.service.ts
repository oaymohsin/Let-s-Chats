import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private loginStatus = false;
  token: any = '';
  tokenTimer: any;
  loggedUserId:any;
  private authStatusListener = new Subject<boolean>();
  private loggedInUserId= new Subject<any>()
  constructor(
    private HttpClient: HttpClient,
    private socketService: SocketService,
    private router: Router
  ) {}

  getloginStatus() {
    return this.loginStatus;
  }
  getloggedInUserId(){
    return this.loggedInUserId.asObservable();
  }
  getauthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(username: string, email: string, password: string) {
    const userData = {
      username: username,
      email: email,
      password: password,
    };
    return this.HttpClient.post(
      'http://localhost:3050/api/user/signup',
      userData
    );
  }

  login(email: string, password: string) {
    const data = { email: email, password: password };

    this.HttpClient.post(
      'http://localhost:3050/api/user/login',
      data
    ).subscribe((response: any) => {
      console.log(response.userId)
      this.loggedInUserId.next(response.userId)
      this.loggedUserId=response.userId;
      this.token = response.token;
      const expireInDuration = response.expiresIn;
      this.setAuthTimer(expireInDuration);
      const now = new Date();
      const expirationDate = new Date(now.getTime() + expireInDuration * 1000);
      this.saveAuthData(this.token, expirationDate, response.userId);
      this.authStatusListener.next(true);
      this.socketService.connectToSocket();
    });
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  logOut() {
    this.token = null;
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
    this.authStatusListener.next(false);
    this.socketService.disconnectFromSocket();
    this.router.navigate(['../']);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    console.log(authInformation);
    if (!authInformation) {
      return;
    }

    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.token = authInformation.token;

      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      this.loginStatus = true;
    }
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logOut();
    }, duration * 1000);
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
    };
  }

  fetchAllUsers() {
    return this.HttpClient.get('http://localhost:3050/api/user/getUsers');
  }

  fetchMyGroups(id:any){
    return this.HttpClient.get('http://localhost:3050/api/groups/getGroupsById/'+ id)
  }
  
}
