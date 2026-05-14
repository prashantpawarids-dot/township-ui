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
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment.prod';

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

  // ── Preview Card Modal ────────────────────────────────────────
showPreviewModal: boolean = false;
previewPhoto = { top: 50, left: 40, width: 120, height: 100 };
private isDragging: boolean = false;
private isResizing: boolean = false;
private resizeDir: string = '';
private dragStartX: number = 0;
private dragStartY: number = 0;
private dragStartTop: number = 0;
private dragStartLeft: number = 0;
private resizeStartW: number = 0;
private resizeStartH: number = 0;
private resizeStartX: number = 0;
private resizeStartY: number = 0;
private resizeStartTop: number = 0;
private resizeStartLeft: number = 0;
private boundMouseMove: any;
private boundMouseUp: any;

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
    'Contractor': { front: 'assets/cards/CONTRACTOR.jpeg', back: 'assets/cards/CardBorder.png', photoTop: 18, photoLeft: 22, photoWidth: 54, photoHeight: 38 },
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

  


  private allData: CardPrintEnroll[] = [];

  // ← CHANGED: injected AuthService
  constructor(private dialog: MatDialog, private authService: AuthService) {}

  ngOnInit(): void {
  this.loadNeighbourhoods();
  this.loadBuildings();
  this.loadAllCardHolders();
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


loadAllCardHolders(): void {
  const nrd      = this.filter.neighbourhood ?? 'ALL';
  const building = this.filter.building ?? 'ALL';

  this.authService.getCardHolders(nrd, building).subscribe({
    next: (res) => {
      this.allData = Array.isArray(res) 
        ? res.map(item => this.mapCard(item)) 
        : [];
      this.search();
    },
    error: (err) => {
      console.error('Failed to load card holders:', err);
      this.allData = [];
      this.search();
    }
  });
}

 


onNeighbourhoodChange(): void {
  this.filter.building = 'ALL';
  if (this.filter.neighbourhood === 'ALL') {
    this.buildings = [{ name: 'ALL' }, ...this.allBuildings];
  } else {
    this.buildings = [
      { name: 'ALL' },
      ...this.allBuildings.filter(
        (b: any) => b.nrdName === this.filter.neighbourhood
      )
    ];
  }
  this.loadAllCardHolders(); // reload on NRD change
}


private mapCard(item: any): CardPrintEnroll {
  // console.log('templateName:', item.templateName, '| cardType:', item.cardType, '| IDNumber:', item.idNumber);
  return {
    idNumber:       item.idNumber,
    name:           item.shortname,
    building:       item.bld,
    flatNumber:     item.flatNumber,
    cardDetails:    item.csn,
    cardCSN:        item.csn,
    neighbourhood:  item.nrd,
    holderType:     item.templateName,
    
    isPrinted:      item.cardPrintingDate !== '1900-01-01T00:00:00',
    isPersonalised: item.cardIssueDate    !== '1900-01-01T00:00:00',
    // photoUrl:       `${environment.apiurl.replace('api/', '')}cardholderimages/${item.idNumber}.jpg`,
    // photoUrl: `${environment.apiurl}Auth/GetImage/${item.idNumber}`,
    photoUrl: '',
    validTill:      item.validTill  ?? '',
    // company:        item.company    ?? '',
    // agency:         item.agency     ?? ''
    company:  item.custom1 ?? '',
agency:   item.custom2 ?? ''
  };
}

search(): void {
  let result = [...this.allData];

  // Checkbox filters
  if (!this.filter.showAll) {
    if (this.filter.showNonPrinted)      result = result.filter(c => !c.isPrinted);
    if (this.filter.showNonPersonalised) result = result.filter(c => !c.isPersonalised);
  }

  // Search value filter
  if (this.filter.searchValue) {
    const val = this.filter.searchValue.toLowerCase();
    result = result.filter(c => {
      switch (this.filter.searchBy) {
        case 'Name':         return c.name?.toLowerCase().includes(val);
        case 'IDnumber':     return c.idNumber?.includes(val);
        case 'flatnumber':   return c.flatNumber?.toLowerCase().includes(val);
        case 'Building_NRD': return c.building?.toLowerCase().includes(val);
        case 'CardCSN':      return c.cardDetails?.includes(val);
        default:             return true;
      }
    });
  }

  this.cardHolders  = result;
  this.totalRecords = result.length;
  this.currentPage  = 1;
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

  this.authService.getImage(card.idNumber).subscribe({
    next: (res: any) => {
      const photoUrl = res?.Base64 ?? res?.base64 ?? '';
      if (photoUrl) {
        this.selectedCard = { ...this.selectedCard!, photoUrl };
        const found = this.allData.find(r => r.idNumber === card.idNumber);
        if (found) found.photoUrl = photoUrl;
      }
    },
    error: () => {}
  });
}

  openViewDialog(card: CardPrintEnroll): void {
  this.onRowClick(card);

  this.authService.getNRDCardAccess().subscribe({
    next: (res) => {
      // Filter access points for this card holder
      const accessPoints = res
        .filter((a: any) => a.cardHolderID?.toString() === card.idNumber?.toString())
        .map((a: any) => ({
          id:          a.id,
          accessPoint: a.moduleName
        }));

      this.dialog.open(CardEditDialogComponent, {
        width: '520px',
        disableClose: false,
        data: {
          cardHolder:   card.name,
          cardDetails:  card.cardDetails,
          cardCSN:      card.cardCSN,
          idNumber:     card.idNumber,
          accessPoints: accessPoints
        }
      }).afterClosed().subscribe(result => { if (result) this.search(); });
    },
    error: () => {
      // fallback — open dialog with empty access points
      this.dialog.open(CardEditDialogComponent, {
        width: '520px',
        disableClose: false,
        data: {
          cardHolder:   card.name,
          cardDetails:  card.cardDetails,
          cardCSN:      card.cardCSN,
          idNumber:     card.idNumber,
          accessPoints: []
        }
      }).afterClosed().subscribe(result => { if (result) this.search(); });
    }
  });
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

//  saveAndExit(): void {
//   const photoToSave = this.croppedResult || this.capturedImage;
//   if (!photoToSave) { alert('Please capture or upload a photo first!'); return; }
//   if (!this.selectedCard) { alert('No card selected!'); return; }

//   // Save to API
//   this.authService.updateCardCSN({
//     IDNumber:    this.selectedCard.idNumber,
//     CardCSN:     this.selectedCard.cardCSN ?? '',
//     ImageBase64: photoToSave,
//     ContentType: 'image/jpeg'
//   }).subscribe({
//    next: (res) => {
//   const serverPhotoUrl = res?.photoUrl 
//     ? `http://localhost:5555${res.photoUrl}` 
//     : photoToSave;
//   this.selectedCard = { ...this.selectedCard!, photoUrl: serverPhotoUrl };
//   const found = this.allData.find(r => r.idNumber === this.selectedCard!.idNumber);
//   if (found) found.photoUrl = serverPhotoUrl;
//   this.closeCameraModal();
//   alert('✅ Photo saved successfully!');
// },
//     error: (err) => {
//       alert('❌ Failed to save photo: ' + err.message);
//     }
//   });
// }



saveAndExit(): void {
  const photoToSave = this.croppedResult || this.capturedImage;
  if (!photoToSave) { alert('Please capture or upload a photo first!'); return; }
  if (!this.selectedCard) { alert('No card selected!'); return; }

  this.authService.uploadCardPhoto(this.selectedCard.idNumber, photoToSave).subscribe({
    next: () => {
  this.authService.getImage(this.selectedCard!.idNumber).subscribe({
    next: (res: any) => {
      const photoUrl = res?.Base64 ?? photoToSave;
      this.selectedCard = { ...this.selectedCard!, photoUrl };
      const found = this.allData.find(r => r.idNumber === this.selectedCard!.idNumber);
      if (found) found.photoUrl = photoUrl;
      this.closeCameraModal();
      alert('✅ Photo saved successfully!');
    },
    error: () => {
      this.selectedCard = { ...this.selectedCard!, photoUrl: photoToSave };
      this.closeCameraModal();
      alert('✅ Photo saved successfully!');
    }
  });
},
    error: (err) => {
      alert('❌ Failed to save photo: ' + err.message);
    }
  });
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

  this.authService.updateCardCSN({
    IDNumber: this.cardHolderNo,
    CardCSN:  this.cardCSN
  }).subscribe({
    next: () => {
      alert(`✅ Card Issued!\nHolder: ${this.cardHolderName}\nCSN: ${this.cardCSN}`);
      this.loadAllCardHolders(); // refresh table
    },
    error: (err) => {
      alert('❌ Failed to issue card: ' + err.message);
    }
  });
}



private fetchImageAsBase64(url: string): Promise<string> {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    }))
    .catch(() => '');
}



