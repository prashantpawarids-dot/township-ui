import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

type TextField = { id: string; label: string; size: number; color: string; bold: boolean; x: number; y: number; enabled: boolean };

interface DesignRow {
  categoryValue: string;
  categoryLabel: string;
  nrdId: number;
  nrdName: string;
  hasTemplate: boolean;
  hasSettings: boolean;
}

@Component({
  selector: 'app-card-design',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule],
  templateUrl: './card-design.component.html',
  styleUrls: ['./card-design.component.scss']
})
export class CardDesignComponent implements OnInit, OnDestroy {

  displayedColumns = ['category', 'neighbourhood', 'action'];

  categoryOptions = [
    { value: 'Resident',        label: 'Resident' },
    { value: 'DResident',       label: 'Resident (Dependent)' },
    { value: 'Tenant',          label: 'Tenant' },
    { value: 'DTenant',         label: 'Tenant (Dependent)' },
    { value: 'LandOwner',       label: 'Land Owner' },
    { value: 'DLandOwner',      label: 'Land Owner (Dependent)' },
    { value: 'Employee',        label: 'Employee' },
    { value: 'Contractor',      label: 'Contractor' },
    { value: 'ServiceProvider', label: 'Service Provider' },
    { value: 'Guest',           label: 'Guest' },
  ];

  // Groups P + D into one shared design. Only Contractor stays NRD-specific.
  // private categoryGroup: Record<string, string> = {
  //   Resident: 'Resident', DResident: 'Resident',
  //   Tenant: 'Tenant', DTenant: 'Tenant',
  //   LandOwner: 'LandOwner', DLandOwner: 'LandOwner',
  //   Employee: 'Employee', ServiceProvider: 'ServiceProvider',
  //   Guest: 'Guest', Contractor: 'Contractor'
  // };
  // isNrdSpecific(categoryValue: string): boolean {
  //   return this.categoryGroup[categoryValue] === 'Contractor';
  // }
  // get isNrdSpecificActive(): boolean {
  //   return this.activeRow ? this.isNrdSpecific(this.activeRow.categoryValue) : false;
  // }


  // Groups P + D into one shared design. Contractor is NRD-specific, Employee is Company-specific.
  private categoryGroup: Record<string, string> = {
    Resident: 'Resident', DResident: 'Resident',
    Tenant: 'Tenant', DTenant: 'Tenant',
    LandOwner: 'LandOwner', DLandOwner: 'LandOwner',
    Employee: 'Employee', ServiceProvider: 'ServiceProvider',
    Guest: 'Guest', Contractor: 'Contractor'
  };
  private nrdSpecificCategories = new Set(['Contractor', 'Employee']);
  isNrdSpecific(categoryValue: string): boolean {
    return this.nrdSpecificCategories.has(this.categoryGroup[categoryValue] ?? categoryValue);
  }
  isCompanySpecific(categoryValue: string): boolean {
    return false;
  }
  get isNrdSpecificActive(): boolean {
    return this.activeRow ? this.isNrdSpecific(this.activeRow.categoryValue) : false;
  }
  get isCompanySpecificActive(): boolean {
    return this.activeRow ? this.isCompanySpecific(this.activeRow.categoryValue) : false;
  }

  companies: any[] = [];

  neighbourhoods: any[] = [];
  allRows: DesignRow[] = [];
  savedRows: DesignRow[] = [];
  filterCategory: string = 'ALL';
  filterNRDId: number | null = null;

  templateCache: Record<string, string> = {};
  logoCache: Record<string, string> = {};

  showNewPicker = false;
  newCategory: string = '';
  newNRDId: number | null = null;

  showDesignPanel = false;
  activeRow: DesignRow | null = null;

previewPhoto = { top: 50, left: 40, width: 120, height: 100 };
  previewLogo  = { top: 10, left: 10, width: 50, height: 50 };
  logoEnabled: boolean = true;

  private fieldBlacklist = ['id', 'pid', 'cardType', 'templateName', 'cardPrintingDate', 'cardIssueDate'];

