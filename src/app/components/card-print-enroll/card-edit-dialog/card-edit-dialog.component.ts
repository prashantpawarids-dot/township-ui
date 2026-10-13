import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-card-edit-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatTableModule
  ],
  templateUrl: './card-edit-dialog.component.html',
  styleUrls: ['./card-edit-dialog.component.scss']
})
export class CardEditDialogComponent {

  accessPointColumns = ['id', 'accessPoint', 'action'];

  textFields:            any    = {};
  activeTextFields:      string[] = [];
  contractorTemplate:    string = '';
  currentCardTemplate:   string = '';
  currentCardPhotoStyle: any    = {};

  constructor(
    public dialogRef: MatDialogRef<CardEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService
  ) {
    this.textFields            = data.textFields            ?? {};
    this.activeTextFields      = data.activeTextFields      ?? [];
    this.contractorTemplate    = data.contractorTemplate    ?? '';
    this.currentCardTemplate   = data.currentCardTemplate   ?? '';
    this.currentCardPhotoStyle = data.currentCardPhotoStyle ?? {};
  }

 printCard(): void {
    const tmplUrl = this.data.holderType === 'Contractor'
      ? this.contractorTemplate
      : this.currentCardTemplate;

    if (!tmplUrl) {
      alert('No card template available to print.');
      return;
    }

    const cardImg = new Image();
    cardImg.crossOrigin = 'anonymous';
    cardImg.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = cardImg.naturalWidth;
      canvas.height = cardImg.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(cardImg, 0, 0);

      const drawTextAndOpen = () => {
        const cw = canvas.width;
        const ch = canvas.height;
        ctx.textAlign = 'center';

        this.activeTextFields.forEach((key: string) => {
          const f = this.textFields[key];
          if (!f) return;
          let text = '';
          if (key === 'name')      text = this.data.cardHolder;
          if (key === 'building')  text = `${this.data.building} - ${this.data.flatNumber}`;
          if (key === 'idNumber')  text = `ID: ${this.data.idNumber}`;
          if (key === 'validity')  text = `Validity - ${this.data.validTill ? new Date(this.data.validTill).toLocaleDateString('en-IN') : '—'}`;
          if (key === 'company')   text = `Company - ${this.data.company || '—'}`;
          if (key === 'cardNo')    text = `Card No - ${this.data.idNumber || '—'}`;
          if (key === 'agency')    text = `Agency - ${this.data.agency || '—'}`;
          if (!text) return;
          ctx.fillStyle = f.color;
          ctx.font = `${f.bold ? 'bold' : 'normal'} ${Math.round(cw * f.size)}px Segoe UI, sans-serif`;
          ctx.fillText(text, cw * (f.x / 100), ch * (f.y / 100));
        });

        const frontBase64 = canvas.toDataURL('image/jpeg', 0.95);
        this.openPrintWindow(frontBase64);
      };

      if (this.data.photoUrl) {
        const photoImg = new Image();
        photoImg.crossOrigin = 'anonymous';
        photoImg.onload = () => {
          const style = this.currentCardPhotoStyle;
          const pTop    = parseFloat(style['top'])    || 0;
          const pLeft   = parseFloat(style['left'])   || 0;
          const pWidth  = parseFloat(style['width'])  || 0;
          const pHeight = parseFloat(style['height']) || 0;
          const px = canvas.width  * (pLeft   / 100);
          const py = canvas.height * (pTop    / 100);
          const pw = canvas.width  * (pWidth  / 100);
          const ph = canvas.height * (pHeight / 100);
          ctx.drawImage(photoImg, px, py, pw, ph);
          drawTextAndOpen();
        };
        photoImg.onerror = () => drawTextAndOpen();
        photoImg.src = this.data.photoUrl;
      } else {
        drawTextAndOpen();
      }
    };
    cardImg.onerror = () => alert('Failed to load card template for printing.');
    cardImg.src = tmplUrl;
  }

  private openPrintWindow(frontBase64: string): void {
    const w = window.open('', '_blank', 'width=420,height=720');
    if (!w) return;

    w.document.write(`
      <!DOCTYPE html><html><head>
      <title>ID Card — ${this.data.cardHolder}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #ccc; display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 14px; font-family: 'Segoe UI', sans-serif; }
        @page { size: 54mm 86mm; margin: 0; }
        @media print {
          html { width: 54mm; margin: 0; padding: 0; }
          body { width: 54mm; margin: 0; padding: 0; background: white !important; display: block !important; }
          .no-print { display: none !important; }
          .front-page { display: block; width: 54mm; height: 86mm; overflow: hidden; }
          .card-img { display: block !important; width: 54mm !important; height: 86mm !important; object-fit: fill !important; border-radius: 0 !important; box-shadow: none !important; }
        }
        .front-page { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%; }
        .card-img { width: 270px; border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.3); display: block; }
        .btn-row { display: flex; gap: 10px; margin-top: 6px; }
        .btn { padding: 10px 24px; border: none; border-radius: 7px; cursor: pointer; font-size: 13px; font-weight: 700; }
        .btn-print { background: #00c9a7; color: #061520; }
        .btn-close { background: #3d8ef8; color: #fff; }
      </style>
      </head>
      <body>
        <div class="front-page">
          <img class="card-img" src="${frontBase64}" alt="Card Front" />
        </div>
        <div class="btn-row no-print">
          <button class="btn btn-print" onclick="window.print()">🖨️ Print Card</button>
          <button class="btn btn-close" onclick="window.close()">✕ Close</button>
        </div>
      </body></html>
    `);
    w.document.close();
  }
  // saveAndPrint(): void {
  //   this.authService.updateCardCSN({
  //     IDNumber: this.data.idNumber,
  //     CardCSN:  this.data.cardCSN ?? ''
  //   }).subscribe({
  //     next: () => {
  //       alert('✅ Card CSN updated successfully!');
  //       this.dialogRef.close(true);
  //     },
  //     error: (err) => {
  //       alert('❌ Failed to update: ' + err.message);
  //     }
  //   });
  // }

  // blockAccessPoint(id: number): void {
  //   if (confirm(`Block access point ID ${id}?`)) {
  //     this.data.accessPoints = this.data.accessPoints.filter((ap: any) => ap.id !== id);
  //   }
  // }

  close(): void { this.dialogRef.close(false); }
}