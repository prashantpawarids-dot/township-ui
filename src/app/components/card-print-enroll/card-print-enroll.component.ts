// CHANGES: Added AuthService import + injection, updated loadNeighbourhoods() and loadBuildings() to use real API

import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CardPrintEnroll, CardSearchFilter } from '../../models/common.model';
import { CardEditDialogComponent } from './card-edit-dialog/card-edit-dialog.component';
import { AuthService } from '../../services/auth.service'; // ← ADDED

@Component({
  selector: 'app-card-print-enroll',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatSelectModule, MatInputModule,
    MatButtonModule, MatCheckboxModule, MatRadioModule,
    MatDialogModule, MatFormFieldModule, MatIconModule,
    ImageCropperComponent
  ],
  templateUrl: './card-print-enroll.component.html',
  styleUrls: ['./card-print-enroll.component.scss']
})
export class CardPrintEnrollComponent implements OnInit {

  displayedColumns = ['idNumber', 'name', 'building', 'flatNumber', 'cardDetails', 'neighbourhood', 'action'];
  cardHolders: CardPrintEnroll[] = [];
  selectedCard: CardPrintEnroll | null = null;
  neighbourhoods: any[] = [];
  buildings: any[] = [];
  allBuildings: any[] = [];
  filter: CardSearchFilter = new CardSearchFilter();

  searchOptions = [
    { value: 'Name',         label: 'Name' },
    { value: 'IDnumber',     label: 'IDnumber' },
    { value: 'flatnumber',   label: 'flatnumber' },
    { value: 'Building_NRD', label: 'Building, NRD' },
    { value: 'CardCSN',      label: 'CardCSN' }
  ];

  cardType: 'pre-printed' | 'blank' = 'pre-printed';
  cardHolderNo: string = '';
  cardCSN: string = '';
  cardHolderName: string = '';
  buildingFlatNo: string = '';
  neighbourhoodDisplay: string = '';

  // ── Pagination ────────────────────────────────────────────────
pageSize: number = 10;
currentPage: number = 1;
totalRecords: number = 0;
pagedCardHolders: CardPrintEnroll[] = [];

// ── Issue Card Toggle ─────────────────────────────────────────
showIssueForm: boolean = false;

  // ── Camera Modal State ────────────────────────────────────────
  showCameraModal: boolean = false;
  cameraActive: boolean = false;
  videoStream: MediaStream | null = null;
  capturedImage: string = '';
  croppedImage: string = '';
  cardNoForPhoto: string = '';
  uploadedImagePreview: string = '';
  imageChangedEvent: Event | null = null;
  imageToCrop: string = '';
  croppedResult: string = '';
  showCropper: boolean = false;

  // ── Card Template Config ──────────────────────────────────────
  private cardTemplates: Record<string, {
    front: string; back: string;
    photoTop: number; photoLeft: number;
    photoWidth: number; photoHeight: number;
  }> = {
    'LandOwner':       { front: 'assets/cards/LandOwner.jpeg',       back: 'assets/cards/PLandowner.jpg',    photoTop: 22, photoLeft: 18, photoWidth: 56, photoHeight: 34 },
    'Resident':        { front: 'assets/cards/Resident.jpeg',         back: 'assets/cards/PResident.jpeg',   photoTop: 21, photoLeft: 22, photoWidth: 54, photoHeight: 34 },
    'DResident':       { front: 'assets/cards/DResident.jpeg',        back: 'assets/cards/PResident.jpeg',   photoTop: 21, photoLeft: 22, photoWidth: 54, photoHeight: 34 },
    'Tenant':          { front: 'assets/cards/Tenant.jpeg',           back: 'assets/cards/PTenant.jpg',      photoTop: 22, photoLeft: 18, photoWidth: 56, photoHeight: 34 },
    'DTenant':         { front: 'assets/cards/DTenant.jpg',           back: 'assets/cards/PTenant.jpg',      photoTop: 20, photoLeft: 18, photoWidth: 56, photoHeight: 34 },
    'Employee':        { front: 'assets/cards/Employee.jpg',          back: 'assets/cards/EmployeeBack.jpg', photoTop: 20, photoLeft: 18, photoWidth: 56, photoHeight: 34 },
    'ServiceProvider': { front: 'assets/cards/ServiceProvider.jpeg',  back: 'assets/cards/SProvider.jpg',    photoTop: 20, photoLeft: 18, photoWidth: 56, photoHeight: 34 },
    'Guest':           { front: 'assets/cards/Guest.jpeg',            back: 'assets/cards/CardBorder.png',   photoTop: 21, photoLeft: 22, photoWidth: 54, photoHeight: 34 },
  };

