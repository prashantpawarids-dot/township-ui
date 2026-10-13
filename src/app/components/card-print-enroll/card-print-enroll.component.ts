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
import { CardPreviewService } from '../../services/card-preview.service';
import { CardDisplayComponent } from '../shared/card-display/card-display.component';
import html2canvas from 'html2canvas';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-card-print-enroll',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatSelectModule, MatInputModule,
    MatButtonModule, MatCheckboxModule, MatRadioModule,
    MatDialogModule, MatFormFieldModule, MatIconModule,
    ImageCropperComponent, CardDisplayComponent
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
  { value: 'FirstName',  label: 'First Name' },
  { value: 'MiddleName', label: 'Middle Name' },
  { value: 'LastName',   label: 'Last Name' },
  { value: 'FlatNumber', label: 'Flat Number' },
  { value: 'PANNumber',  label: 'PAN Number' },
  { value: 'IDNumber',   label: 'ID Number' },
];


  categoryOptions = [
  { value: 'Resident',        label: 'Resident' },
  { value: 'Tenant',          label: 'Tenant' },
  { value: 'LandOwner',       label: 'Land Owner' },
  { value: 'Employee',        label: 'Employee' },
  { value: 'Contractor',      label: 'Contractor' },
  { value: 'SProvider', label: 'Service Provider' },
  { value: 'Guest',           label: 'Guest' },
];

selectedCategories: string[] = ['ALL'];
selectedNeighbourhoods: string[] = ['ALL'];
selectedBuildings: string[] = ['ALL'];

  cardType: 'pre-printed' | 'blank' = 'pre-printed';
  cardHolderNo: string = '';
  cardCSN: string = '';
  cardHolderName: string = '';
  buildingFlatNo: string = '';
  neighbourhoodDisplay: string = '';

  // ── Pagination ────────────────────────────────────────────────
pageSize: number = 8;
currentPage: number = 1;
totalRecords: number = 0;
pagedCardHolders: CardPrintEnroll[] = [];

// ── Issue Card Toggle ─────────────────────────────────────────
showIssueForm: boolean = false;

  // ── Camera Modal State ────────────────────────────────────────
showCameraModal: boolean = false;
  cameraActive: boolean = false;
  videoStream: MediaStream | null = null;
  availableCameras: MediaDeviceInfo[] = [];
  selectedCameraId: string = '';
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

selectedTextField: string = '';

get textFields(): Record<string, { label: string; size: number; color: string; bold: boolean; x: number; y: number }> {
  return this.designFieldsCache[this.currentDesignKey] ?? {};
}

get currentTextStyle() {
  return this.selectedTextField ? this.textFields[this.selectedTextField] : null;
}

get activeTextFields(): string[] {
  const fields = this.designFieldsCache[this.currentDesignKey];
  if (!fields) return [];
  return Object.keys(fields).filter(k => fields[k].enabled);
}

private textDragging: string        = '';
private textDragStartX: number      = 0;
private textDragStartY: number      = 0;
private textDragStartFieldX: number = 0;
private textDragStartFieldY: number = 0;
nrdTemplateCache: Record<number, string> = {};

// ── Saved Card Design (from Card Design page) ──────────────────
private designTemplateCache: Record<string, string> = {};
private designLogoCache: Record<string, string> = {};
private designFieldsCache: Record<string, Record<string, { label: string; size: number; color: string; bold: boolean; x: number; y: number; enabled: boolean }>> = {};
private designPhotoBoxCache: Record<string, { top: number; left: number; width: number; height: number }> = {};
// private designLogoBoxCache: Record<string, { top: number; left: number; width: number; height: number }> = {};
private designLogoBoxCache: Record<string, { top: number; left: number; width: number; height: number }> = {};
private designLogoEnabledCache: Record<string, boolean> = {};
private categoryValueForHolderType: Record<string, string> = {
  Resident: 'Resident', DResident: 'Resident',
  Tenant: 'Tenant', DTenant: 'Tenant',
  LandOwner: 'LandOwner', DLandOwner: 'LandOwner',
  Employee: 'Employee', Contractor: 'Contractor',
  SProvider: 'ServiceProvider', Guest: 'Guest'
};
private nrdSpecificGroups = new Set(['Contractor', 'Employee']);

private fieldValueResolvers: Record<string, (card: CardPrintEnroll) => string> = {
  idNumber:   c => c.idNumber ?? '',
  shortname:  c => c.name ?? '',
  csn:        c => c.cardCSN ?? c.cardDetails ?? '',
  building:   c => c.building ?? '',
  bld:        c => c.building ?? '',
  flatNumber: c => c.flatNumber ?? '',
  nrd:        c => c.neighbourhood ?? '',
  bloodGroup: c => (c as any).bloodGroup ?? '',
  validTill:  c => c.validTill ? new Date(c.validTill).toLocaleDateString('en-IN') : '',
  custom1:    c => c.company ?? '',
  custom2:    c => c.agency ?? ''
};

private designKeyForCard(card: CardPrintEnroll): string {
  const group = this.categoryValueForHolderType[card.holderType ?? ''] ?? card.holderType ?? '';
  if (this.nrdSpecificGroups.has(group)) {
    const nrd = this.neighbourhoods.find(n => n.name === card.neighbourhood);
    return `${group}_${nrd?.id ?? 0}`;
  }
  return group;
}
private logoKeyForCard(card: CardPrintEnroll): string {
  const group = this.categoryValueForHolderType[card.holderType ?? ''] ?? card.holderType ?? '';
  if (this.nrdSpecificGroups.has(group)) {
    return this.designKeyForCard(card); // Contractor & Employee: logo bundled with its own per-NRD design key
  }
  const nrd = this.neighbourhoods.find(n => n.name === card.neighbourhood);
  return `Logo_${nrd?.id ?? 0}`;
}