onPreviewImgError(e: Event): void {
  (e.target as HTMLImageElement).style.display = 'none';
}
openPreviewCard(): void {
  if (!this.selectedCard) return;
  const tmpl = (this.cardTemplates as any)[this.selectedCard.holderType ?? 'Resident']
             ?? this.cardTemplates['Resident'];
  // Set initial photo position from template config
  this.previewPhoto = {
    top:    Math.round(320 * tmpl.photoTop    / 100),
    left:   Math.round(200 * tmpl.photoLeft   / 100),
    width:  Math.round(200 * tmpl.photoWidth  / 100),
    height: Math.round(320 * tmpl.photoHeight / 100)
  };
  this.showPreviewModal = true;
  this.boundMouseMove = this.onMouseMove.bind(this);
  this.boundMouseUp   = this.onMouseUp.bind(this);
  document.addEventListener('mousemove', this.boundMouseMove);
  document.addEventListener('mouseup',   this.boundMouseUp);
}

closePreviewModal(): void {
  this.showPreviewModal = false;
  document.removeEventListener('mousemove', this.boundMouseMove);
  document.removeEventListener('mouseup',   this.boundMouseUp);
}

onPreviewTemplateLoad(): void {}

onPhotoDragStart(e: MouseEvent): void {
  if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
  this.isDragging  = true;
  this.dragStartX  = e.clientX;
  this.dragStartY  = e.clientY;
  this.dragStartTop  = this.previewPhoto.top;
  this.dragStartLeft = this.previewPhoto.left;
  e.preventDefault();
}

