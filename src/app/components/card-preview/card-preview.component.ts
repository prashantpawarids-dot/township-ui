import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardPreviewService } from '../../services/card-preview.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.scss']
})
export class CardPreviewComponent implements OnInit, OnDestroy {

  cardImageBase64: string = '';
  cardName: string = '';
  isConnected = false;
  isLoading = true;
  private subs: Subscription[] = [];

  constructor(private previewService: CardPreviewService) {}

  ngOnInit(): void {
    this.subs.push(
      this.previewService.cardData$.subscribe(data => {
        if (!data) return;
        this.isLoading = false;
        this.cardImageBase64 = data.cardImageBase64 || '';
        this.cardName = data.cardName || '';
      })
    );

   this.subs.push(
      this.previewService.isConnected$.subscribe(c => this.isConnected = c)
    );

        this.subs.push(
      this.previewService.cardLoading$.subscribe(() => this.isLoading = true)
    );

    this.subs.push(
      this.previewService.cardClosed$.subscribe(() => {
        this.cardImageBase64 = '';
        this.cardName = '';
        this.isLoading = false;
      })
    );

    setTimeout(() => this.isLoading = false, 3000);
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  goFullscreen(): void { document.documentElement.requestFullscreen?.(); }
}