// loadDesignForCard(card: CardPrintEnroll): void {
//   const key = this.designKeyForCard(card);
//   const logoKey = this.logoKeyForCard(card);

//   if (this.designTemplateCache[key] === undefined) {
//     this.authService.getCardMasterTemplate(key).subscribe({
//       next: (res: any) => { this.designTemplateCache[key] = res?.base64 ?? res?.Base64 ?? ''; },
//       error: () => { this.designTemplateCache[key] = ''; }
//     });
//   }

//   if (this.designLogoCache[logoKey] === undefined) {
//     this.authService.getCardMasterTemplate(logoKey).subscribe({
//       next: (res: any) => { this.designLogoCache[logoKey] = res?.logoBase64 ?? res?.LogoBase64 ?? ''; },
//       error: () => { this.designLogoCache[logoKey] = ''; }
//     });
//   }

//   if (!this.designFieldsCache[key]) {
//     this.authService.getCardPrintSettings(key).subscribe({
//       next: (res: any) => {
//         this.designFieldsCache[key] = {};
//         if (!res?.settingsJson) return;
//         try {
//           const s = JSON.parse(res.settingsJson);
//           this.designFieldsCache[key] = s.fields ?? {};
//           if (s.photo) this.designPhotoBoxCache[key] = s.photo;
//           if (s.logo)  this.designLogoBoxCache[key]  = s.logo;
//         } catch {}
//       },
//       error: () => { this.designFieldsCache[key] = {}; }
//     });
//   }
// }


loadDesignForCard(card: CardPrintEnroll): Promise<void> {
  const key = this.designKeyForCard(card);
  const logoKey = this.logoKeyForCard(card);
  const tasks: Promise<any>[] = [];

  if (this.designTemplateCache[key] === undefined) {
    tasks.push(new Promise<void>(resolve => {
      this.authService.getCardMasterTemplate(key).subscribe({
        next: (res: any) => { this.designTemplateCache[key] = res?.base64 ?? res?.Base64 ?? ''; resolve(); },
        error: () => { this.designTemplateCache[key] = ''; resolve(); }
      });
    }));
  }

  if (this.designLogoCache[logoKey] === undefined) {
    tasks.push(new Promise<void>(resolve => {
      this.authService.getCardMasterTemplate(logoKey).subscribe({
        next: (res: any) => { this.designLogoCache[logoKey] = res?.logoBase64 ?? res?.LogoBase64 ?? ''; resolve(); },
        error: () => { this.designLogoCache[logoKey] = ''; resolve(); }
      });
    }));
  }

  if (!this.designFieldsCache[key]) {
    tasks.push(new Promise<void>(resolve => {
      this.authService.getCardPrintSettings(key).subscribe({
        next: (res: any) => {
          this.designFieldsCache[key] = {};
          if (res?.settingsJson) {
            try {
              const s = JSON.parse(res.settingsJson);
             this.designFieldsCache[key] = s.fields ?? {};
              if (s.photo) this.designPhotoBoxCache[key] = s.photo;
              if (s.logo)  this.designLogoBoxCache[key]  = s.logo;
              this.designLogoEnabledCache[key] = s.logoEnabled !== false;
            } catch {}
          }
          resolve();
        },
        error: () => { this.designFieldsCache[key] = {}; resolve(); }
      });
    }));
  }

  return Promise.all(tasks).then(() => {});
}
get currentDesignKey(): string {
  return this.selectedCard ? this.designKeyForCard(this.selectedCard) : '';
}

getFieldValue(fieldId: string): string {
  if (!this.selectedCard) return '';
  const resolver = this.fieldValueResolvers[fieldId];
  return resolver ? resolver(this.selectedCard) : '';
}

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
    // 'ServiceProvider': { front: 'assets/cards/ServiceProvider.jpeg',  back: 'assets/cards/SProvider.jpg',    photoTop: 20, photoLeft: 18, photoWidth: 56, photoHeight: 34 },
    'SProvider': { front: 'assets/cards/ServiceProvider.jpeg',  back: 'assets/cards/SProvider.jpg',    photoTop: 20, photoLeft: 18, photoWidth: 56, photoHeight: 34 },
    'Guest':           { front: 'assets/cards/Guest.jpeg',            back: 'assets/cards/CardBorder.png',   photoTop: 21, photoLeft: 22, photoWidth: 54, photoHeight: 34 },
    'Contractor': { front: 'assets/cards/CONTRACTOR.jpeg', back: 'assets/cards/CardBorder.png', photoTop: 18, photoLeft: 22, photoWidth: 54, photoHeight: 38 },
  };

  // get currentCardTemplate(): string {
  //   if (!this.selectedCard) return '';
  //   const tmpl = (this.cardTemplates as any)[this.selectedCard.holderType ?? 'Resident']
  //              ?? this.cardTemplates['Resident'];
  //   return tmpl.front;
  // }


 get currentCardTemplate(): string {
    return this.designTemplateCache[this.currentDesignKey] ?? '';
  }

  get contractorTemplate(): string {
    return this.selectedCard?.holderType === 'Contractor' ? this.currentCardTemplate : '';
  }

  get currentCardLogo(): string {
    return this.selectedCard ? (this.designLogoCache[this.logoKeyForCard(this.selectedCard)] ?? '') : '';
  }
 get hasCurrentLogo(): boolean {
    return !!this.currentCardLogo && (this.designLogoEnabledCache[this.currentDesignKey] !== false);
  }

  get currentCardPhotoStyle(): any {
    const box = this.designPhotoBoxCache[this.currentDesignKey];
    if (!box) return { position: 'absolute', top: '20%', left: '20%', width: '54%', height: '34%' };
    return {
      position: 'absolute',
      top:    (box.top    / 320 * 100) + '%',
      left:   (box.left   / 200 * 100) + '%',
      width:  (box.width  / 200 * 100) + '%',
      height: (box.height / 320 * 100) + '%'
    };
  }

  get currentCardLogoStyle(): any {
    const box = this.designLogoBoxCache[this.currentDesignKey];
    if (!box) return null;
    return {
      position: 'absolute',
      top:    (box.top    / 320 * 100) + '%',
      left:   (box.left   / 200 * 100) + '%',
      width:  (box.width  / 200 * 100) + '%',
      height: (box.height / 320 * 100) + '%'
    };
  }

  