  get currentCardTemplate(): string {
    if (!this.selectedCard) return '';
    const tmpl = (this.cardTemplates as any)[this.selectedCard.holderType ?? 'Resident']
               ?? this.cardTemplates['Resident'];
    return tmpl.front;
  }

  get currentCardPhotoStyle(): any {
    if (!this.selectedCard) return {};
    const tmpl = (this.cardTemplates as any)[this.selectedCard.holderType ?? 'Resident']
               ?? this.cardTemplates['Resident'];
    return {
      'position':  'absolute',
      'top':       tmpl.photoTop    + '%',
      'left':      tmpl.photoLeft   + '%',
      'width':     tmpl.photoWidth  + '%',
      'height':    tmpl.photoHeight + '%',
    };
  }

  // ── Hardcoded Card Holder Data (API not yet available) ────────
  private rawData: CardPrintEnroll[] = [
    { idNumber: '100001', name: 'Dilip Shendge',     building: 'Falcon-B', flatNumber: 'B-906',  cardDetails: '6074271',        cardCSN: '6074271',        neighbourhood: 'Falcon Towers', isPrinted: true,  isPersonalised: true,  photoUrl: '', holderType: 'Resident'        },
    { idNumber: '100002', name: 'Ntrial Trial',       building: 'Falcon-E', flatNumber: '1102',   cardDetails: '10049530072345', cardCSN: '10049530072345', neighbourhood: 'Falcon Towers', isPrinted: false, isPersonalised: false, photoUrl: '', holderType: 'LandOwner'       },
    { idNumber: '100003', name: 'Rajendra Shinde',    building: 'Falcon-A', flatNumber: 'A-1806', cardDetails: '3466786',        cardCSN: '3466786',        neighbourhood: 'Falcon Towers', isPrinted: true,  isPersonalised: true,  photoUrl: '', holderType: 'Tenant'          },
    { idNumber: '100004', name: 'Maheshkumar Jadhav', building: 'Falcon-D', flatNumber: 'D-804',  cardDetails: '5150607',        cardCSN: '5150607',        neighbourhood: 'Falcon Towers', isPrinted: true,  isPersonalised: false, photoUrl: '', holderType: 'Employee'        },
    { idNumber: '100005', name: 'Kaka Thorat',        building: 'Falcon-F', flatNumber: 'F-908',  cardDetails: '16598543',       cardCSN: '16598543',       neighbourhood: 'Falcon Towers', isPrinted: false, isPersonalised: false, photoUrl: '', holderType: 'Guest'           },
    { idNumber: '100006', name: 'Saurabh Sharma',     building: 'Falcon-C', flatNumber: 'C-1808', cardDetails: '36575',          cardCSN: '36575',          neighbourhood: 'Falcon Towers', isPrinted: true,  isPersonalised: true,  photoUrl: '', holderType: 'DResident'       },
    { idNumber: '100007', name: 'Shantilal Jain',     building: 'Falcon-D', flatNumber: 'D-904',  cardDetails: '',              cardCSN: '',               neighbourhood: 'Falcon Towers', isPrinted: false, isPersonalised: false, photoUrl: '', holderType: 'Resident'        },
    { idNumber: '100008', name: 'Prashant Singh',     building: 'Falcon-B', flatNumber: 'B-1804', cardDetails: '4135967',        cardCSN: '4135967',        neighbourhood: 'Falcon Towers', isPrinted: true,  isPersonalised: true,  photoUrl: '', holderType: 'ServiceProvider' },
    { idNumber: '100009', name: 'Dattatray Deokar',   building: 'Falcon-E', flatNumber: 'E-503',  cardDetails: '33935',          cardCSN: '33935',          neighbourhood: 'Falcon Towers', isPrinted: false, isPersonalised: false, photoUrl: '', holderType: 'Tenant'          },
    { idNumber: '100010', name: 'Himanshu Tyagi',     building: 'Falcon-E', flatNumber: 'E-1003', cardDetails: '2133567',        cardCSN: '2133567',        neighbourhood: 'Falcon Towers', isPrinted: true,  isPersonalised: true,  photoUrl: '', holderType: 'LandOwner'       },
    { idNumber: '100011', name: 'Deepak Shrivastava', building: 'Falcon-G', flatNumber: 'G-2006', cardDetails: '7256095',        cardCSN: '7256095',        neighbourhood: 'Falcon Towers', isPrinted: false, isPersonalised: false, photoUrl: '', holderType: 'Employee'        },
    { idNumber: '100012', name: 'Somnath Holkar',     building: 'Falcon-A', flatNumber: 'A-407',  cardDetails: '6444591',        cardCSN: '6444591',        neighbourhood: 'Falcon Towers', isPrinted: true,  isPersonalised: true,  photoUrl: '', holderType: 'Resident'        },
    { idNumber: '100013', name: 'Parmeshwar Chavan',  building: 'Falcon-G', flatNumber: 'G-305',  cardDetails: '6528031',        cardCSN: '6528031',        neighbourhood: 'Falcon Towers', isPrinted: true,  isPersonalised: false, photoUrl: '', holderType: 'DTenant'         },
    { idNumber: '100014', name: 'Soudamini Patra',    building: 'Falcon-G', flatNumber: 'G-901',  cardDetails: '4114767',        cardCSN: '4114767',        neighbourhood: 'Falcon Towers', isPrinted: false, isPersonalised: false, photoUrl: '', holderType: 'Guest'           },
    { idNumber: '100015', name: 'Nagesh Bogar',       building: 'Falcon-C', flatNumber: 'C-1007', cardDetails: '224767',         cardCSN: '224767',         neighbourhood: 'Falcon Towers', isPrinted: true,  isPersonalised: true,  photoUrl: '', holderType: 'Resident'        },
  ];