onPhotoResizeStart(e: MouseEvent, dir: string): void {
  this.isResizing      = true;
  this.resizeDir       = dir;
  this.resizeStartX    = e.clientX;
  this.resizeStartY    = e.clientY;
  this.resizeStartW    = this.previewPhoto.width;
  this.resizeStartH    = this.previewPhoto.height;
  this.resizeStartTop  = this.previewPhoto.top;
  this.resizeStartLeft = this.previewPhoto.left;
  e.preventDefault();
  e.stopPropagation();
}

onMouseMove(e: MouseEvent): void {
  if (this.isDragging) {
    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;
    this.previewPhoto.top  = Math.max(0, this.dragStartTop  + dy);
    this.previewPhoto.left = Math.max(0, this.dragStartLeft + dx);
  }
  if (this.isResizing) {
    const dx = e.clientX - this.resizeStartX;
    const dy = e.clientY - this.resizeStartY;
    if (this.resizeDir === 'se') {
      this.previewPhoto.width  = Math.max(30, this.resizeStartW + dx);
      this.previewPhoto.height = Math.max(30, this.resizeStartH + dy);
    } else if (this.resizeDir === 'sw') {
      this.previewPhoto.width  = Math.max(30, this.resizeStartW - dx);
      this.previewPhoto.height = Math.max(30, this.resizeStartH + dy);
      this.previewPhoto.left   = this.resizeStartLeft + dx;
    } else if (this.resizeDir === 'ne') {
      this.previewPhoto.width  = Math.max(30, this.resizeStartW + dx);
      this.previewPhoto.height = Math.max(30, this.resizeStartH - dy);
      this.previewPhoto.top    = this.resizeStartTop + dy;
    } else if (this.resizeDir === 'nw') {
      this.previewPhoto.width  = Math.max(30, this.resizeStartW - dx);
      this.previewPhoto.height = Math.max(30, this.resizeStartH - dy);
      this.previewPhoto.left   = this.resizeStartLeft + dx;
      this.previewPhoto.top    = this.resizeStartTop  + dy;
    }
  }
}