@ViewChild('realCardRef') realCardRef!: ElementRef<HTMLDivElement>;
  private allData: CardPrintEnroll[] = [];

  // ← CHANGED: injected AuthService
  constructor(private dialog: MatDialog, private authService: AuthService, private previewService: CardPreviewService) {}


  onCategoryToggle(value: string): void {
  if (value === 'ALL') {
    this.selectedCategories = this.selectedCategories.includes('ALL')
      ? [] : ['ALL', ...this.categoryOptions.map(c => c.value)];
  } else {
    if (this.selectedCategories.includes(value)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== value && c !== 'ALL');
   } else {
  this.selectedCategories = this.selectedCategories.filter(c => c !== 'ALL');
  this.selectedCategories.push(value);
  if (this.selectedCategories.length === this.categoryOptions.length) {
    this.selectedCategories = ['ALL', ...this.selectedCategories];
  }
}
  }
}

onNeighbourhoodToggle(value: string): void {
  if (value === 'ALL') {
    this.selectedNeighbourhoods = this.selectedNeighbourhoods.includes('ALL')
      ? [] : ['ALL', ...this.neighbourhoods.filter(n => n.name !== 'ALL').map(n => n.name)];
  } else {
    if (this.selectedNeighbourhoods.includes(value)) {
      this.selectedNeighbourhoods = this.selectedNeighbourhoods.filter(n => n !== value && n !== 'ALL');
    } else {
  this.selectedNeighbourhoods = this.selectedNeighbourhoods.filter(n => n !== 'ALL');
  this.selectedNeighbourhoods.push(value);
  const allNrds = this.neighbourhoods.filter(n => n.name !== 'ALL').map(n => n.name);
  if (this.selectedNeighbourhoods.length === allNrds.length) {
    this.selectedNeighbourhoods = ['ALL', ...this.selectedNeighbourhoods];
  }
}
  }
  this.filterBuildingsByNRD();
}

onBuildingToggle(value: string): void {
  if (value === 'ALL') {
    this.selectedBuildings = this.selectedBuildings.includes('ALL')
      ? [] : ['ALL', ...this.buildings.filter(b => b.name !== 'ALL').map(b => b.name)];
  } else {
    if (this.selectedBuildings.includes(value)) {
      this.selectedBuildings = this.selectedBuildings.filter(b => b !== value && b !== 'ALL');
    } else {
  this.selectedBuildings = this.selectedBuildings.filter(b => b !== 'ALL');
  this.selectedBuildings.push(value);
  const allBlds = this.buildings.filter(b => b.name !== 'ALL').map(b => b.name);
  if (this.selectedBuildings.length === allBlds.length) {
    this.selectedBuildings = ['ALL', ...this.selectedBuildings];
  }
}
  }
}

filterBuildingsByNRD(): void {
  if (this.selectedNeighbourhoods.includes('ALL') || this.selectedNeighbourhoods.length === 0) {
    this.buildings = [{ name: 'ALL' }, ...this.allBuildings.map((b: any) => ({ name: b.name ?? b.Name, nrdName: b.nrdName ?? '' }))];
  } else {
    this.buildings = [
      { name: 'ALL' },
      ...this.allBuildings.filter((b: any) => this.selectedNeighbourhoods.includes(b.nrdName ?? '')).map((b: any) => ({ name: b.name ?? b.Name, nrdName: b.nrdName ?? '' }))
    ];
  }
  this.selectedBuildings = ['ALL'];
}

getCategoryLabel(): string {
  if (this.selectedCategories.includes('ALL') || this.selectedCategories.length === 0) return 'All Categories';
  return this.selectedCategories.filter(c => c !== 'ALL').join(', ');
}

getNRDLabel(): string {
  if (this.selectedNeighbourhoods.includes('ALL') || this.selectedNeighbourhoods.length === 0) return 'All Neighbourhoods';
  return this.selectedNeighbourhoods.filter(n => n !== 'ALL').join(', ');
}

getBuildingLabel(): string {
  if (this.selectedBuildings.includes('ALL') || this.selectedBuildings.length === 0) return 'All Buildings';
  return this.selectedBuildings.filter(b => b !== 'ALL').join(', ');
}

//   ngOnInit(): void {
//      this.loadFieldSettings(); // ← ADD THIS FIRST
//   this.loadNeighbourhoods();
//   this.loadBuildings();
//   this.loadAllCardHolders();
// }

masterTemplateCache: Record<string, string> = {};

  ngOnInit(): void {
  this.loadNeighbourhoods();
  this.loadBuildings();
  this.loadAllCardHolders();
}

  loadMasterTemplate(holderType: string): void {
    this.authService.getCardMasterTemplate(holderType).subscribe({
      next: (res: any) => { this.masterTemplateCache[holderType] = res?.base64 ?? ''; },
      error: () => { this.masterTemplateCache[holderType] = ''; }
    });
  }