  private categoryToCardType: Record<string, string> = {
    Resident: 'PResident', DResident: 'DResident',
    Tenant: 'PTenant', DTenant: 'DTenant',
    LandOwner: 'PLandOwner', DLandOwner: 'DLandOwner',
    Employee: 'Employee', Contractor: 'Contractor',
    ServiceProvider: 'SProvider', Guest: 'Guest'
  };

  private fieldLabels: Record<string, string> = {
    idNumber: 'ID Number', shortname: 'Name', csn: 'Card Serial No',
    building: 'Building', flatNumber: 'Flat No', bld: 'Building/Flat',
    nrd: 'Neighbourhood', bloodGroup: 'Blood Group', validTill: 'Validity',
    custom1: 'Company', custom2: 'Agency'
  };

  fieldsFromApiByCategory: Record<string, string[]> = {};
  fieldsByKey: Record<string, Record<string, TextField>> = {};
  selectedFieldId: string = '';

  // ── NRD Logo Manager ──────────────────────────
  showLogoManager = false;
  logoManagerRows: { nrdId: number; nrdName: string; logoUrl: string }[] = [];

  private prettifyLabel(key: string): string {
    return this.fieldLabels[key] ?? (key.charAt(0).toUpperCase() + key.slice(1));
  }
get newDesignCategoryOptions() {
    const seen = new Set<string>();
    return this.categoryOptions.filter(cat => {
      const group = this.categoryGroup[cat.value] ?? cat.value;
      if (seen.has(group)) return false;
      seen.add(group);
      return true;
    });
  }

  private loadAvailableFieldsForCategory(category: string): void {
    if (this.fieldsFromApiByCategory[category]) { this.syncFieldDefinitions(category, this.fieldsFromApiByCategory[category]); return; }
    this.authService.getCardHolders('ALL', 'ALL').subscribe({
      next: (res: any) => {
        const cardType = this.categoryToCardType[category];
        const sample = Array.isArray(res) ? res.find((r: any) => r.cardType === cardType) : null;
        if (!sample) { this.fieldsFromApiByCategory[category] = ['shortname']; this.syncFieldDefinitions(category, ['shortname']); return; }

        let keys = Object.keys(sample).filter(k => !this.fieldBlacklist.includes(k));
        if (category !== 'Contractor') {
          keys = keys.filter(k => k !== 'custom1' && k !== 'custom2');
        }
        this.fieldsFromApiByCategory[category] = keys;
        this.syncFieldDefinitions(category, keys);
      },
      error: () => { this.fieldsFromApiByCategory[category] = ['shortname']; this.syncFieldDefinitions(category, ['shortname']); }
    });
  }

  private syncFieldDefinitions(category: string, apiKeys: string[]): void {
    const key = this.designKey;
    if (!this.fieldsByKey[key]) this.fieldsByKey[key] = {};
    apiKeys.forEach((fk, i) => {
      if (!this.fieldsByKey[key][fk]) {
        this.fieldsByKey[key][fk] = {
          id: fk, label: this.prettifyLabel(fk), size: 0.045, color: '#111111',
          bold: i < 2, x: 50, y: Math.min(92, 55 + i * 5), enabled: i < 3
        };
      }
    });
  }

  private isDragging = false;
  private isResizing = false;
  private resizeDir = '';
  private dragTarget: 'photo' | 'logo' = 'photo';
  private dragStartX = 0; private dragStartY = 0;
  private dragStartTop = 0; private dragStartLeft = 0;
  private resizeStartW = 0; private resizeStartH = 0;
  private resizeStartX = 0; private resizeStartY = 0;
  private resizeStartTop = 0; private resizeStartLeft = 0;
  private textDragging = '';
  private textDragStartX = 0; private textDragStartY = 0;
  private textDragStartFieldX = 0; private textDragStartFieldY = 0;
  private boundMouseMove: any; private boundMouseUp: any;

  // constructor(private authService: AuthService) {}

  // ngOnInit(): void {
  //   this.authService.getNeighbourhood().subscribe({
  //     next: (res: any) => {
  //       this.neighbourhoods = [{ name: 'ALL', id: null }, ...res.map((n: any) => ({ name: n.name ?? n.nrdname ?? n.Name, id: n.id }))];
  //       this.buildRows();
  //     },
  //     error: () => { this.neighbourhoods = [{ name: 'ALL', id: null }]; this.buildRows(); }
  //   });