  // ← CHANGED: injected AuthService
  constructor(private dialog: MatDialog, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadNeighbourhoods();
    this.loadBuildings();
    this.search();
  }

  
  loadNeighbourhoods(): void {
    this.authService.getNeighbourhood().subscribe({
      next: (res) => {
        // Prepend ALL option for "show all" filter
        this.neighbourhoods = [{ name: 'ALL' }, ...res.map((n: any) => ({ name: n.name ?? n.nrdname ?? n.Name }))];
        // Set default filter value
        if (!this.filter.neighbourhood) this.filter.neighbourhood = 'ALL';
      },
      error: (err) => {
        console.error('Failed to load neighbourhoods:', err);
        // Fallback so UI doesn't break
        this.neighbourhoods = [{ name: 'ALL' }];
      }
    });
  }

  
loadBuildings(): void {
  this.authService.getBuildings().subscribe({
    next: (res) => {
      this.allBuildings = res;   // ✅ STORE ORIGINAL DATA

      this.buildings = [
        { name: 'ALL' },
        ...res.map((b: any) => ({
          name: b.name ?? b.buildingname ?? b.Name,
          nrdName: b.nrdName ?? b.nrdname ?? ''
        }))
      ];

      if (!this.filter.building) this.filter.building = 'ALL';
    },
    error: (err) => {
      console.error('Failed to load buildings:', err);
      this.allBuildings = [];
      this.buildings = [{ name: 'ALL' }];
    }
  });
}

  // onNeighbourhoodChange(): void { this.filter.building = 'ALL'; }

  onNeighbourhoodChange(): void {
  this.filter.building = 'ALL';

  if (this.filter.neighbourhood === 'ALL') {
    this.buildings = [
      { name: 'ALL' },
      ...this.allBuildings
    ];
  } else {
    this.buildings = [
      { name: 'ALL' },
      ...this.allBuildings.filter(
        (b: any) => b.nrdName === this.filter.neighbourhood
      )
    ];
  }
}

 search(): void {
  let result = [...this.rawData];
  if (this.filter.neighbourhood !== 'ALL')
    result = result.filter(c => c.neighbourhood === this.filter.neighbourhood);
  if (this.filter.building !== 'ALL')
    result = result.filter(c => c.building === this.filter.building);
  if (!this.filter.showAll) {
    if (this.filter.showNonPrinted)      result = result.filter(c => !c.isPrinted);
    if (this.filter.showNonPersonalised) result = result.filter(c => !c.isPersonalised);
  }
  if (this.filter.searchValue) {
    const val = this.filter.searchValue.toLowerCase();
    result = result.filter(c => {
      switch (this.filter.searchBy) {
        case 'Name':         return c.name.toLowerCase().includes(val);
        case 'IDnumber':     return c.idNumber.includes(val);
        case 'flatnumber':   return c.flatNumber.toLowerCase().includes(val);
        case 'Building_NRD': return c.building.toLowerCase().includes(val);
        case 'CardCSN':      return c.cardDetails.includes(val);
        default:             return true;
      }
    });
  }
  this.cardHolders   = result;
  this.totalRecords  = result.length;
  this.currentPage   = 1;          // reset to page 1 on new search
  this.applyPaging();
}

applyPaging(): void {
  const start = (this.currentPage - 1) * this.pageSize;
  const end   = start + this.pageSize;
  this.pagedCardHolders = this.cardHolders.slice(start, end);
}

goToPage(page: number): void {
  const maxPage = Math.ceil(this.totalRecords / this.pageSize);
  if (page < 1 || page > maxPage) return;
  this.currentPage = page;
  this.applyPaging();
}

get totalPages(): number {
  return Math.ceil(this.totalRecords / this.pageSize);
}

toggleIssueForm(): void {
  if (!this.selectedCard) return;
  this.showIssueForm = !this.showIssueForm;
}