private captureAndSendPreview(): void {
  requestAnimationFrame(() => {
    const el = this.realCardRef?.nativeElement;
    if (!el) return;
    const imgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];

    const waitForImages = Promise.all(
      imgs.map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>(resolve => {
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        });
      })
    );

    waitForImages.then(() => {
      html2canvas(el, {
        useCORS: true,
        backgroundColor: null,
        scale: 1
      }).then(canvas => {
        const img = canvas.toDataURL('image/jpeg', 0.85);
        this.previewService.sendPreview({
          cardImageBase64: img,
          cardName: this.selectedCard?.name ?? ''
        });
      }).catch(err => console.error('Preview capture failed:', err));
    });
  });
}
  
  loadNeighbourhoods(): void {
    this.authService.getNeighbourhood().subscribe({
      next: (res) => {
        // Prepend ALL option for "show all" filter
        // this.neighbourhoods = [{ name: 'ALL' }, ...res.map((n: any) => ({ name: n.name ?? n.nrdname ?? n.Name }))];
        this.neighbourhoods = [{ name: 'ALL', id: null }, ...res.map((n: any) => ({ name: n.name ?? n.nrdname ?? n.Name, id: n.id }))];
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

  // Category filter
  if (!this.selectedCategories.includes('ALL') && this.selectedCategories.length > 0) {
    result = result.filter(c => this.selectedCategories.includes(c.holderType ?? ''));
  }

  // Neighbourhood filter
  if (!this.selectedNeighbourhoods.includes('ALL') && this.selectedNeighbourhoods.length > 0) {
    result = result.filter(c => this.selectedNeighbourhoods.includes(c.neighbourhood ?? ''));
  }

  // Building filter
  if (!this.selectedBuildings.includes('ALL') && this.selectedBuildings.length > 0) {
    result = result.filter(c => this.selectedBuildings.includes(c.building ?? ''));
  }

  // Checkbox filters
  if (!this.filter.showAll) {
    if (this.filter.showNonPrinted)      result = result.filter(c => !c.isPrinted);
    if (this.filter.showNonPersonalised) result = result.filter(c => !c.isPersonalised);
  }

  // Search filter
  if (this.filter.searchValue) {
    const val = this.filter.searchValue.toLowerCase();
    result = result.filter(c => {
      const name = c.name?.toLowerCase() ?? '';
      switch (this.filter.searchBy) {
        case 'FirstName':  return name.split(' ')[0]?.startsWith(val);
        case 'MiddleName': return name.split(' ')[1]?.startsWith(val);
        case 'LastName':   return name.split(' ').pop()?.startsWith(val);
        case 'FlatNumber': return c.flatNumber?.toLowerCase().startsWith(val);
        case 'PANNumber':  return false;
        case 'IDNumber':   return c.idNumber?.startsWith(val);
        default:           return name.startsWith(val);
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
  // this.pagedCardHolders = this.cardHolders.slice(start, end);
  this.pagedCardHolders = this.cardHolders.slice(start, end);
  this.loadPagePhotos();
}

// goToPage(page: number): void {
private photoRequested = new Set<string>();

private loadPagePhotos(): void {
  this.pagedCardHolders.forEach(row => {
    if (row.photoUrl || this.photoRequested.has(row.idNumber)) return;
    this.photoRequested.add(row.idNumber);
    this.authService.getImage(row.idNumber).subscribe({
      next: (res: any) => {
        const photo = res?.Base64 ?? res?.base64 ?? '';
        if (photo) row.photoUrl = photo;
      },
      error: () => {}
    });
  });
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

// onRowClick(card: CardPrintEnroll): void {
//   this.selectedCard         = card;
//   this.cardHolderNo         = card.idNumber;
//   this.cardCSN              = card.cardDetails;
//   this.cardHolderName       = card.name;
//   this.buildingFlatNo       = `${card.building}/${card.flatNumber}`;
//   this.neighbourhoodDisplay = card.neighbourhood;

//   this.loadDesignForCard(card);
//   this.loadImageAndSendPreview(card);
// }


onRowClick(card: CardPrintEnroll): void {
  this.previewService.sendLoading();
  this.selectedCard         = card;
  this.cardHolderNo         = card.idNumber;
  this.cardCSN              = card.cardDetails;
  this.cardHolderName       = card.name;
  this.buildingFlatNo       = `${card.building}/${card.flatNumber}`;
  this.neighbourhoodDisplay = card.neighbourhood;

  // Wait for the saved design (template/logo/fields) to finish loading
  // BEFORE sending the snapshot to the Preview screen — this is what
  // was causing Preview to show a blank/wrong design.
  this.loadDesignForCard(card).then(() => {
    this.loadImageAndSendPreview(card);
  });
}
private loadImageSrc(url: string): Promise<string> {
  if (!url) return Promise.resolve('');
  if (url.startsWith('data:')) return Promise.resolve(url);
  return this.fetchImageAsBase64(url);
}

// Builds the exact same flattened card image used by print() — single source of truth.
private buildCardImage(card: CardPrintEnroll): Promise<string> {
  return new Promise((resolve) => {
    const key = this.designKeyForCard(card);
    const frontSrc = this.designTemplateCache[key] ?? '';
    if (!frontSrc) { resolve(''); return; }

    const logoKey  = this.logoKeyForCard(card);
    const photoBox = this.designPhotoBoxCache[key];
    const logoBox  = this.designLogoBoxCache[key];
    const logoSrc  = this.designLogoCache[logoKey] ?? '';
    const fields   = this.designFieldsCache[key] ?? {};
    const logoEnabled = this.designLogoEnabledCache[key] !== false;

    const cardImg = new Image();
    cardImg.crossOrigin = 'anonymous';
    cardImg.onload = () => {
      const canvas  = document.createElement('canvas');
      canvas.width  = cardImg.naturalWidth;
      canvas.height = cardImg.naturalHeight;
      const ctx     = canvas.getContext('2d')!;
      ctx.drawImage(cardImg, 0, 0);

      const drawLogoTextAndFinish = () => {
        const finish = () => {
          ctx.textAlign = 'center';
          Object.keys(fields).forEach(fieldId => {
            const f = fields[fieldId];
            if (!f.enabled) return;
            const resolver = this.fieldValueResolvers[fieldId];
            const text = resolver ? resolver(card) : '';
            if (!text) return;
            ctx.fillStyle = f.color;
            ctx.font = `${f.bold ? 'bold' : 'normal'} ${Math.round(canvas.width * f.size)}px Segoe UI, sans-serif`;
            ctx.fillText(text, canvas.width * (f.x / 100), canvas.height * (f.y / 100));
          });
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        };

        if (logoSrc && logoBox && logoEnabled) {
          const logoImg = new Image();
          logoImg.onload = () => {
            const lx = canvas.width  * (logoBox.left   / 200);
            const ly = canvas.height * (logoBox.top    / 320);
            const lw = canvas.width  * (logoBox.width  / 200);
            const lh = canvas.height * (logoBox.height / 320);
            ctx.drawImage(logoImg, lx, ly, lw, lh);
            finish();
          };
          logoImg.onerror = () => finish();
          logoImg.src = logoSrc;
        } else {
          finish();
        }
      };

      if (card.photoUrl && photoBox) {
        this.loadImageSrc(card.photoUrl).then(base64 => {
          if (base64) {
            const photoImg = new Image();
            photoImg.onload = () => {
              const px = canvas.width  * (photoBox.left   / 200);
              const py = canvas.height * (photoBox.top    / 320);
              const pw = canvas.width  * (photoBox.width  / 200);
              const ph = canvas.height * (photoBox.height / 320);
              ctx.drawImage(photoImg, px, py, pw, ph);
              drawLogoTextAndFinish();
            };
            photoImg.onerror = () => drawLogoTextAndFinish();
            photoImg.src = base64;
          } else {
            drawLogoTextAndFinish();
          }
        });
      } else {
        drawLogoTextAndFinish();
      }
    };
    cardImg.onerror = () => resolve('');
    cardImg.src = frontSrc;
  });
}

private sendCardPreview(card: CardPrintEnroll): void {
  this.buildCardImage(card).then(img => {
    this.previewService.sendPreview({
      cardImageBase64: img,
      cardName: card.name ?? ''
    });
  });
}
private loadImageAndSendPreview(card: CardPrintEnroll): void {
  this.authService.getImage(card.idNumber).subscribe({
    next: (res: any) => {
      const photoUrl = res?.Base64 ?? res?.base64 ?? '';
      if (photoUrl) {
        this.selectedCard = { ...this.selectedCard!, photoUrl };
        const found = this.allData.find(r => r.idNumber === card.idNumber);
        if (found) found.photoUrl = photoUrl;
      }
      this.captureAndSendPreview();
    },
    error: () => {
      this.captureAndSendPreview();
    }
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
        // data: {
        //   cardHolder:   card.name,
        //   cardDetails:  card.cardDetails,
        //   cardCSN:      card.cardCSN,
        //   idNumber:     card.idNumber,
        //   accessPoints: accessPoints
        // }

        data: {
  cardHolder:            card.name,
  cardDetails:           card.cardDetails,
  cardCSN:               card.cardCSN,
  idNumber:              card.idNumber,
  accessPoints:          accessPoints,
  photoUrl:              card.photoUrl,
  holderType:            card.holderType,
  building:              card.building,
  flatNumber:            card.flatNumber,
  validTill:             card.validTill,
  company:               card.company,
  agency:                card.agency,
  textFields:            this.textFields,
  activeTextFields:      this.activeTextFields,
  contractorTemplate:    this.contractorTemplate,
  currentCardTemplate:   this.currentCardTemplate,
  currentCardPhotoStyle: this.currentCardPhotoStyle
}
      }).afterClosed().subscribe(result => { if (result) this.search(); });
    },
    error: () => {
      // fallback — open dialog with empty access points
      this.dialog.open(CardEditDialogComponent, {
        width: '520px',
        disableClose: false,
        // data: {
        //   cardHolder:   card.name,
        //   cardDetails:  card.cardDetails,
        //   cardCSN:      card.cardCSN,
        //   idNumber:     card.idNumber,
        //   accessPoints: []
        // }

        data: {
  cardHolder:            card.name,
  cardDetails:           card.cardDetails,
  cardCSN:               card.cardCSN,
  idNumber:              card.idNumber,
  accessPoints:          [],
  photoUrl:              card.photoUrl,
  holderType:            card.holderType,
  building:              card.building,
  flatNumber:            card.flatNumber,
  validTill:             card.validTill,
  company:               card.company,
  agency:                card.agency,
  textFields:            this.textFields,
  activeTextFields:      this.activeTextFields,
  contractorTemplate:    this.contractorTemplate,
  currentCardTemplate:   this.currentCardTemplate,
  currentCardPhotoStyle: this.currentCardPhotoStyle
}
      }).afterClosed().subscribe(result => { if (result) this.search(); });
    }
  });
}

  // ── Camera Modal ──────────────────────────────────────────────
  // takePhoto(): void {
  //   if (!this.selectedCard) { alert('Please select a member first!'); return; }
  //   this.showCameraModal      = true;
  //   this.cameraActive         = false;
  //   this.capturedImage        = '';
  //   this.croppedImage         = '';
  //   this.uploadedImagePreview = '';
  //   this.imageToCrop          = '';
  //   this.croppedResult        = '';
  //   this.showCropper          = false;
  //   this.cardNoForPhoto       = this.selectedCard.idNumber;
  // }

  // startCamera(): void {
  //   navigator.mediaDevices.getUserMedia({ video: true })
  //     .then(stream => {
  //       this.videoStream   = stream;
  //       this.cameraActive  = true;
  //       this.capturedImage = '';
  //       this.showCropper   = false;
  //       setTimeout(() => {
  //         const video = document.getElementById('camVideo') as HTMLVideoElement;
  //         if (video) { video.srcObject = stream; video.play(); }
  //       }, 100);
  //     })
  //     .catch(err => alert('Camera not accessible: ' + err));
  // }

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
    this.loadCameraDevices();
  }

  loadCameraDevices(): void {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        this.availableCameras = devices.filter(d => d.kind === 'videoinput');
        // Keep previous selection if it still exists, else default to first camera
        if (!this.availableCameras.some(c => c.deviceId === this.selectedCameraId)) {
          this.selectedCameraId = this.availableCameras[0]?.deviceId ?? '';
        }
      })
      .catch(err => console.error('Could not list cameras:', err));
  }

  onCameraDeviceChange(): void {
    if (this.cameraActive) {
      this.stopCamera();
      this.startCamera();
    }
  }

  // startCamera(): void {
  //   const constraints: MediaStreamConstraints = {
  //     video: this.selectedCameraId
  //       ? { deviceId: { exact: this.selectedCameraId } }
  //       : true
  //   };
  //   navigator.mediaDevices.getUserMedia(constraints)
  //     .then(stream => {
  //       this.videoStream   = stream;
  //       this.cameraActive  = true;
  //       this.capturedImage = '';
  //       this.showCropper   = false;
  //       setTimeout(() => {
  //         const video = document.getElementById('camVideo') as HTMLVideoElement;
  //         if (video) { video.srcObject = stream; video.play(); }
  //       }, 100);
  //       // Device labels are only populated after permission is granted — refresh list
  //       this.loadCameraDevices();
  //     })
  //     .catch(err => alert('Camera not accessible: ' + err));
  // }


    startCamera(): void {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Camera access is blocked because this page is not loaded over HTTPS (or localhost). Current address: ' + window.location.origin + '\n\nAsk your admin to serve the app over https:// to enable the camera.');
      return;
    }
    const constraints: MediaStreamConstraints = {
      video: this.selectedCameraId
        ? { deviceId: { exact: this.selectedCameraId } }
        : true
    };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        this.videoStream   = stream;
        this.cameraActive  = true;
        this.capturedImage = '';
        this.showCropper   = false;
        setTimeout(() => {
          const video = document.getElementById('camVideo') as HTMLVideoElement;
          if (video) { video.srcObject = stream; video.play(); }
        }, 100);
        // Device labels are only populated after permission is granted — refresh list
        this.loadCameraDevices();
      })
      .catch(err => {
        if (err.name === 'OverconstrainedError' || err.name === 'NotFoundError') {
          this.selectedCameraId = '';
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
              this.loadCameraDevices();
            })
            .catch(err2 => alert('Camera not accessible: ' + err2));
        } else {
          alert('Camera not accessible: ' + err);
        }
      });
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

  // imageCropped(event: ImageCroppedEvent): void {
  //   if (event.base64) this.croppedResult = event.base64;
  // }


  @ViewChild(ImageCropperComponent) imageCropperRef?: ImageCropperComponent;

