import { Component, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { MatIconModule } from '@angular/material/icon';

interface CameraItem {
  id: number;
  anprTerminalID: string;
  anprip: string;
  anpRport: string;
  anprLocation: string;
  anprMode: string;
  isActive: boolean;
  status: string;
}

interface TrackingRow {
  date: string;
  time: string;
  name: string;
  registrationNumber: string;
  plateImage: string;
  vehicleType?: string; // 'two' | 'four'
  evidenceImage?: string | null;
  auth?: boolean;
  isBlacklisted?: boolean;
  cameraName?: string;
  flatNumber?: string;
}

@Component({
  selector: 'app-camera-live',
  standalone: true,
  // imports: [CommonModule, FormsModule],
    imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './camera-live.component.html',
  styleUrl: './camera-live.component.scss'
})
export class CameraLiveComponent implements OnDestroy {

  // Township-API base URL, must end with /api/ (e.g. 'http://192.168.0.9:4500/api/')
  private apiBase = environment.apiurl;

  cameras: CameraItem[] = [];
  selectedCamera: CameraItem | null = null;

  isConnected = false;
  isConnecting = false;

  liveImageUrl: string | null = null;
  private ws: WebSocket | null = null;
  private connectedIp = '';

  trackingRows: TrackingRow[] = [];
  filterMode: 'live' | 'today' = 'live';
  private pollHandle: any = null;
  private isFetching = false;

  authFilter: 'all' | 'authorized' | 'unauthorized' = 'all';
  currentPage = 1;
  pageSize = 15;
  searchPlate = '';

  // ---------- Live Camera popup (stream runs only while open) ----------
  showLivePopup = false;

  openLivePopup() {
    this.showLivePopup = true;
    if (this.connectedIp) this.startLiveView(this.connectedIp);
  }

  closeLivePopup() {
    this.showLivePopup = false;
    this.stopLiveView();
  }

  // ---------- Log Details popup (i icon) ----------
  selectedRow: TrackingRow | null = null;
  openDetails(row: TrackingRow) { this.selectedRow = row; }
  closeDetails() { this.selectedRow = null; }

  typeLabel(r: TrackingRow): string {
    if (r.isBlacklisted) return 'Blacklisted';
    return r.auth ? 'Authorized' : 'Unauthorized';
  }

  vehicleLabel(r: TrackingRow): string {
    return this.isTwoWheeler(r) ? 'Two Wheeler' : 'Four Wheeler';
  }

  // ---------- Right side stat cards (from API rows) ----------
  private isAuthorized(r: TrackingRow): boolean {
    return !!r.auth;
  }

  private isTwoWheeler(r: TrackingRow): boolean {
    const t = (r.vehicleType || '').toLowerCase();
    return t.includes('two') || t.includes('bike') || t === '2w' || t === '2';
  }

  get stats() {
    const s = { authBike: 0, authCar: 0, unauthBike: 0, unauthCar: 0 };
    for (const r of this.trackingRows) {
      const bike = this.isTwoWheeler(r);
      if (this.isAuthorized(r)) { bike ? s.authBike++ : s.authCar++; }
      else { bike ? s.unauthBike++ : s.unauthCar++; }
    }
    return s;
  }

  // ---------- Graph (pure SVG, no library needed) ----------
  readonly chartW = 700;
  readonly chartH = 240;
  private readonly padL = 36;
  private readonly padR = 12;
  private readonly padT = 12;
  private readonly padB = 28;

  private hourOf(time: string): number {
    const m = /(\d{1,2}):\d{2}\s*(AM|PM)/i.exec(time || '');
    if (!m) return -1;
    let h = parseInt(m[1], 10) % 12;
    if (m[2].toUpperCase() === 'PM') h += 12;
    return h;
  }

  private hourlyRows: TrackingRow[] | null = null;
  private hourlyCache = { auth: Array(24).fill(0), unauth: Array(24).fill(0) };

  private get hourly() {
    if (this.hourlyRows === this.trackingRows) return this.hourlyCache; // reuse until new data arrives
    const auth = Array(24).fill(0);
    const unauth = Array(24).fill(0);
    for (const r of this.trackingRows) {
      const h = this.hourOf(r.time);
      if (h < 0) continue;
      this.isAuthorized(r) ? auth[h]++ : unauth[h]++;
    }
    this.hourlyRows = this.trackingRows;
    this.hourlyCache = { auth, unauth };
    return this.hourlyCache;
  }

  get chartMax(): number {
    const { auth, unauth } = this.hourly;
    const m = Math.max(...auth, ...unauth, 0);
    return Math.max(4, Math.ceil(m / 4) * 4);
  }

  private x(i: number): number {
    return this.padL + i * ((this.chartW - this.padL - this.padR) / 23);
  }

  private y(v: number): number {
    const plotH = this.chartH - this.padT - this.padB;
    return this.padT + plotH - (v / this.chartMax) * plotH;
  }

  private toPath(values: number[]): string {
    let d = `M ${this.x(0)} ${this.y(values[0])}`;
    for (let i = 1; i < values.length; i++) {
      const x0 = this.x(i - 1), y0 = this.y(values[i - 1]);
      const x1 = this.x(i), y1 = this.y(values[i]);
      const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    return d;
  }

  get authPath(): string { return this.toPath(this.hourly.auth); }

  // ---------- Graph hover tooltip ----------
  readonly hourIdx = Array.from({ length: 24 }, (_, i) => i);
  hoverHour = -1;

  setHover(i: number) { this.hoverHour = i; }
  clearHover() { this.hoverHour = -1; }

  get zoneW(): number { return (this.chartW - this.padL - this.padR) / 23; }
  zoneX(i: number): number { return this.x(i) - this.zoneW / 2; }

  private hourLabel(h: number): string {
    const hh = h % 24;
    const hr = hh % 12 === 0 ? 12 : hh % 12;
    return `${String(hr).padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`;
  }

  get hoverInfo() {
    if (this.hoverHour < 0) return null;
    const i = this.hoverHour;
    const { auth, unauth } = this.hourly;
    const w = 120, h = 58;
    let tx = this.x(i) + 12;
    if (tx + w > this.chartW - 4) tx = this.x(i) - w - 12;
    return {
      x: this.x(i),
      tx, ty: this.padT + 6, w, h,
      label: `${this.hourLabel(i)} - ${this.hourLabel(i + 1)}`,
      auth: auth[i],
      unauth: unauth[i],
      authY: this.y(auth[i]),
      unauthY: this.y(unauth[i])
    };
  }
  get unauthPath(): string { return this.toPath(this.hourly.unauth); }

  get yTicks() {
    const max = this.chartMax;
    return [0, 1, 2, 3, 4].map(i => ({ value: (max / 4) * i, y: this.y((max / 4) * i) }));
  }

  get xTicks() {
    const out: { x: number; label: string }[] = [];
    for (let h = 0; h < 24; h += 2) {
      const hr = h % 12 === 0 ? 12 : h % 12;
      out.push({ x: this.x(h), label: `${hr} ${h < 12 ? 'AM' : 'PM'}` });
    }
    return out;
  }

  // ---------- Table filter / search / paging ----------
  get filteredRows(): TrackingRow[] {
    let rows = this.trackingRows;

    if (this.authFilter === 'authorized') rows = rows.filter(r => r.auth);
    if (this.authFilter === 'unauthorized') rows = rows.filter(r => !r.auth);

    if (this.searchPlate.trim()) {
      const term = this.searchPlate.trim().toUpperCase();
      rows = rows.filter(r => r.registrationNumber && r.registrationNumber.toUpperCase().includes(term));
    }

    return rows;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }

  get pagedRows(): TrackingRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  // ---------- All Logs dropdown ----------
  showAuthMenu = false;

  get authLabel(): string {
    if (this.authFilter === 'authorized') return 'Authorized';
    if (this.authFilter === 'unauthorized') return 'Unauthorized';
    return 'All Logs';
  }

  toggleAuthMenu(event: Event) {
    event.stopPropagation();
    this.showAuthMenu = !this.showAuthMenu;
  }

  @HostListener('document:click')
  closeAuthMenu() {
    this.showAuthMenu = false;
  }

  setAuthFilter(mode: 'all' | 'authorized' | 'unauthorized') {
    this.authFilter = mode;
    this.currentPage = 1;
    this.showAuthMenu = false;
  }

  onSearch() {
    this.currentPage = 1;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  // ---------- Init / connect ----------
  constructor(private auth: AuthService, private http: HttpClient) {
    this.loadCameras();
  }

  loadCameras() {
    this.auth.getCameras().subscribe({
      next: (list: CameraItem[]) => this.cameras = list,
      error: () => Swal.fire('Error', 'Could not load camera list', 'error')
    });
  }

  onConnectClick() {
    if (!this.selectedCamera) {
      Swal.fire('Select Camera', 'Please choose a camera first', 'warning');
      return;
    }

    this.isConnecting = true;
    const ip = this.selectedCamera.anprip;
    const port = this.selectedCamera.anpRport;

    this.http.get<{ connected: boolean; message: string }>(
      `${this.apiBase}CameraLive/check?ip=${ip}&port=${port}`
    ).subscribe({
      next: (res) => {
        this.isConnecting = false;
        if (!res.connected) {
          Swal.fire('Camera Offline', `${this.selectedCamera?.anprLocation} is disconnected`, 'error');
          return;
        }
        this.connectedIp = ip;
        this.startTracking(ip, port);
        this.isConnected = true;
      },
      error: () => {
        this.isConnecting = false;
        Swal.fire('Error', 'Could not check camera status', 'error');
      }
    });
  }

  // ---------- Live view (WebSocket) ----------
  private startLiveView(ip: string) {
    this.stopLiveView();
    const wsUrl = this.apiBase.replace('http', 'ws') + `ws/live-view?ip=${ip}`;
    this.ws = new WebSocket(wsUrl);
    this.ws.binaryType = 'blob';

    this.ws.onmessage = (event: MessageEvent) => {
      const blob = event.data as Blob;
      if (this.liveImageUrl) URL.revokeObjectURL(this.liveImageUrl);
      this.liveImageUrl = URL.createObjectURL(blob);
    };

    this.ws.onerror = () => Swal.fire('Stream Error', 'Live view connection lost', 'error');
  }

  private stopLiveView() {
    if (this.ws) { this.ws.close(); this.ws = null; }
    if (this.liveImageUrl) { URL.revokeObjectURL(this.liveImageUrl); this.liveImageUrl = null; }
  }

  // ---------- Tracking (polling) ----------
  private startTracking(ip: string, port: string) {
    this.stopTracking();
    this.currentPage = 1;
    this.fetchTracking(ip, port);
    if (this.filterMode === 'live') {
      this.pollHandle = setInterval(() => this.fetchTracking(ip, port), 5000);
    }
  }

  private stopTracking() {
    if (this.pollHandle) { clearInterval(this.pollHandle); this.pollHandle = null; }
    this.isFetching = false;
  }

  private fetchTracking(ip: string, port: string) {
    if (this.isFetching) return; // previous call still running
    this.isFetching = true;

    let url = `${this.apiBase}CameraLive/tracking?ip=${ip}&port=${port}`;
    if (this.filterMode === 'today') {
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      url += `&date=${today}`;
    }

    this.http.get<TrackingRow[]>(url).subscribe({
      next: (rows) => {
        this.isFetching = false;
        this.trackingRows = rows;
        if (this.currentPage > this.totalPages) this.currentPage = 1;
      },
      error: (err) => {
        this.isFetching = false;
        console.error('Tracking call failed:', err.status, err.error);
      }
    });
  }

  setFilter(mode: 'live' | 'today') {
    this.filterMode = mode;
    if (this.selectedCamera) {
      this.startTracking(this.selectedCamera.anprip, this.selectedCamera.anpRport);
    }
  }

  disconnect() {
    this.stopLiveView();
    this.stopTracking();
    this.isConnected = false;
    this.showLivePopup = false;
    this.selectedRow = null;
    this.connectedIp = '';
    this.trackingRows = [];
  }

  ngOnDestroy() {
    this.disconnect();
  }
}