  onRowClick(card: CardPrintEnroll): void {
    this.selectedCard         = card;
    this.cardHolderNo         = card.idNumber;
    this.cardCSN              = card.cardDetails;
    this.cardHolderName       = card.name;
    this.buildingFlatNo       = `${card.building}/${card.flatNumber}`;
    this.neighbourhoodDisplay = card.neighbourhood;
  }

  openViewDialog(card: CardPrintEnroll): void {
    this.onRowClick(card);
    this.dialog.open(CardEditDialogComponent, {
      width: '520px',
      disableClose: false,
      data: {
        cardHolder:   card.name,
        cardDetails:  card.cardDetails,
        cardCSN:      card.cardCSN,
        accessPoints: [
          { id: 92, accessPoint: 'Falcon Towers Main Gate' },
          { id: 93, accessPoint: 'Falcon Tower B Entrance' }
        ]
      }
    }).afterClosed().subscribe(result => { if (result) this.search(); });
  }

  // ── Camera Modal ──────────────────────────────────────────────
  takePhoto(): void {
    if (!this.selectedCard) { alert('Please select a member first!'); return; }
    this.showCameraModal      = true;
    this.cameraActive         = false;
    this.capturedImage        = '';
    this.croppedImage         = '';
    this.uploadedImagePreview = '';
    this.imageToCrop          = '';
    this.croppedResult        = '';
    this.showCropper          = false;
    this.cardNoForPhoto       = this.selectedCard.idNumber;
  }