get cropperAspectRatio(): number {
  const card = this.selectedCard;
  if (card) {
    const key = this.designKeyForCard(card);
    const box = this.designPhotoBoxCache[key];
    if (box?.width && box?.height) {
      return box.width / box.height;
    }
  }
  return 3.5 / 4.5;
}

private blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// imageCropped(event: ImageCroppedEvent): void {
//   if (event.base64) {
//     this.croppedResult = event.base64;
//   } else if ((event as any).blob) {
//     this.blobToBase64((event as any).blob).then(b64 => this.croppedResult = b64);
//   }
// }


imageCropped(event: ImageCroppedEvent): void {
  if (event.base64) {
    this.croppedResult = event.base64;
  } else if ((event as any).blob) {
    this.blobToBase64((event as any).blob).then(b64 => this.croppedResult = b64);
  }
}

// ── Brightness / Sharpness adjustment ───────────────────────────
brightnessValue: number = 100; // 50–150 (%)
sharpnessValue: number = 0;    // 0–100

private applyImageAdjustments(base64: string): Promise<string> {
  if (this.brightnessValue === 100 && this.sharpnessValue === 0) {
    return Promise.resolve(base64); // nothing changed, skip work
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;

      ctx.filter = `brightness(${this.brightnessValue}%)`;
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';

      if (this.sharpnessValue > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.sharpenImageData(imageData, this.sharpnessValue / 100);
        ctx.putImageData(imageData, 0, 0);
      }

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

private sharpenImageData(imageData: ImageData, amount: number): void {
  const { width, height, data } = imageData;
  const src = new Uint8ClampedArray(data);
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0, k = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            sum += src[((y + ky) * width + (x + kx)) * 4 + c] * kernel[k++];
          }
        }
        const idx = (y * width + x) * 4 + c;
        const original  = src[idx];
        const sharpened = Math.max(0, Math.min(255, sum));
        data[idx] = original + (sharpened - original) * amount;
      }
    }
  }
}

