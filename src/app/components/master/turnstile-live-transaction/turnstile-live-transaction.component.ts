import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IdsControllerService, LiveTransaction } from 'src/app/services/ids-controller.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
interface ReaderInfo {
  id: number;
  code: string;
  readerip: string;
  readerport: string;
  readermode: string;
  readerLocation: string;
  readertype: string;
  isActive: boolean;
  isDeleted: boolean;
  nrdName: string;
  status: string;
}

@Component({
  selector: 'app-ids-controller',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnstile-live-transaction.component.html',
  styleUrls: ['./turnstile-live-transaction.component.scss']
})
export class TurnstileLiveTransactionComponent implements OnInit, OnDestroy {
  // private readonly READER_API = 'http://localhost:5555/api/Reader';

  private readonly READER_API = environment.apiurl + 'Reader';
  

  readers: ReaderInfo[] = [];
  selectedReaderCode = '';

  userId = 0;
  userName = '';
  cardNo = '';
  employeeId = '';
  activate = true;

  statusMessage = '';
  transactions: LiveTransaction[] = [];
  private sub?: Subscription;

  constructor(private svc: IdsControllerService, private http: HttpClient) {}

  ngOnInit() {
    this.loadReaders();

    this.svc.startConnection();
    this.sub = this.svc.liveTransaction$.subscribe(tx => {
      this.transactions.unshift(tx);
      if (this.transactions.length > 200) this.transactions.pop();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  loadReaders() {
    this.http.get<ReaderInfo[]>(this.READER_API).subscribe({
      next: (res) => {
        this.readers = res || [];
        if (this.readers.length > 0) {
          this.selectedReaderCode = this.readers[0].code;
        }
      },
      error: (err) => this.statusMessage = 'Could not load readers: ' + (err.message || err)
    });
  }

  selectReader(code: string) {
    this.selectedReaderCode = code;
  }

  getUser() {
    this.svc.getUser(this.selectedReaderCode, this.userId).subscribe({
      next: (res) => {
        this.userName = res.userName;
        this.cardNo = res.cardNo;
        this.employeeId = res.employeeID;
        this.activate = res.status;
        this.statusMessage = 'User fetched';
      },
      error: (err) => this.statusMessage = 'Error: ' + (err.error || err.message)
    });
  }

  saveUser() {
    this.svc.saveUser({
      readerCode: this.selectedReaderCode,
      userID: this.userId,
      userName: this.userName,
      cardNo: this.cardNo,
      employeeID: this.employeeId,
      activate: this.activate
    }).subscribe({
      next: () => this.statusMessage = 'Saved successfully',
      error: (err) => this.statusMessage = 'Error: ' + (err.error || err.message)
    });
  }

  openDoor() {
    this.svc.openDoor(this.selectedReaderCode).subscribe({
      next: () => this.statusMessage = 'Door Opened',
      error: (err) => this.statusMessage = 'Error: ' + (err.error || err.message)
    });
  }

  accessLogUpload() {
    this.svc.accessLogUpload(this.selectedReaderCode).subscribe({
      next: (res) => this.statusMessage = `Uploaded: ${res.count} users`,
      error: (err) => this.statusMessage = 'Error: ' + (err.error || err.message)
    });
  }

  accessLogDownload() {
    this.svc.accessLogDownload(this.selectedReaderCode).subscribe({
      next: () => this.statusMessage = 'Download triggered',
      error: (err) => this.statusMessage = 'Error: ' + (err.error || err.message)
    });
  }

  clearLog() {
    this.transactions = [];
  }
}