onMouseUp(): void {
  this.isDragging  = false;
  this.isResizing  = false;
}

resetPreviewPhoto(): void {
  if (!this.selectedCard) return;
  const tmpl = (this.cardTemplates as any)[this.selectedCard.holderType ?? 'Resident']
             ?? this.cardTemplates['Resident'];
  this.previewPhoto = {
    top:    Math.round(320 * tmpl.photoTop    / 100),
    left:   Math.round(200 * tmpl.photoLeft   / 100),
    width:  Math.round(200 * tmpl.photoWidth  / 100),
    height: Math.round(320 * tmpl.photoHeight / 100)
  };
}

savePreviewAndClose(): void {
  if (!this.selectedCard) return;
  const holderType = this.selectedCard.holderType ?? 'Resident';

  // Convert px position back to % and save to cardTemplates
  (this.cardTemplates as any)[holderType] = {
    ...(this.cardTemplates as any)[holderType],
    photoTop:    Math.round(this.previewPhoto.top    / 320 * 100),
    photoLeft:   Math.round(this.previewPhoto.left   / 200 * 100),
    photoWidth:  Math.round(this.previewPhoto.width  / 200 * 100),
    photoHeight: Math.round(this.previewPhoto.height / 320 * 100)
  };
  this.closePreviewModal();
}

