import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-display.component.html',
  styleUrls: ['./card-display.component.scss']
})
export class CardDisplayComponent {

  @Input() card: any = null;
  @Input() cardType: string = 'pre-printed';
  @Input() contractorTemplate: string = '';
  @Input() currentCardTemplate: string = '';
  @Input() currentCardPhotoStyle: any = {};
  @Input() textFields: any = {};
  @Input() activeTextFields: string[] = [];

  get photoUrl(): string { return this.card?.photoUrl ?? this.card?.photoBase64 ?? ''; }

  private fieldValueResolvers: Record<string, (card: any) => string> = {
    idNumber:   c => c?.idNumber ?? '',
    shortname:  c => c?.name ?? '',
    csn:        c => c?.cardCSN ?? c?.cardDetails ?? '',
    building:   c => c?.building ?? '',
    bld:        c => c?.building ?? '',
    flatNumber: c => c?.flatNumber ?? '',
    nrd:        c => c?.neighbourhood ?? '',
    bloodGroup: c => c?.bloodGroup ?? '',
    validTill:  c => c?.validTill ? new Date(c.validTill).toLocaleDateString('en-IN') : '',
    custom1:    c => c?.company ?? '',
    custom2:    c => c?.agency ?? ''
  };

  getFieldValue(key: string): string {
    const resolver = this.fieldValueResolvers[key];
    return resolver ? resolver(this.card) : '';
  }
}