  //   document.addEventListener('mousemove', this.boundMouseMove = this.onMouseMove.bind(this));
  //   document.addEventListener('mouseup',   this.boundMouseUp   = this.onMouseUp.bind(this));
  // }


  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getNeighbourhood().subscribe({
      next: (res: any) => {
        this.neighbourhoods = [{ name: 'ALL', id: null }, ...res.map((n: any) => ({ name: n.name ?? n.nrdname ?? n.Name, id: n.id }))];
        this.authService.getCompany().subscribe({
          next: (cres: any) => {
            this.companies = (cres ?? []).map((c: any) => ({ id: c.id, name: c.companyName ?? c.name }));
            this.buildRows();
          },
          error: () => { this.companies = []; this.buildRows(); }
        });
      },
      error: () => { this.neighbourhoods = [{ name: 'ALL', id: null }]; this.buildRows(); }
    });

    document.addEventListener('mousemove', this.boundMouseMove = this.onMouseMove.bind(this));
    document.addEventListener('mouseup',   this.boundMouseUp   = this.onMouseUp.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup',   this.boundMouseUp);
  }

  // Non-Contractor: key is category-group only (shared across all NRDs).
  // Contractor: key is group_nrdId (per-NRD, unchanged).
  private keyFor(categoryValue: string, nrdId: number): string {
    const group = this.categoryGroup[categoryValue] ?? categoryValue;
    if (this.isNrdSpecific(categoryValue)) return `${group}_${nrdId}`;
    if (this.isCompanySpecific(categoryValue)) return `${group}_Company_${nrdId}`; // nrdId reused to carry companyId
    return group;
  }

  private buildRows(): void {
    const rows: DesignRow[] = [];
    const nrdList = this.neighbourhoods.filter(n => n.id !== null);
    const seenGroups = new Set<string>();

    this.categoryOptions.forEach(cat => {
      if (this.isNrdSpecific(cat.value)) {
        nrdList.forEach(n => {
          rows.push({ categoryValue: cat.value, categoryLabel: cat.label, nrdId: n.id, nrdName: n.name, hasTemplate: false, hasSettings: false });
        });
      } else if (this.isCompanySpecific(cat.value)) {
        this.companies.forEach(c => {
          rows.push({ categoryValue: cat.value, categoryLabel: cat.label, nrdId: c.id, nrdName: c.name, hasTemplate: false, hasSettings: false });
        });
      } else {
        const group = this.categoryGroup[cat.value] ?? cat.value;
        if (seenGroups.has(group)) return;
        seenGroups.add(group);
        rows.push({ categoryValue: cat.value, categoryLabel: cat.label, nrdId: 0, nrdName: 'All Neighbourhoods', hasTemplate: false, hasSettings: false });
      }
    });

    this.allRows = rows;
    this.checkTemplatesExist();
  }

  private checkTemplatesExist(): void {
    this.allRows.forEach(row => {
      const key = this.keyFor(row.categoryValue, row.nrdId);
      this.authService.getCardMasterTemplate(key).subscribe({
        next: (res: any) => {
          const url = res?.base64 ?? res?.Base64 ?? '';
          this.templateCache[key] = url;
          row.hasTemplate = !!url;
          this.refreshSavedRows();
        },
        error: () => { row.hasTemplate = false; this.refreshSavedRows(); }
      });
      this.authService.getCardPrintSettings(key).subscribe({
        next: (res: any) => {
          row.hasSettings = !!res?.settingsJson;
          this.refreshSavedRows();
        },
        error: () => { row.hasSettings = false; this.refreshSavedRows(); }
      });
    });
  }

  private refreshSavedRows(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    let rows = this.allRows.filter(r => r.hasTemplate || r.hasSettings);
    if (this.filterCategory !== 'ALL') rows = rows.filter(r => r.categoryValue === this.filterCategory);
    if (this.filterNRDId !== null) rows = rows.filter(r => r.nrdId === this.filterNRDId || r.nrdId === 0);
    this.savedRows = rows;
  }