print(): void {
  if (!this.selectedCard) { alert('Please select a member first!'); return; }
  const card = this.selectedCard;

  // ── Contractor card — HTML print ──────────────────────────
  if (card.holderType === 'Contractor') {
    const validDate = card.validTill
      ? new Date(card.validTill).toLocaleDateString('en-IN')
      : '—';
    const photo = card.photoUrl
      ? `<img src="${card.photoUrl}" style="width:100%;height:100%;object-fit:cover;" />`
      : `<div style="width:100%;height:100%;background:#e0e8f0;display:flex;align-items:center;justify-content:center;font-size:28px;">👤</div>`;

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
  html{width:54mm;height:86mm;margin:0;padding:0;}
  body{width:54mm;height:86mm;margin:0;padding:0;background:white!important;display:flex;justify-content:center;}
  .no-print{display:none!important;}
  .contractor-print{
    width:54mm!important;
    height:86mm!important;
    border-radius:0!important;
    box-shadow:none!important;
    margin:0!important;
    padding:0!important;
  }
  .c-title{font-size:9px!important;}
  .c-subtitle{font-size:6px!important;}
  .c-photo{width:58px!important;height:70px!important;}
  .c-name{font-size:9px!important;}
  .c-row{font-size:7px!important;margin:1px 0!important;}
  .c-logo{font-size:8px!important;}
  .c-tagline,.c-url{font-size:6px!important;}
}
        .contractor-print{width:200px;height:320px;background:linear-gradient(180deg,#dce8f5 0%,#eaf2fb 40%,#f5f8fc 70%,#e8eef5 100%);border-radius:10px;display:flex;flex-direction:column;align-items:center;overflow:hidden;font-family:'Segoe UI',sans-serif;box-shadow:0 4px 16px rgba(0,0,0,0.2);}
        .c-header{width:100%;text-align:center;padding:10px 8px 4px;}
        .c-title{font-size:13px;font-weight:900;color:#1a2a3a;font-style:italic;text-transform:uppercase;}
        .c-subtitle{font-size:8px;color:#4a6880;font-style:italic;}
        .c-photo{width:88px;height:104px;border:3px solid #fff;overflow:hidden;background:#dce8f0;margin:6px 0 4px;box-shadow:0 2px 8px rgba(0,0,0,0.15);}
        .c-details{width:100%;text-align:center;padding:2px 8px;}
        .c-name{font-size:13px;font-weight:800;color:#0d1f2d;margin-bottom:5px;}
        .c-row{font-size:10px;color:#1a2a3a;font-weight:600;margin:3px 0;}
        .c-footer{width:100%;margin-top:auto;background:linear-gradient(135deg,#2d6a4f 0%,#52b788 100%);padding:5px 8px 4px;text-align:center;}
        .c-brand{display:flex;align-items:center;gap:4px;justify-content:center;}
        .c-logo{font-size:12px;font-weight:900;color:#fff;}
        .c-tagline{font-size:7px;color:#d0f0e0;font-style:italic;margin-top:1px;}
        .c-url{font-size:7px;color:#a8e6c8;margin-top:1px;}
        .btn-row{display:flex;gap:10px;margin-top:8px;}
        .btn{padding:10px 24px;border:none;border-radius:7px;cursor:pointer;font-size:13px;font-weight:700;}
        .btn-print{background:#00c9a7;color:#061520;}
        .btn-close{background:#3d8ef8;color:#fff;}
      </style></head><body>
      <div class="contractor-print">
        <div class="c-header">
          <div class="c-title">${card.company || 'Company'}</div>
          <div class="c-subtitle">@ Riverview City, Pune</div>
        </div>
        <div class="c-photo">${photo}</div>
        <div class="c-details">
          <div class="c-name">${card.name}</div>
          <div class="c-row">Validity - ${validDate}</div>
          <div class="c-row">Company - ${card.company || '—'}</div>
          <div class="c-row">Card No - ${card.idNumber || '—'}</div>
          <div class="c-row">Agency - ${card.agency || '—'}</div>
        </div>
        <div class="c-footer">
          <div class="c-brand"><span>🕊️</span><span class="c-logo">Nanded City</span></div>
          <div class="c-tagline">My City. My World.</div>
          <div class="c-url">www.nandedcitypune.com</div>
        </div>
      </div>
      <div class="btn-row no-print">
        <button class="btn btn-print" onclick="window.print()">🖨️ Print Card</button>
        <button class="btn btn-close" onclick="window.close()">✕ Close</button>
      </div>
      </body></html>
    `);
    w.document.close();
    return;
  }
  // ── End Contractor ─────────────────────────────────────────

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
  html{width:54mm;height:86mm;margin:0;padding:0;}
  body{width:54mm;height:86mm;margin:0;padding:0;background:white!important;display:flex;justify-content:center;}
  .no-print{display:none!important;}
  .contractor-print{
    width:54mm!important;
    height:86mm!important;
    border-radius:0!important;
    box-shadow:none!important;
    margin:0!important;
    padding:0!important;
  }
  .c-title{font-size:9px!important;}
  .c-subtitle{font-size:6px!important;}
  .c-photo{width:58px!important;height:70px!important;}
  .c-name{font-size:9px!important;}
  .c-row{font-size:7px!important;margin:1px 0!important;}
  .c-logo{font-size:8px!important;}
  .c-tagline,.c-url{font-size:6px!important;}
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
      this.fetchImageAsBase64(card.photoUrl).then(base64 => {
        if (base64) {
          const photoImg  = new Image();
          photoImg.onload = () => {
            const px = canvas.width  * (tmpl.photoLeft   / 100);
            const py = canvas.height * (tmpl.photoTop    / 100);
            const pw = canvas.width  * (tmpl.photoWidth  / 100);
            const ph = canvas.height * (tmpl.photoHeight / 100);
            ctx.drawImage(photoImg, px, py, pw, ph);
            addTextAndGenerateFront();
          };
          photoImg.onerror = () => addTextAndGenerateFront();
          photoImg.src     = base64;
        } else {
          addTextAndGenerateFront();
        }
      });
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