  startCamera(): void {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.videoStream   = stream;
        this.cameraActive  = true;
        this.capturedImage = '';
        this.showCropper   = false;
        setTimeout(() => {
          const video = document.getElementById('camVideo') as HTMLVideoElement;
          if (video) { video.srcObject = stream; video.play(); }
        }, 100);
      })
      .catch(err => alert('Camera not accessible: ' + err));
  }

  stopCamera(): void {
    this.videoStream?.getTracks().forEach(t => t.stop());
    this.videoStream  = null;
    this.cameraActive = false;
  }

  capturePhoto(): void {
    const video = document.getElementById('camVideo') as HTMLVideoElement;
    if (!video) return;
    const canvas  = document.createElement('canvas');
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    this.capturedImage = canvas.toDataURL('image/jpeg');
    this.imageToCrop   = this.capturedImage;
    this.showCropper   = true;
    this.croppedResult = '';
    this.stopCamera();
  }

  onUploadImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.imageChangedEvent = event;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageToCrop   = e.target?.result as string;
      this.capturedImage = this.imageToCrop;
      this.showCropper   = true;
      this.croppedResult = '';
    };
    reader.readAsDataURL(file);
  }

  imageCropped(event: ImageCroppedEvent): void {
    if (event.base64) this.croppedResult = event.base64;
  }

  clearCaptured(): void {
    this.capturedImage     = '';
    this.croppedResult     = '';
    this.imageToCrop       = '';
    this.showCropper       = false;
    this.imageChangedEvent = null;
  }

  saveAndExit(): void {
    const photoToSave = this.croppedResult || this.capturedImage;
    if (!photoToSave) { alert('Please capture or upload a photo first!'); return; }
    if (this.selectedCard) {
      this.selectedCard.photoUrl = photoToSave;
      const found = this.rawData.find(r => r.idNumber === this.selectedCard!.idNumber);
      if (found) found.photoUrl = photoToSave;
    }
    this.closeCameraModal();
  }

  closeCameraModal(): void {
    this.stopCamera();
    this.showCameraModal      = false;
    this.capturedImage        = '';
    this.croppedResult        = '';
    this.imageToCrop          = '';
    this.showCropper          = false;
    this.imageChangedEvent    = null;
    this.uploadedImagePreview = '';
  }

  readCard(): void {
    if (!this.cardCSN) { alert('Please enter a Card CSN first!'); return; }
    alert(`Reading Card CSN: ${this.cardCSN}`);
  }

  issueCard(): void {
    if (!this.cardHolderNo) { alert('Please select a card holder first!'); return; }
    if (!this.cardCSN)      { alert('Please enter Card CSN first!'); return; }
    alert(`✅ Card Issued!\nHolder: ${this.cardHolderName}\nCSN: ${this.cardCSN}`);
  }

  print(): void {
    if (!this.selectedCard) { alert('Please select a member first!'); return; }
    const card = this.selectedCard;
    const tmpl = (this.cardTemplates as any)[card.holderType ?? 'Resident']
               ?? this.cardTemplates['Resident'];

    if (this.cardType === 'blank') {
      const photo = card.photoUrl
        ? `<img src="${card.photoUrl}" style="width:100%;height:100%;object-fit:cover;" />`
        : `<div style="width:100%;height:100%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:24px;">👤</div>`;

      const w = window.open('', '_blank', 'width=420,height=760');
      if (!w) return;
      w.document.write(`
        <!DOCTYPE html><html><head>
        <title>ID Card — ${card.name}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box;}
          body{background:#ccc;display:flex;flex-direction:column;align-items:center;padding:20px;gap:14px;font-family:'Segoe UI',sans-serif;}
          @page{size:54mm 86mm;margin:0;}
          @media print{
            html{width:54mm;margin:0;padding:0;}
            body{width:54mm;margin:0;padding:0;background:white!important;display:block!important;}
            .no-print{display:none!important;}
            .blank-front{display:block;width:54mm;height:86mm;overflow:hidden;page-break-after:always;break-after:page;}
          }
          .label{font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.1em;align-self:flex-start;}
          .blank-front{display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;}
          .blank-preview{width:185px;background:#fff;border:1px solid #ddd;border-radius:8px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.2);display:flex;flex-direction:column;align-items:center;padding:16px 12px 12px;gap:10px;}
          .blank-photo{width:100px;height:120px;border:1.5px solid #ddd;border-radius:4px;overflow:hidden;background:#f5f5f5;}
          .blank-info{width:100%;text-align:center;border-top:1px solid #eee;padding-top:6px;}
          .blank-name{font-size:11px;font-weight:700;color:#111;}
          .blank-flat{font-size:9px;color:#444;margin-top:2px;}
          .blank-id{font-size:8px;color:#777;font-family:monospace;margin-top:2px;}
          .info{font-size:11px;color:#555;text-align:center;line-height:1.6;}
          .btn-row{display:flex;gap:10px;margin-top:8px;}
          .btn{padding:10px 24px;border:none;border-radius:7px;cursor:pointer;font-size:13px;font-weight:700;}
          .btn-print{background:#00c9a7;color:#061520;}
          .btn-close{background:#3d8ef8;color:#fff;}
        </style></head><body>
        <div class="blank-front">
          <span class="label no-print">Front Side (Blank)</span>
          <div class="blank-preview">
            <div class="blank-photo">${photo}</div>
            <div class="blank-info">
              <div class="blank-name">${card.name}</div>
              <div class="blank-flat">${card.building} - ${card.flatNumber}</div>
              <div class="blank-id">ID: ${card.idNumber}</div>
            </div>
          </div>
        </div>
        <div class="info no-print"><strong>${card.name}</strong><br/>${card.building} - ${card.flatNumber} | ID: ${card.idNumber}</div>
        <div class="btn-row no-print">
          <button class="btn btn-print" onclick="window.print()">🖨️ Print Card</button>
          <button class="btn btn-close" onclick="window.close()">✕ Close</button>
        </div>
        </body></html>
      `);
      w.document.close();
      return;
    }

    const cardImg       = new Image();
    cardImg.crossOrigin = 'anonymous';

    cardImg.onload = () => {
      const canvas  = document.createElement('canvas');
      canvas.width  = cardImg.naturalWidth;
      canvas.height = cardImg.naturalHeight;
      const ctx     = canvas.getContext('2d')!;
      ctx.drawImage(cardImg, 0, 0);

      const addTextAndGenerateFront = () => {
        const cw    = canvas.width;
        const ch    = canvas.height;
        const nameY = ch * 0.655;

        ctx.fillStyle = '#111111';
        ctx.font      = `bold ${Math.round(cw * 0.045)}px Segoe UI, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(card.name, cw / 2, nameY);

        ctx.fillStyle = '#333333';
        ctx.font      = `${Math.round(cw * 0.035)}px Segoe UI, sans-serif`;
        ctx.fillText(`${card.building} - ${card.flatNumber}`, cw / 2, nameY + cw * 0.055);

        ctx.fillStyle = '#555555';
        ctx.font      = `${Math.round(cw * 0.03)}px Courier New, monospace`;
        ctx.fillText(`ID: ${card.idNumber}`, cw / 2, nameY + cw * 0.105);

        const frontBase64 = canvas.toDataURL('image/jpeg', 0.95);

        const backImg       = new Image();
        backImg.crossOrigin = 'anonymous';

        backImg.onload = () => {
          const backCanvas  = document.createElement('canvas');
          backCanvas.width  = backImg.naturalWidth;
          backCanvas.height = backImg.naturalHeight;
          backCanvas.getContext('2d')!.drawImage(backImg, 0, 0);
          const backBase64 = backCanvas.toDataURL('image/jpeg', 0.95);
          this.openPrintWindow(frontBase64, backBase64, card);
        };

        backImg.onerror = () => { this.openPrintWindow(frontBase64, frontBase64, card); };
        backImg.src = window.location.origin + '/' + tmpl.back;
      };

      if (card.photoUrl) {
        const photoImg       = new Image();
        photoImg.crossOrigin = 'anonymous';
        photoImg.onload      = () => {
          const px = canvas.width  * (tmpl.photoLeft   / 100);
          const py = canvas.height * (tmpl.photoTop    / 100);
          const pw = canvas.width  * (tmpl.photoWidth  / 100);
          const ph = canvas.height * (tmpl.photoHeight / 100);
          ctx.drawImage(photoImg, px, py, pw, ph);
          addTextAndGenerateFront();
        };
        photoImg.onerror = () => addTextAndGenerateFront();
        photoImg.src     = card.photoUrl;
      } else {
        addTextAndGenerateFront();
      }
    };

    cardImg.onerror = () => alert('Card template image not found!\nCheck: src/assets/cards/ folder');
    cardImg.src = window.location.origin + '/' + tmpl.front;
  }

  private openPrintWindow(frontBase64: string, backBase64: string, card: CardPrintEnroll): void {
    const w = window.open('', '_blank', 'width=420,height=720');
    if (!w) return;

    w.document.write(`
      <!DOCTYPE html><html><head>
      <title>ID Card — ${card.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #ccc; display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 14px; font-family: 'Segoe UI', sans-serif; }
        @page { size: 54mm 86mm; margin: 0; }
        @media print {
          html { width: 54mm; margin: 0; padding: 0; }
          body { width: 54mm; margin: 0; padding: 0; background: white !important; display: block !important; }
          .no-print, .section-label, .divider, .info, .btn-row { display: none !important; }
          .front-page { display: block; width: 54mm; height: 86mm; overflow: hidden; page-break-after: always; break-after: page; }
          .card-img { display: block !important; width: 54mm !important; height: 86mm !important; object-fit: fill !important; border-radius: 0 !important; box-shadow: none !important; }
        }
        .section-label { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.1em; align-self: flex-start; }
        .front-page { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%; }
        .card-img { width: 270px; border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.3); display: block; }
        .info { font-size: 11px; color: #666; text-align: center; line-height: 1.6; max-width: 270px; }
        .btn-row { display: flex; gap: 10px; margin-top: 6px; }
        .btn { padding: 10px 24px; border: none; border-radius: 7px; cursor: pointer; font-size: 13px; font-weight: 700; }
        .btn-print { background: #00c9a7; color: #061520; }
        .btn-close  { background: #3d8ef8; color: #fff; }
      </style>
      </head>
      <body>
        <div class="front-page">
          <span class="section-label no-print">Front Side</span>
          <img class="card-img" src="${frontBase64}" alt="Card Front" />
        </div>
        <div class="info no-print">
          <strong>${card.name}</strong><br/>
          ${card.building} - ${card.flatNumber} &nbsp;|&nbsp; ID: ${card.idNumber}
        </div>
        <div class="btn-row no-print">
          <button class="btn btn-print" onclick="window.print()">🖨️ Print Card</button>
          <button class="btn btn-close" onclick="window.close()">✕ Close</button>
        </div>
      </body></html>
    `);
    w.document.close();
  }

  printExport(): void {
    if (!this.selectedCard) { alert('Please select a member first!'); return; }
    this.print();
  }
}