onCropperReady(): void {
  // No auto-crop — user drags/selects manually, red box only appears then.
}

  // clearCaptured(): void {
  //   this.capturedImage     = '';
  //   this.croppedResult     = '';
  //   this.imageToCrop       = '';
  //   this.showCropper       = false;
  //   this.imageChangedEvent = null;
  // }


    clearCaptured(): void {
    this.capturedImage     = '';
    this.croppedResult     = '';
    this.imageToCrop       = '';
    this.showCropper       = false;
    this.imageChangedEvent = null;
    this.brightnessValue   = 100;
    this.sharpnessValue    = 0;
  }


async saveAndExit(): Promise<void> {
  // Force a final crop calculation right before saving, so we always
  // use the user's latest crop selection instead of a stale/empty value.
  if (this.showCropper && this.imageCropperRef) {
    const result: any = this.imageCropperRef.crop();
    if (result?.base64) {
      this.croppedResult = result.base64;
    } else if (result?.blob) {
      this.croppedResult = await this.blobToBase64(result.blob);
    }
  }

  // const photoToSave = this.croppedResult || this.capturedImage;
  // if (!photoToSave) { alert('Please capture or upload a photo first!'); return; }
  // if (!this.selectedCard) { alert('No card selected!'); return; }


    let photoToSave = this.croppedResult || this.capturedImage;
  if (!photoToSave) { alert('Please capture or upload a photo first!'); return; }
  if (!this.selectedCard) { alert('No card selected!'); return; }

  // Bake in brightness/sharpness adjustments (no-op if both are at default)
  photoToSave = await this.applyImageAdjustments(photoToSave);

  this.authService.uploadCardPhoto(this.selectedCard.idNumber, photoToSave).subscribe({
    next: () => {
      this.authService.getImage(this.selectedCard!.idNumber).subscribe({
        next: (res: any) => {
          const photoUrl = photoToSave;
          this.selectedCard = { ...this.selectedCard!, photoUrl };
          const found = this.allData.find(r => r.idNumber === this.selectedCard!.idNumber);
          if (found) found.photoUrl = photoUrl;

          this.sendCardPreview({ ...this.selectedCard!, photoUrl });

          this.closeCameraModal();
          alert('✅ Photo saved successfully!');
        },
        error: () => {
          this.selectedCard = { ...this.selectedCard!, photoUrl: photoToSave };

          this.sendCardPreview({ ...this.selectedCard!, photoUrl: photoToSave });

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

  // closeCameraModal(): void {
  //   this.stopCamera();
  //   this.showCameraModal      = false;
  //   this.capturedImage        = '';
  //   this.croppedResult        = '';
  //   this.imageToCrop          = '';
  //   this.showCropper          = false;
  //   this.imageChangedEvent    = null;
  //   this.uploadedImagePreview = '';
  // }


    closeCameraModal(): void {
    this.stopCamera();
    this.showCameraModal      = false;
    this.capturedImage        = '';
    this.croppedResult        = '';
    this.imageToCrop          = '';
    this.showCropper          = false;
    this.imageChangedEvent    = null;
    this.uploadedImagePreview = '';
    this.brightnessValue      = 100;
    this.sharpnessValue       = 0;
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

onTextDragStart(e: MouseEvent, field: string): void {
  e.preventDefault();
  e.stopPropagation();
  this.textDragging        = field;
  this.textDragStartX      = e.clientX;
  this.textDragStartY      = e.clientY;
  this.textDragStartFieldX = this.textFields[field].x;
  this.textDragStartFieldY = this.textFields[field].y;
  this.selectedTextField   = field;
}

onMouseMove(e: MouseEvent): void {
  if (this.textDragging) {
  const dx = ((e.clientX - this.textDragStartX) / 200) * 100;
  const dy = ((e.clientY - this.textDragStartY) / 320) * 100;
  this.textFields[this.textDragging].x = Math.max(0, Math.min(100, this.textDragStartFieldX + dx));
  this.textFields[this.textDragging].y = Math.max(0, Math.min(100, this.textDragStartFieldY + dy));
}
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
  this.textDragging = '';
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
   this.saveFieldSettings(); // ← ADD THIS
  this.closePreviewModal();
}



private saveFieldSettings(): void {
  const holderType = this.selectedCard?.holderType ?? 'Resident';
  const tmpl = (this.cardTemplates as any)[holderType];
  const settings = {
    textFields: this.textFields,
    photo: {
      photoTop:    tmpl.photoTop,
      photoLeft:   tmpl.photoLeft,
      photoWidth:  tmpl.photoWidth,
      photoHeight: tmpl.photoHeight
    }
  };
  this.authService.saveCardPrintSettings(holderType, JSON.stringify(settings))
    .subscribe({ error: () => {} });
}

// print(): void {
//   if (!this.selectedCard) { alert('Please select a member first!'); return; }
//   const card = this.selectedCard;
//   const key = this.designKeyForCard(card);
//   const frontSrc = this.designTemplateCache[key] ?? '';

//   if (!frontSrc) {
//     alert(`No saved design/template for "${card.holderType}" in "${card.neighbourhood}". Please create it in Card Design first.`);
//     return;
//   }

//   const logoKey  = this.logoKeyForCard(card);
//   const photoBox = this.designPhotoBoxCache[key];
//   const logoBox  = this.designLogoBoxCache[key];
//   const logoSrc  = this.designLogoCache[logoKey] ?? '';
//   const fields   = this.designFieldsCache[key] ?? {};
//   const cardImg = new Image();
//   cardImg.crossOrigin = 'anonymous';
//   cardImg.onload = () => {
print(): void {
  if (!this.selectedCard) { alert('Please select a member first!'); return; }
  const card = this.selectedCard;

  if (this.cardType === 'blank') {
    this.printBlankCard(card);
    return;
  }

  const key = this.designKeyForCard(card);
  const frontSrc = this.designTemplateCache[key] ?? '';

  if (!frontSrc) {
    alert(`No saved design/template for "${card.holderType}" in "${card.neighbourhood}". Please create it in Card Design first.`);
    return;
  }

  const logoKey  = this.logoKeyForCard(card);
  const photoBox = this.designPhotoBoxCache[key];
  const logoBox  = this.designLogoBoxCache[key];
  const logoSrc  = this.designLogoCache[logoKey] ?? '';
  const fields   = this.designFieldsCache[key] ?? {};
  const logoEnabled = this.designLogoEnabledCache[key] !== false;
  const cardImg = new Image();
  cardImg.crossOrigin = 'anonymous';
  cardImg.onload = () => {
    const canvas  = document.createElement('canvas');
    canvas.width  = cardImg.naturalWidth;
    canvas.height = cardImg.naturalHeight;
    const ctx     = canvas.getContext('2d')!;
    ctx.drawImage(cardImg, 0, 0);

    const drawLogoTextAndFinish = () => {
      const finish = () => {
        ctx.textAlign = 'center';
        Object.keys(fields).forEach(fieldId => {
          const f = fields[fieldId];
          if (!f.enabled) return;
          const text = this.getFieldValue(fieldId);
          if (!text) return;
          ctx.fillStyle = f.color;
          ctx.font = `${f.bold ? 'bold' : 'normal'} ${Math.round(canvas.width * f.size)}px Segoe UI, sans-serif`;
          ctx.fillText(text, canvas.width * (f.x / 100), canvas.height * (f.y / 100));
        });
        const frontBase64 = canvas.toDataURL('image/jpeg', 0.95);
        this.openPrintWindow(frontBase64, frontBase64, card);
      };

      if (logoSrc && logoBox && logoEnabled) {
        const logoImg = new Image();
        logoImg.onload = () => {
          const lx = canvas.width  * (logoBox.left   / 200);
          const ly = canvas.height * (logoBox.top    / 320);
          const lw = canvas.width  * (logoBox.width  / 200);
          const lh = canvas.height * (logoBox.height / 320);
          ctx.drawImage(logoImg, lx, ly, lw, lh);
          finish();
        };
        logoImg.onerror = () => finish();
        logoImg.src = logoSrc;
      } else {
        finish();
      }
    };

    if (card.photoUrl && photoBox) {
      this.fetchImageAsBase64(card.photoUrl).then(base64 => {
        if (base64) {
          const photoImg = new Image();
          photoImg.onload = () => {
            const px = canvas.width  * (photoBox.left   / 200);
            const py = canvas.height * (photoBox.top    / 320);
            const pw = canvas.width  * (photoBox.width  / 200);
            const ph = canvas.height * (photoBox.height / 320);
            ctx.drawImage(photoImg, px, py, pw, ph);
            drawLogoTextAndFinish();
          };
          photoImg.onerror = () => drawLogoTextAndFinish();
          photoImg.src = base64;
        } else {
          drawLogoTextAndFinish();
        }
      });
    } else {
      drawLogoTextAndFinish();
    }
  };
  cardImg.onerror = () => alert('Card template failed to load.');
  cardImg.src = frontSrc;
}

// Same 54mm×86mm layout as print(), but with a plain white background
// instead of a template image — used when Card Type = Blank Card.
private printBlankCard(card: CardPrintEnroll): void {
  const key = this.designKeyForCard(card);
  const logoKey  = this.logoKeyForCard(card);
  const photoBox = this.designPhotoBoxCache[key];
  const logoBox  = this.designLogoBoxCache[key];
  const logoSrc  = this.designLogoCache[logoKey] ?? '';
  const fields   = this.designFieldsCache[key] ?? {};
  const logoEnabled = this.designLogoEnabledCache[key] !== false;

  const canvas  = document.createElement('canvas');
  canvas.width  = 648;
  canvas.height = Math.round(648 * 86 / 54);
  const ctx     = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const drawLogoTextAndFinish = () => {
    const finish = () => {
      ctx.textAlign = 'center';
      Object.keys(fields).forEach(fieldId => {
        const f = fields[fieldId];
        if (!f.enabled) return;
        const text = this.getFieldValue(fieldId);
        if (!text) return;
        ctx.fillStyle = f.color;
        ctx.font = `${f.bold ? 'bold' : 'normal'} ${Math.round(canvas.width * f.size)}px Segoe UI, sans-serif`;
        ctx.fillText(text, canvas.width * (f.x / 100), canvas.height * (f.y / 100));
      });
      const frontBase64 = canvas.toDataURL('image/jpeg', 0.95);
      this.openPrintWindow(frontBase64, frontBase64, card);
    };

    if (logoSrc && logoBox && logoEnabled) {
      const logoImg = new Image();
      logoImg.onload = () => {
        const lx = canvas.width  * (logoBox.left   / 200);
        const ly = canvas.height * (logoBox.top    / 320);
        const lw = canvas.width  * (logoBox.width  / 200);
        const lh = canvas.height * (logoBox.height / 320);
        ctx.drawImage(logoImg, lx, ly, lw, lh);
        finish();
      };
      logoImg.onerror = () => finish();
      logoImg.src = logoSrc;
    } else {
      finish();
    }
  };

  if (card.photoUrl && photoBox) {
    this.fetchImageAsBase64(card.photoUrl).then(base64 => {
      if (base64) {
        const photoImg = new Image();
        photoImg.onload = () => {
          const px = canvas.width  * (photoBox.left   / 200);
          const py = canvas.height * (photoBox.top    / 320);
          const pw = canvas.width  * (photoBox.width  / 200);
          const ph = canvas.height * (photoBox.height / 320);
          ctx.drawImage(photoImg, px, py, pw, ph);
          drawLogoTextAndFinish();
        };
        photoImg.onerror = () => drawLogoTextAndFinish();
        photoImg.src = base64;
      } else {
        drawLogoTextAndFinish();
      }
    });
  } else {
    drawLogoTextAndFinish();
  }
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