  openNewPicker(): void {
    this.newCategory = '';
    this.newNRDId = null;
    this.showNewPicker = true;
  }
  closeNewPicker(): void { this.showNewPicker = false; }

  startNewDesign(): void {
    if (!this.newCategory) return;
    const needsSelection = this.isNrdSpecific(this.newCategory) || this.isCompanySpecific(this.newCategory);
    if (needsSelection && !this.newNRDId) return;
    const catLabel = this.categoryOptions.find(c => c.value === this.newCategory)?.label ?? this.newCategory;
    const nrdId = needsSelection ? this.newNRDId! : 0;
    let nrdName = 'All Neighbourhoods';
    if (this.isNrdSpecific(this.newCategory)) nrdName = this.neighbourhoods.find(n => n.id === this.newNRDId)?.name ?? '';
    if (this.isCompanySpecific(this.newCategory)) nrdName = this.companies.find(c => c.id === this.newNRDId)?.name ?? '';
    this.showNewPicker = false;
    this.openDesign({ categoryValue: this.newCategory, categoryLabel: catLabel, nrdId, nrdName, hasTemplate: false, hasSettings: false });
  }

  get designKey(): string {
    return this.activeRow ? this.keyFor(this.activeRow.categoryValue, this.activeRow.nrdId) : '';
  }
  get templatePreviewUrl(): string { return this.templateCache[this.designKey] ?? ''; }
  get hasTemplate(): boolean { return !!this.templatePreviewUrl; }
  get logoUrl(): string { return this.logoCache[this.designKey] ?? ''; }
  get hasLogo(): boolean { return !!this.logoUrl; }

  get availableFieldIds(): string[] {
    return this.activeRow ? (this.fieldsFromApiByCategory[this.activeRow.categoryValue] ?? []) : [];
  }

  get activeFields(): TextField[] {
    const key = this.designKey;
    if (!this.fieldsByKey[key]) this.fieldsByKey[key] = {};
    return this.availableFieldIds.map(id => this.fieldsByKey[key][id]).filter(Boolean);
  }

  get enabledFields(): TextField[] {
    return this.activeFields.filter(f => f.enabled);
  }

  get selectedField(): TextField | null {
    const key = this.designKey;
    return this.selectedFieldId ? (this.fieldsByKey[key]?.[this.selectedFieldId] ?? null) : null;
  }

  toggleField(fieldId: string): void {
    const key = this.designKey;
    const f = this.fieldsByKey[key][fieldId];
    f.enabled = !f.enabled;
    if (f.enabled) this.selectedFieldId = fieldId;
    else if (this.selectedFieldId === fieldId) this.selectedFieldId = '';
  }

  openDesign(row: DesignRow): void {
    this.activeRow = row;
    this.selectedFieldId = '';
    this.previewPhoto = { top: 50, left: 40, width: 120, height: 100 };
    this.previewLogo  = { top: 10, left: 10, width: 50, height: 50 };
    this.logoEnabled = true;
    this.loadAvailableFieldsForCategory(row.categoryValue);
    this.loadFieldSettings(this.keyFor(row.categoryValue, row.nrdId));
    this.showDesignPanel = true;
  }

  closeDesignPanel(): void {
    this.showDesignPanel = false;
    this.activeRow = null;
  }

  private loadFieldSettings(key: string): void {
    this.authService.getCardMasterTemplate(key).subscribe({
      next: (res: any) => {
        this.templateCache[key] = res?.base64 ?? res?.Base64 ?? '';
        if (this.isNrdSpecificActive) {
          this.logoCache[key] = res?.logoBase64 ?? res?.LogoBase64 ?? '';
        }
      },
      error: () => {}
    });
    this.authService.getCardPrintSettings(key).subscribe({
      next: (res: any) => {
        if (!res?.settingsJson) return;
        try {
          const s = JSON.parse(res.settingsJson);
          if (s.fields) {
            if (!this.fieldsByKey[key]) this.fieldsByKey[key] = {};
            Object.keys(s.fields).forEach(fk => {
              this.fieldsByKey[key][fk] = { ...(this.fieldsByKey[key][fk] ?? {}), ...s.fields[fk] };
            });
          }
        if (s.photo) this.previewPhoto = { ...this.previewPhoto, ...s.photo };
          if (s.logo)  this.previewLogo  = { ...this.previewLogo,  ...s.logo };
          this.logoEnabled = s.logoEnabled !== false;
        } catch {}
      },
      error: () => {}
    });
  }

  onTemplateFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.activeRow) return;
    const key = this.designKey;
    this.authService.uploadCardMasterTemplate(file, key).subscribe({
      next: () => {
        this.authService.getCardMasterTemplate(key).subscribe({
          next: (res: any) => {
            this.templateCache[key] = res?.base64 ?? res?.Base64 ?? '';
            this.activeRow!.hasTemplate = !!this.templateCache[key];
            this.refreshSavedRows();
          }
        });
      },
      error: () => Swal.fire({ icon: 'error', title: 'Upload Failed' })
    });
  }

  // Contractor-only: logo is bundled with its own design, unchanged from before.
  onLogoFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.activeRow) return;
    const key = this.designKey;

    const reader = new FileReader();
    reader.onload = (e) => { this.logoCache[key] = e.target?.result as string; };
    reader.readAsDataURL(file);

    this.authService.uploadCardMasterTemplateLogo(key, file).subscribe({
      next: () => {
        this.authService.getCardMasterTemplate(key).subscribe({
          next: (res: any) => {
            const url = res?.logoBase64 ?? res?.LogoBase64 ?? '';
            if (url) this.logoCache[key] = url;
          }
        });
      },
      error: () => Swal.fire({ icon: 'error', title: 'Logo Upload Failed' })
    });
  }

  onBoxDragStart(e: MouseEvent, target: 'photo' | 'logo'): void {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    this.isDragging = true; this.dragTarget = target;
    const box = target === 'photo' ? this.previewPhoto : this.previewLogo;
    this.dragStartX = e.clientX; this.dragStartY = e.clientY;
    this.dragStartTop = box.top; this.dragStartLeft = box.left;
    e.preventDefault();
  }

  onBoxResizeStart(e: MouseEvent, dir: string, target: 'photo' | 'logo'): void {
    this.isResizing = true; this.resizeDir = dir; this.dragTarget = target;
    const box = target === 'photo' ? this.previewPhoto : this.previewLogo;
    this.resizeStartX = e.clientX; this.resizeStartY = e.clientY;
    this.resizeStartW = box.width; this.resizeStartH = box.height;
    this.resizeStartTop = box.top; this.resizeStartLeft = box.left;
    e.preventDefault(); e.stopPropagation();
  }

  onTextDragStart(e: MouseEvent, fieldId: string): void {
    e.preventDefault(); e.stopPropagation();
    const field = this.fieldsByKey[this.designKey][fieldId];
    if (!field) return;
    this.textDragging = fieldId;
    this.textDragStartX = e.clientX; this.textDragStartY = e.clientY;
    this.textDragStartFieldX = field.x;
    this.textDragStartFieldY = field.y;
    this.selectedFieldId = fieldId;
  }

  onMouseMove(e: MouseEvent): void {
    if (this.textDragging) {
      const field = this.fieldsByKey[this.designKey]?.[this.textDragging];
      if (field) {
        const dx = ((e.clientX - this.textDragStartX) / 200) * 100;
        const dy = ((e.clientY - this.textDragStartY) / 320) * 100;
        field.x = Math.max(0, Math.min(100, this.textDragStartFieldX + dx));
        field.y = Math.max(0, Math.min(100, this.textDragStartFieldY + dy));
      }
    }
    const box = this.dragTarget === 'photo' ? this.previewPhoto : this.previewLogo;
    if (this.isDragging) {
      box.top  = Math.max(0, this.dragStartTop  + (e.clientY - this.dragStartY));
      box.left = Math.max(0, this.dragStartLeft + (e.clientX - this.dragStartX));
    }
    if (this.isResizing) {
      const dx = e.clientX - this.resizeStartX, dy = e.clientY - this.resizeStartY;
      if (this.resizeDir === 'se') { box.width = Math.max(20, this.resizeStartW + dx); box.height = Math.max(20, this.resizeStartH + dy); }
      else if (this.resizeDir === 'sw') { box.width = Math.max(20, this.resizeStartW - dx); box.height = Math.max(20, this.resizeStartH + dy); box.left = this.resizeStartLeft + dx; }
      else if (this.resizeDir === 'ne') { box.width = Math.max(20, this.resizeStartW + dx); box.height = Math.max(20, this.resizeStartH - dy); box.top = this.resizeStartTop + dy; }
      else if (this.resizeDir === 'nw') { box.width = Math.max(20, this.resizeStartW - dx); box.height = Math.max(20, this.resizeStartH - dy); box.left = this.resizeStartLeft + dx; box.top = this.resizeStartTop + dy; }
    }
  }

  onMouseUp(): void { this.isDragging = false; this.isResizing = false; this.textDragging = ''; }

  resetPreviewPhoto(): void { this.previewPhoto = { top: 50, left: 40, width: 120, height: 100 }; }
  resetPreviewLogo(): void  { this.previewLogo  = { top: 10, left: 10, width: 50, height: 50 }; }

  saveDesign(): void {
    if (!this.activeRow) return;
    // const settings = { fields: this.fieldsByKey[this.designKey], photo: this.previewPhoto, logo: this.previewLogo };
    const settings = { fields: this.fieldsByKey[this.designKey], photo: this.previewPhoto, logo: this.previewLogo, logoEnabled: this.logoEnabled };
    const savedRow = this.activeRow;

    this.authService.saveCardPrintSettings(this.designKey, JSON.stringify(settings)).subscribe({
      next: () => {
        savedRow.hasTemplate = this.hasTemplate;
        savedRow.hasSettings = true;
        this.refreshSavedRows();
        Swal.fire({ icon: 'success', title: 'Design Saved', timer: 1500, showConfirmButton: false })
          .then(() => this.closeDesignPanel());
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Save Failed' });
      }
    });
  }

  // ── NRD Logo Manager (non-Contractor logos, one per NRD, shared across categories) ──
  openLogoManager(): void {
    this.logoManagerRows = this.neighbourhoods
      .filter(n => n.id !== null)
      .map(n => ({ nrdId: n.id, nrdName: n.name, logoUrl: '' }));
    this.showLogoManager = true;
    this.logoManagerRows.forEach(row => {
      const key = `Logo_${row.nrdId}`;
      this.authService.getCardMasterTemplate(key).subscribe({
        next: (res: any) => { row.logoUrl = res?.logoBase64 ?? res?.LogoBase64 ?? ''; },
        error: () => { row.logoUrl = ''; }
      });
    });
  }
  closeLogoManager(): void { this.showLogoManager = false; }

  onNrdLogoFileSelected(event: Event, row: { nrdId: number; nrdName: string; logoUrl: string }): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const key = `Logo_${row.nrdId}`;

    const reader = new FileReader();
    reader.onload = (e) => { row.logoUrl = e.target?.result as string; };
    reader.readAsDataURL(file);

    // uploadCardMasterTemplate creates the tblCardMasterTemplate row if missing (used as FilePath filler),
    // then attach the actual logo via uploadCardMasterTemplateLogo.
    this.authService.uploadCardMasterTemplate(file, key).subscribe({
      next: () => {
        this.authService.uploadCardMasterTemplateLogo(key, file).subscribe({
          next: () => Swal.fire({ icon: 'success', title: 'Logo Saved', timer: 1200, showConfirmButton: false }),
          error: () => Swal.fire({ icon: 'error', title: 'Logo Upload Failed' })
        });
      },
      error: () => Swal.fire({ icon: 'error', title: 'Logo Upload Failed' })
    });
  }

  deleteNrdLogo(row: { nrdId: number; nrdName: string; logoUrl: string }): void {
    const key = `Logo_${row.nrdId}`;
    Swal.fire({
      icon: 'warning',
      title: `Delete logo for ${row.nrdName}?`,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.authService.deleteCardMasterTemplateLogo(key).subscribe({
        next: () => {
          row.logoUrl = '';
          delete this.logoCache[key];
          Swal.fire({ icon: 'success', title: 'Logo Deleted', timer: 1200, showConfirmButton: false });
        },
        error: () => Swal.fire({ icon: 'error', title: 'Delete Failed' })
      });
    });
  }
}