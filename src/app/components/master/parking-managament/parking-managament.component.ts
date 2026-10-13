import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, of, timer } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import {
  ParkingService, ParkingSummary, ParkingVehicle, ParkStatus
} from 'src/app/services/parking.service';

@Component({
  selector: 'app-parking-managament',
  templateUrl: './parking-managament.component.html',
  styleUrls: ['./parking-managament.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ParkingManagamentComponent implements OnInit, OnDestroy {

  readonly REFRESH_MS = 30000;
  readonly LOOKBACK_DAYS = 1;
  readonly SHOW_DEBUG = true;   // kaam hone ke baad false kar dena

  all: ParkingVehicle[] = [];
  rows: ParkingVehicle[] = [];
  // societies: string[] = [];
    societies: string[] = [];
  nrdNames: string[] = [];
  societySummaries: { nrd: string; s: ParkingSummary }[] = [];
  summary: ParkingSummary = ParkingService.summarize([]);

  selectedNrd = 'All';
  tab: 'ALL' | ParkStatus = 'ALL';
  search = '';

  loading = true;
  error = '';
  lastUpdated: Date | null = null;

  selected: ParkingVehicle | null = null;
  imageSrc = '';
  imageLoading = false;
  imageError = '';

  readonly tabs: { key: 'ALL' | ParkStatus; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'IN', label: 'Inside' },
    { key: 'OUT', label: 'Available' },
    { key: 'NONE', label: 'No event' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private parking: ParkingService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

    private rebuildSocieties(): void {
    const fromVehicles = this.all.map(v => v.nrd);
    this.societies = Array.from(new Set([...this.nrdNames, ...fromVehicles]))
      .filter(n => !!n && n !== '-').sort() as string[];
    this.societySummaries = this.societies
      .map(n => ({ nrd: n, s: ParkingService.summarize(this.all, n) }))
      .filter(x => x.s.total > 0);
  }

  ngOnInit(): void {
    this.auth.getNeighbourhood().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const arr: any[] = Array.isArray(res) ? res : (res?.data || []);
        console.log('PARKING NRD:', arr.length, arr[0]);
        this.nrdNames = arr
          .map(x => (x.name || x.nrdName || x.nrd || x.nrdname || '') + '')
          .map(s => s.trim())
          .filter(s => !!s);
        this.zone.run(() => { this.rebuildSocieties(); this.cdr.detectChanges(); });
      },
      error: e => console.error('PARKING NRD ERROR:', e)
    });

    timer(0, this.REFRESH_MS).pipe(
      switchMap(() => this.parking.load(this.LOOKBACK_DAYS).pipe(
        catchError(err => {
          console.error('PARKING ERROR:', err);
          this.error = 'Could not load parking data: ' + (err?.message || err);
          return of(null);
        })
      )),
      takeUntil(this.destroy$)
    ).subscribe(list => {
      this.zone.run(() => {
        this.loading = false;
        if (list) {
          try {
            this.error = '';
            this.all = list;
            this.lastUpdated = new Date();
                       this.rebuildSocieties();
            this.refreshView();
          } catch (e) {
            console.error('PARKING RENDER ERROR:', e);
            this.error = 'Render error: ' + e;
          }
        }
        this.cdr.detectChanges();
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNrdChange(v: string): void { this.selectedNrd = v; this.refreshView(); }
  onSearch(v: string): void { this.search = v; this.refreshView(); }
  setTab(k: 'ALL' | ParkStatus): void { this.tab = k; this.refreshView(); }

  refreshView(): void {
    const q = this.search.trim().toLowerCase();
    const inNrd = this.selectedNrd === 'All' ? this.all : this.all.filter(v => v.nrd === this.selectedNrd);
    this.summary = ParkingService.summarize(this.all, this.selectedNrd);
    this.rows = inNrd
      .filter(v => this.tab === 'ALL' || v.status === this.tab)
      .filter(v => !q || (v.plate + ' ' + v.owner + ' ' + v.flat + ' ' + v.building).toLowerCase().indexOf(q) > -1)
      .sort((a, b) => (b.lastSeen?.getTime() || 0) - (a.lastSeen?.getTime() || 0));
  }

  statusLabel(s: ParkStatus): string {
    return s === 'IN' ? 'Inside' : s === 'OUT' ? 'Available' : 'No event';
  }

  openVehicle(v: ParkingVehicle): void {
    this.selected = v;
    this.imageSrc = '';
    this.imageError = '';
    if (!v.uniqueId) { this.imageError = 'No camera photo for this vehicle in the selected period.'; return; }
    this.imageLoading = true;
    this.auth.getVehicleImage(v.uniqueId).subscribe({
      next: res => {
        this.imageSrc = this.toImageSrc(res);
        this.imageLoading = false;
        if (!this.imageSrc) { this.imageError = 'Photo not available.'; }
        this.cdr.detectChanges();
      },
      error: () => {
        this.imageLoading = false;
        this.imageError = 'Photo not available.';
        this.cdr.detectChanges();
      }
    });
  }

  closeVehicle(): void { this.selected = null; }

  private toImageSrc(res: any): string {
    if (!res) { return ''; }
    const raw = typeof res === 'string' ? res : (res.image || res.imageBase64 || res.base64 || res.data || '');
    if (!raw) { return ''; }
    return raw.startsWith('data:') || raw.startsWith('http') ? raw : 'data:image/jpeg;base64,' + raw;
  }

  trackByPlate(_: number, v: ParkingVehicle): string { return v.normPlate; }
}