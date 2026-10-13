import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface PreviewCardData {
  cardImageBase64: string;
  cardName: string;
}

@Injectable({ providedIn: 'root' })
export class CardPreviewService {

  private connection!: signalR.HubConnection;
  // private HUB_URL = `http://${window.location.hostname}:5555/hubs/cardpreview`;

  private HUB_URL = `http://${window.location.hostname}:5253/hubs/cardpreview`;

  cardData$    = new Subject<PreviewCardData>();
  cardLoading$ = new Subject<void>();
  cardClosed$  = new Subject<void>();
  isConnected$ = new BehaviorSubject<boolean>(false);

   constructor(private router: Router) {
    this.startConnection();
    this.listenForRouteChange();
  }

  private listenForRouteChange(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: any) => {
        // Card Print Enroll page chodte hi close signal bhejo
        if (!event.url.includes('/card-print-enroll')) {
          this.sendClose();
        }
      });
  }

  private startConnection(): void {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.HUB_URL)
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    this.connection.on('ReceivePreview', (data: PreviewCardData) => {
      this.cardData$.next(data);
    });

       this.connection.on('ReceiveLoading', () => {
      this.cardLoading$.next();
    });

    this.connection.on('ReceiveClose', () => {
      this.cardClosed$.next();
    });

    this.connection.onreconnected(() => this.isConnected$.next(true));
    this.connection.onreconnecting(() => this.isConnected$.next(false));
    this.connection.onclose(() => this.isConnected$.next(false));

    this.connection.start()
      .then(() => this.isConnected$.next(true))
      
      .catch(console.error);
  }

  sendPreview(card: PreviewCardData): void {
    if (this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.invoke('UpdatePreview', card);
    }
  }

  sendLoading(): void {
    if (this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.invoke('UpdateLoading');
    }
  }

  sendClose(): void {
    if (this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.invoke('ClosePreview');
    }
  }
  }
