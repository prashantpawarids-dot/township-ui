import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface LiveTransaction {
  code: string;
  detail: string;
  time: string;
}

@Injectable({ providedIn: 'root' })
export class IdsControllerService {
    private baseUrl = environment.apiurl + 'IDSsemac';
  private hubUrl = environment.apiurl.replace('/api/', '') + '/hubs/transactions';
  private hubConnection!: signalR.HubConnection;

  liveTransaction$ = new Subject<LiveTransaction>();
  controllerStatus$ = new Subject<{ code: string; status: string }>();

  constructor(private http: HttpClient) {}

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('LiveTransaction', (data: LiveTransaction) => {
      this.liveTransaction$.next(data);
    });

    this.hubConnection.on('ControllerStatus', (data: any) => {
      this.controllerStatus$.next(data);
    });

    this.hubConnection.start().catch(err => console.error('SignalR connect error:', err));
  }

  getUser(readerCode: string, userId: number) {
    return this.http.get<any>(`${this.baseUrl}/getuser`, { params: { readerCode, userId } });
  }

  saveUser(dto: { readerCode: string; userID: number; userName: string; cardNo: string; employeeID: string; activate: boolean }) {
    return this.http.post<any>(`${this.baseUrl}/saveuser`, dto);
  }

  openDoor(readerCode: string) {
    return this.http.post<any>(`${this.baseUrl}/opendoor`, null, { params: { readerCode } });
  }

  accessLogUpload(readerCode?: string) {
    return this.http.post<any>(`${this.baseUrl}/accesslogupload`, null, { params: readerCode ? { readerCode } : {} });
  }

  accessLogDownload(readerCode: string) {
    return this.http.post<any>(`${this.baseUrl}/accesslogdownload`, null, { params: { readerCode } });
  }
}