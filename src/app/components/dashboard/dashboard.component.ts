import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { environment } from 'src/environments/environment.prod';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
   MatIconModule,
    MatTooltipModule,
    BaseChartDirective
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
   selectedProject: string = '';
  projects: string[] = [];

  counts: Record<string, number> = {};
primaryDependent: Record<string, { primary: number; dependent: number }> = {};
  // nrdBreakdown: Record<string, Record<string, number>> = {}; 
    nrdBreakdown: Record<string, Record<string, number>> = {}; 
  cardSummaryNrdBreakdown: Record<string, Record<string, number>> = {};

    controllerStatus = { connected: false, in: 0, out: 0 };
  controllerStatusByProject: Record<string, { in: number; out: number }> = {};
      vehicleStatus = { connected: false, in: 0, out: 0 };
  // vehicleStatusByProject: Record<string, { in: number; out: number }> = {};
  vehicleStatusByProject: Record<string, { in: number; out: number }> = {};

  // 2W / 4W and Sticker breakdown for the Vehicle card
  vehicleTypeStats = {
    twoWheeler:  { total: 0, active: 0, inactive: 0 },
    fourWheeler: { total: 0, active: 0, inactive: 0 },
    withSticker: 0,
    noSticker: 0
  };
  vehicleTwoWheelerByProject: Record<string, { in: number; out: number }> = {};
  vehicleFourWheelerByProject: Record<string, { in: number; out: number }> = {};
  vehicleStickerByProject: Record<string, { withSticker: number; noSticker: number }> = {};
  anprCameraStatus = { connected: false, in: 0, out: 0 };
  visitorStatus = { twoWheeler: 0, fourWheeler: 0 };

  authorizedToday = { in: 0, out: 0, total: 0 };
  // notExitedToday: { total: number; byLocation: { location: string; count: number }[] } = { total: 0, byLocation: [] };
    notExitedToday: { total: number; byLocation: { location: string; count: number }[] } = { total: 0, byLocation: [] };
  notExitedOverall: { total: number; byLocation: { location: string; count: number }[] } = { total: 0, byLocation: [] };
  unauthorizedToday = { in: 0, out: 0, total: 0 };

    // displayedCounts: { Encoded: number; NonEncoded: number; Total: number } = { Encoded: 0, NonEncoded: 0, Total: 0 };

        displayedCounts: { Encoded: number; NonEncoded: number; Blocked: number; Total: number } = { Encoded: 0, NonEncoded: 0, Blocked: 0, Total: 0 };

  // ── Environment Monitoring ──
  // Loni Kalbhor coordinates (change these if the site is elsewhere)
  private readonly envLat = 18.48;
  private readonly envLon = 74.02;

   airQuality: {
    aqi: number | null; pm25: number | null; pm10: number | null;
    label: string; note: string; level: 'good' | 'moderate' | 'poor'; source: string;
  } = { aqi: null, pm25: null, pm10: null, label: 'Loading…', note: '', level: 'moderate', source: 'Fetching live data…' };

  envWeather = {
    uv: null as number | null, uvLabel: '--', uvLevel: 'good' as 'good' | 'moderate' | 'poor',
    humidity: null as number | null, humidityLabel: '',
    wind: null as number | null, gust: null as number | null,
    visibility: null as number | null, visibilityLabel: ''
  };

  // Ring length for the gauges: value out of max, drawn on a circle of radius 50
  gaugeDash(value: number | null, max: number): string {
    const circ = 2 * Math.PI * 50;
    const filled = Math.min(Math.max(value ?? 0, 0) / max, 1) * circ;
    return `${filled} ${circ}`;
  }

  // Water: no public API exists for a society's tank. Replace these with sensor / lab values later.
  waterReadings = { ph: 7.4, tds: 180, turbidity: 0.6, source: 'Sample readings · sensor feed not connected' };

  // Grades water by BIS IS 10500 limits: pH 6.5–8.5, TDS ≤500 (max 2000), turbidity ≤1 NTU (max 5)
  get waterStatus(): { label: string; level: 'good' | 'moderate' | 'poor' } {
    const { ph, tds, turbidity } = this.waterReadings;
    const rank = { good: 0, moderate: 1, poor: 2 };
    const levels: ('good' | 'moderate' | 'poor')[] = [
      (ph >= 6.5 && ph <= 8.5) ? 'good' : 'poor',
      tds <= 500 ? 'good' : tds <= 2000 ? 'moderate' : 'poor',
      turbidity <= 1 ? 'good' : turbidity <= 5 ? 'moderate' : 'poor'
    ];
    const worst = levels.reduce((a, b) => (rank[b] > rank[a] ? b : a));
    const labels = { good: 'Good', moderate: 'Moderate', poor: 'Poor' };
    return { label: labels[worst], level: worst };
  }

    private aqiInfo(aqi: number): { label: string; note: string; level: 'good' | 'moderate' | 'poor' } {
    if (aqi <= 50)  return { label: 'Good', note: 'Air quality is satisfactory', level: 'good' };
    if (aqi <= 100) return { label: 'Moderate', note: 'Acceptable for most people', level: 'moderate' };
    if (aqi <= 150) return { label: 'Poor', note: 'Unhealthy for sensitive groups', level: 'poor' };
    if (aqi <= 200) return { label: 'Unhealthy', note: 'Everyone may feel effects', level: 'poor' };
    if (aqi <= 300) return { label: 'Very Unhealthy', note: 'Avoid outdoor activity', level: 'poor' };
    return { label: 'Hazardous', note: 'Health emergency conditions', level: 'poor' };
  }

  private uvInfo(uv: number): { label: string; level: 'good' | 'moderate' | 'poor' } {
    if (uv <= 2)  return { label: 'Low', level: 'good' };
    if (uv <= 5)  return { label: 'Moderate', level: 'moderate' };
    if (uv <= 7)  return { label: 'High', level: 'moderate' };
    if (uv <= 10) return { label: 'Very High', level: 'poor' };
    return { label: 'Extreme', level: 'poor' };
  }

  // Uses native fetch (not HttpClient) so your auth interceptor never sends your token to a 3rd-party site
    fetchAirQuality() {
    const lat = this.envLat, lon = this.envLon;
    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,uv_index&timezone=Asia%2FKolkata`;
    const wxUrl  = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m,wind_speed_10m,wind_gusts_10m,visibility&timezone=Asia%2FKolkata`;

    // Air quality + UV
    fetch(airUrl)
      .then(r => r.json())
      .then(res => {
        const c = res?.current;
        if (!c || c.us_aqi == null) throw new Error('No data');
        const aqi = Math.round(c.us_aqi);
        const info = this.aqiInfo(aqi);
        this.airQuality = {
          aqi,
          pm25: Math.round(c.pm2_5),
          pm10: Math.round(c.pm10),
          label: info.label,
          note: info.note,
          level: info.level,
          source: 'Live · Open-Meteo (CAMS) · Outdoor'
        };
        if (c.uv_index != null) {
          const uv = Math.round(c.uv_index);
          const u = this.uvInfo(uv);
          this.envWeather = { ...this.envWeather, uv, uvLabel: u.label, uvLevel: u.level };
        }
      })
      .catch(() => {
        this.airQuality = { ...this.airQuality, label: 'Unavailable', note: '', source: 'Could not load live data' };
      });

    // Humidity, wind, visibility
    fetch(wxUrl)
      .then(r => r.json())
      .then(res => {
        const c = res?.current;
        if (!c) return;
        const hum = c.relative_humidity_2m != null ? Math.round(c.relative_humidity_2m) : null;
        const vis = c.visibility != null ? Math.round(c.visibility / 100) / 10 : null;
        this.envWeather = {
          ...this.envWeather,
          humidity: hum,
          humidityLabel: hum == null ? '' : hum < 30 ? 'Dry' : hum <= 55 ? 'Comfortable' : 'Humid',
          wind: c.wind_speed_10m != null ? Math.round(c.wind_speed_10m) : null,
          gust: c.wind_gusts_10m != null ? Math.round(c.wind_gusts_10m) : null,
          visibility: vis,
          visibilityLabel: vis == null ? '' : vis >= 10 ? 'Excellent' : vis >= 5 ? 'Good' : vis >= 2 ? 'Moderate' : 'Poor'
        };
      })
      .catch(() => { /* leave tiles showing -- */ });
  }

  // ── Amenities (names come from API, live numbers are dummy for now) ──
  amenityCards: {
    id: number; name: string; icon: string; color: string; isActive: boolean;
    access: string; total: number; totalLabel: string;
    splits: { label: string; value: number; icon: string }[];
  }[] = [];

  // Key = lowercase amenity name from API
  amenityConfig: Record<string, any> = {
    'club': {
      icon: 'sports_bar', color: 'linear-gradient(135deg, #8e7bff, #6a5cf0)',
      access: 'Booking Required', totalLabel: '',
      splits: [
        { label: 'Members', value: 14, icon: 'person' },
        { label: 'Guests',  value: 8,  icon: 'group_add' }
      ]
    },
    'club house': {
      icon: 'meeting_room', color: 'linear-gradient(135deg, #4facfe, #3f8ff5)',
      access: 'Booking Required', totalLabel: '',
      splits: [
        { label: 'Members', value: 11, icon: 'person' },
        { label: 'Guests',  value: 7,  icon: 'group_add' }
      ]
    },
    'gym': {
      icon: 'fitness_center', color: 'linear-gradient(135deg, #ffb74d, #ff9800)',
      access: 'Card / Pass', totalLabel: '',
      splits: [
        { label: 'Male',   value: 9, icon: 'male' },
        { label: 'Female', value: 6, icon: 'female' }
      ]
    },
    'swimming pool': {
      icon: 'pool', color: 'linear-gradient(135deg, #34d3c4, #14a89b)',
      access: 'Card / Pass', totalLabel: '',
      splits: [
        { label: 'Male',     value: 7, icon: 'male' },
        { label: 'Female',   value: 6, icon: 'female' },
        { label: 'Children', value: 4, icon: 'child_care' }
      ]
    }
  };

  // Updated to gradient strings so the stat pills render like the
  // reference UI (glossy gradient pill cards with a white icon circle).
    metricColors = [
    'linear-gradient(135deg, #4facfe, #4a7ff0)',   // blue
    'linear-gradient(135deg, #ff6b6b, #ee2e5c)',   // red
    'linear-gradient(135deg, #8e7bff, #6a5cf0)',   // purple/indigo
    'linear-gradient(135deg, #4c1d95, #a21caf)',   // Guests — deep violet to magenta
    'linear-gradient(135deg, #43e97b, #2fb96a)',   // green
    'linear-gradient(135deg, #ffb74d, #ff9800)',   // orange
    'linear-gradient(135deg, #34d3c4, #14a89b)',   // teal
    'linear-gradient(135deg, #ff8a65, #f4511e)'    // orange-red
  ];

  // Separate palettes — not reused from metricColors, so charts never inherit
  // the stat-card gradient values (which would break canvas rendering)
 barChartColors = [
    '#6C5CE7', '#00B8A9', '#F67280', '#FDCB6E',
    '#55E6C1', '#786FA6', '#63CDDA', '#EA8685'
  ];

  pieChartColors = [
    '#6C5CE7', '#00B8A9', '#F67280', '#FDCB6E',
    '#55E6C1', '#786FA6', '#63CDDA', '#EA8685'
  ];
  metricIcons = [
    'home',
    'apartment',
    'landscape',
        'person',
    'badge',
    'handyman',
    'engineering',
    'groups'
  ];
       metricsOrder = [
    'Residents', 'Tenants', 'Landowners', 'Guests',
    'Employees', 'Service Providers', 'Contractors', 'Visitors'
  ];

  // Same order as metricsOrder — empty string means "not clickable" (Visitors, index 4)
  metricRoutes = [
    '/reports/resident',
    '/reports/tenant',
    '/reports/landOwner',
        '/reports/guestInOutLog',
    '',
    '/reports/serviceProvider',
    '/reports/contractorEmployee',
    '/reports/employee'
  ];

  barChartData!: ChartConfiguration<'bar'>['data'];
  barChartOptions: ChartOptions<'bar'> = { responsive: true, plugins: { legend: { position: 'top' } } };
  lineChartData!: ChartConfiguration<'line'>['data'];
  lineChartOptions: ChartOptions<'line'> = { responsive: true };
  pieChartData!: ChartConfiguration<'pie'>['data'];
  pieChartOptions: ChartOptions<'pie'> = { responsive: true };

  projectData: Record<string, any> = {
    Falcon: {
      counts: {},
      controllerStatus: { connected: true, in: 12, out: 9 },
      vehicleStatus: { connected: false, in: 8, out: 5 },
      visitorStatus: { twoWheeler: 20, fourWheeler: 10 },
      chartData: { months: ['Jan','Feb','Mar','Apr','May','Jun'], visitors: [65,59,80,81,56,55], vehicles: [20,30,50,40,60,70] }
    },
    Skylark: {
      counts: {},
      controllerStatus: { connected: true, in: 6, out: 4 },
      vehicleStatus: { connected: true, in: 10, out: 8 },
      visitorStatus: { twoWheeler: 18, fourWheeler: 8 },
      chartData: { months: ['Jan','Feb','Mar','Apr','May','Jun'], visitors: [45,49,70,61,36,75], vehicles: [25,35,45,55,65,75] }
    },
    Tiger: {
      counts: {},
      controllerStatus: { connected: false, in: 3, out: 2 },
      vehicleStatus: { connected: true, in: 14, out: 11 },
      visitorStatus: { twoWheeler: 25, fourWheeler: 12 },
      chartData: { months: ['Jan','Feb','Mar','Apr','May','Jun'], visitors: [85,79,90,71,96,95], vehicles: [40,60,80,100,120,140] }
    }
  };

     constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

    // Generic navigation for clickable dashboard cards — pass the route path directly from the template
  goToPage(path: string) {
    this.router.navigate([path]);
  }

  // Top stat cards (metricsOrder) → their report page, using the index-aligned metricRoutes.
  // Does nothing for cards with an empty route (Visitors).
  goToMetricPage(index: number) {
    const path = this.metricRoutes[index];
    if (path) {
      this.router.navigate([path]);
    }
  }

        ngOnInit(): void {
    this.fetchProjects();
    this.fetchDashboardData();
    this.fetchCameraStatus();
     this.fetchVehicleStatus();
        this.fetchControllerStatus();
        this.fetchAmenities();
        this.fetchNotExitedOverall();   // fills both Today and Overall
      this.fetchAirQuality();
    // this.fetchTodayVehicleStatus();
  }

  // ── Amenities: names/status from API, counts from amenityConfig (dummy) ──
  fetchAmenities() {
    this.authService.getAmenities().subscribe({
      next: (res: any[]) => {
        const order = ['club', 'club house', 'gym', 'swimming pool'];
        const cards: any[] = [];

        for (const item of (res || [])) {
          const key = (item?.name ?? '').toString().trim().toLowerCase();
          const cfg = this.amenityConfig[key];
          if (!cfg) continue; // only show the 4 amenities we have layouts for

          const splits = cfg.splits.map((s: any) => ({ ...s }));
          cards.push({
            id: item.id,
            name: item.name,
            icon: cfg.icon,
            color: cfg.color,
            isActive: item.isactive === true,
            access: cfg.access,
            totalLabel: cfg.totalLabel,
            splits,
            total: splits.reduce((sum: number, s: any) => sum + s.value, 0)
          });
        }

        cards.sort((a, b) =>
          order.indexOf(a.name.toLowerCase()) - order.indexOf(b.name.toLowerCase()));
        this.amenityCards = cards;
      },
      error: () => {
        // leave existing amenityCards untouched on failure
      }
    });
  }

  // ── Today's Authorized vs Unauthorized vehicle IN/OUT counts ──
  // (weekly/monthly/date-range breakdown stays in the reports, this is just today's snapshot)
  // fetchTodayVehicleStatus() {
  //   const today = new Date();
  //   const dateStr = today.toISOString().split('T')[0]; // yyyy-MM-dd

  //   const authInUrl    = `${environment.apiurl}Report/vehicleInoutRegister?fromDateTime=${dateStr}&toDateTime=${dateStr}&inOut=IN&pageNumber=1&pageSize=1`;
  //   const authOutUrl   = `${environment.apiurl}Report/vehicleInoutRegister?fromDateTime=${dateStr}&toDateTime=${dateStr}&inOut=OUT&pageNumber=1&pageSize=1`;
  //   const unauthInUrl  = `${environment.apiurl}Report/UnAuthorisedVehicleInoutRegister?fromDateTime=${dateStr}&toDateTime=${dateStr}&inOut=IN&pageNumber=1&pageSize=1`;
  //   const unauthOutUrl = `${environment.apiurl}Report/UnAuthorisedVehicleInoutRegister?fromDateTime=${dateStr}&toDateTime=${dateStr}&inOut=OUT&pageNumber=1&pageSize=1`;

  //   forkJoin({
  //     authIn: this.http.get<any>(authInUrl),
  //     authOut: this.http.get<any>(authOutUrl),
  //     unauthIn: this.http.get<any>(unauthInUrl),
  //     unauthOut: this.http.get<any>(unauthOutUrl)
  //   }).subscribe({
  //     next: (res) => {
  //       const authIn  = res.authIn?.totalCount ?? 0;
  //       const authOut = res.authOut?.totalCount ?? 0;
  //       const unauthIn  = res.unauthIn?.totalCount ?? 0;
  //       const unauthOut = res.unauthOut?.totalCount ?? 0;

  //       this.authorizedToday   = { in: authIn, out: authOut, total: authIn + authOut };
  //       this.unauthorizedToday = { in: unauthIn, out: unauthOut, total: unauthIn + unauthOut };
  //     },
  //     error: () => {
  //       // leave existing values untouched on failure
  //     }
  //   });
  // }

   

  // ── Projects (Neighbourhoods) now come from live NRD API, not hardcoded ──
  fetchProjects() {
    this.authService.getNeighbourhood().subscribe({
      next: (res: any[]) => {
        const list = res || [];
        this.projects = list.map(n => n.name).filter(Boolean);
        if (this.projects.length > 0 && !this.projects.includes(this.selectedProject)) {
          this.selectedProject = this.projects[0];
        }
        this.loadProjectData(this.selectedProject);
      },
      error: () => {
        // leave existing projects list untouched on failure
      }
    });
  }


cameraStatus = {
  connected: false,
  in: 0,
  out: 0
};
cameraStatusByProject: Record<string, { in: number; out: number }> = {};

// fetchVehicleStatus() {
//   const apiUrl = `${environment.apiurl}ANPR/vehicle`;

//   this.http.get<any[]>(apiUrl).subscribe({
//     next: (vehicles) => {
//       const connected = vehicles.filter(
//         v => v.status === 'Active'
//       ).length;

//       const disconnected = vehicles.length - connected;

//       this.vehicleStatus = {
//         connected: connected > 0,
//         in: connected,
//         out: disconnected
//       };
//     },
//     error: () => {
//       // leave existing vehicleStatus untouched
//     }
//   });
// }


fetchVehicleStatus() {
  const apiUrl = `${environment.apiurl}ANPR/vehicle`;

  this.http.get<any>(apiUrl).subscribe({
    next: (response) => {
      // Handle both raw array responses and wrapped { data: [...] } responses
      const vehicles: any[] = Array.isArray(response)
        ? response
        : (response?.data ?? response?.result ?? []);

      if (!Array.isArray(vehicles) || vehicles.length === 0) {
        this.vehicleStatus = { connected: false, in: 0, out: 0 };
        // this.vehicleStatusByProject = {};
        this.vehicleStatusByProject = {};
        this.vehicleTypeStats = { twoWheeler: { total: 0, active: 0, inactive: 0 }, fourWheeler: { total: 0, active: 0, inactive: 0 }, withSticker: 0, noSticker: 0 };
        this.vehicleTwoWheelerByProject = {};
        this.vehicleFourWheelerByProject = {};
        this.vehicleStickerByProject = {};
        return;
      }

      const connected = vehicles.filter(
        v => (v?.status ?? '').toString().trim().toLowerCase() === 'active'
      ).length;

      const disconnected = vehicles.length - connected;

      this.vehicleStatus = {
        connected: connected > 0,
        in: connected,
        out: disconnected
      };

      // Group vehicles by their nrd (project) — same pattern as controllerStatusByProject
      const byProject: Record<string, { in: number; out: number }> = {};
      for (const v of vehicles) {
        const project = (v?.nrd ?? '').toString().trim() || 'Unknown';
        if (!byProject[project]) byProject[project] = { in: 0, out: 0 };
        if ((v?.status ?? '').toString().trim().toLowerCase() === 'active') {
          byProject[project].in++;
        } else {
          byProject[project].out++;
        }
      }
      // this.vehicleStatusByProject = byProject;
      this.vehicleStatusByProject = byProject;

      // ── Two/Four wheeler + Sticker breakdown (project-wise) ──
      const twoW: Record<string, { in: number; out: number }> = {};
      const fourW: Record<string, { in: number; out: number }> = {};
      const sticker: Record<string, { withSticker: number; noSticker: number }> = {};
      const stats = {
        twoWheeler:  { total: 0, active: 0, inactive: 0 },
        fourWheeler: { total: 0, active: 0, inactive: 0 },
        withSticker: 0,
        noSticker: 0
      };

      for (const v of vehicles) {
        const project = (v?.nrd ?? '').toString().trim() || 'Unknown';
        const isActive = (v?.status ?? '').toString().trim().toLowerCase() === 'active';
        const type = (v?.vType ?? '').toString().trim().toLowerCase();

        // every project appears in every popover (with 0 if it has none)
        if (!twoW[project])   twoW[project]   = { in: 0, out: 0 };
        if (!fourW[project])  fourW[project]  = { in: 0, out: 0 };
        if (!sticker[project]) sticker[project] = { withSticker: 0, noSticker: 0 };

        // Sticker: null / empty / "No" / "NA" / "-" means no sticker
        const st = (v?.stickerNo ?? '').toString().trim().toLowerCase();
        const hasSticker = st !== '' && !['no', 'na', 'n/a', 'null', 'none', '-'].includes(st);
        if (hasSticker) { sticker[project].withSticker++; stats.withSticker++; }
        else            { sticker[project].noSticker++;   stats.noSticker++; }

        if (type.includes('two')) {
          stats.twoWheeler.total++;
          if (isActive) { twoW[project].in++;  stats.twoWheeler.active++; }
          else          { twoW[project].out++; stats.twoWheeler.inactive++; }
        } else if (type.includes('four')) {
          stats.fourWheeler.total++;
          if (isActive) { fourW[project].in++;  stats.fourWheeler.active++; }
          else          { fourW[project].out++; stats.fourWheeler.inactive++; }
        }
      }

      this.vehicleTypeStats = stats;
      this.vehicleTwoWheelerByProject = twoW;
      this.vehicleFourWheelerByProject = fourW;
      this.vehicleStickerByProject = sticker;
    },
    error: (err) => {
      console.error('Vehicle status fetch failed:', err);
      // leave existing vehicleStatus / vehicleStatusByProject untouched
    }
  });
}

getVehicleTypeProjectEntries(type: 'two' | 'four'): { name: string; in: number; out: number }[] {
  const src = type === 'two' ? this.vehicleTwoWheelerByProject : this.vehicleFourWheelerByProject;
  return Object.entries(src)
    .map(([name, val]) => ({ name, in: val.in, out: val.out }))
    .sort((a, b) => (b.in + b.out) - (a.in + a.out));
}

getVehicleStickerProjectEntries(kind: 'with' | 'no'): { name: string; count: number }[] {
  return Object.entries(this.vehicleStickerByProject)
    .map(([name, val]) => ({ name, count: kind === 'with' ? val.withSticker : val.noSticker }))
    .sort((a, b) => b.count - a.count);
}

getVehicleProjectEntries(): { name: string; in: number; out: number }[] {
  return Object.entries(this.vehicleStatusByProject)
    .map(([name, val]) => ({ name, in: val.in, out: val.out }))
    .sort((a, b) => (b.in + b.out) - (a.in + a.out));
}

fetchCameraStatus() {
  const apiUrl = `${environment.apiurl}ANPR/camera/list`;

  this.http.get<any[]>(apiUrl).subscribe({
    next: (cameras) => {
      const connected = cameras.filter(
        c => c.status === 'Connected'
      ).length;

      const disconnected = cameras.length - connected;

      this.cameraStatus = {
        connected: connected > 0,
        in: connected,
        out: disconnected
      };

      // Group cameras by their anprLocation (project/site) — same pattern as controllerStatusByProject
      const byProject: Record<string, { in: number; out: number }> = {};
      for (const cam of cameras) {
        const project = (cam?.anprLocation ?? '').toString().trim() || 'Unknown';
        if (!byProject[project]) byProject[project] = { in: 0, out: 0 };
        if (cam?.status === 'Connected') byProject[project].in++;
        else byProject[project].out++;
      }
      this.cameraStatusByProject = byProject;
    },
    error: () => {
      // leave existing cameraStatus / cameraStatusByProject untouched
    }
  });
}

getCameraProjectEntries(): { name: string; in: number; out: number }[] {
  return Object.entries(this.cameraStatusByProject)
    .map(([name, val]) => ({ name, in: val.in, out: val.out }))
    .sort((a, b) => (b.in + b.out) - (a.in + a.out));
}



   // ── Controllers: live TCP-checked status from Reader API (not the dashboard summary) ──
  fetchControllerStatus() {
    const apiUrl = `${environment.apiurl}Reader`;
    this.http.get<any[]>(apiUrl).subscribe({
      next: (readers) => {
        const list = readers || [];
        const connected = list.filter(r => r.status === 'Connected').length;
        const disconnected = list.filter(r => r.status === 'Disconnected').length;
        this.controllerStatus = { connected: connected > 0, in: connected, out: disconnected };

        // Group readers by their nrdName (project) — purely data-driven,
        // works for however many/whatever projects the API returns.
        const byProject: Record<string, { in: number; out: number }> = {};
        for (const reader of list) {
          const project = (reader?.nrdName ?? '').toString().trim() || 'Unknown';
          if (!byProject[project]) byProject[project] = { in: 0, out: 0 };
          if (reader?.status === 'Connected') byProject[project].in++;
          else if (reader?.status === 'Disconnected') byProject[project].out++;
        }
        this.controllerStatusByProject = byProject;
      },
      error: () => {
        // leave existing controllerStatus / controllerStatusByProject untouched on failure
      }
    });
  }

  fetchDashboardData() {
    const apiUrl = `${environment.apiurl}Report/Dashboard`;
    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        this.processApiData(data);
        this.loadProjectData(this.selectedProject);
      },
      error: () => this.loadProjectData(this.selectedProject)
    });
  }

// FIND



// REPLACE
  // Maps a raw CardType value (as stored in vwCardHolders) to the dashboard metric name
  mapCardTypeToMetric(type: string): string | null {
    if (type === 'DResident' || type === 'PResident') return 'Residents';
    if (type === 'DTenant' || type === 'PTenant') return 'Tenants';
    if (type === 'DLandOwner' || type === 'PLandOwner') return 'Landowners';
    if (type === 'Guest') return 'Guests';
    if (type === 'Visitor') return 'Visitors';
    if (type === 'SProvider') return 'Service Providers';
    if (type === 'Employee') return 'Employees';
    if (type === 'Contractor' || type === 'DContractor') return 'Contractors';
    return null;
  }

  // Builds a multi-line "NRD Name: count" string for the stat-card tooltip
   // Returns sorted [{name, count}] rows for the custom NRD popover, highest first
  getNrdEntries(metric: string): { name: string; count: number }[] {
    const breakdown = this.nrdBreakdown[metric];
    if (!breakdown) return [];
    return Object.entries(breakdown)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);
  }

  getCardSummaryNrdEntries(key: string): { name: string; count: number }[] {
    const breakdown = this.cardSummaryNrdBreakdown[key];
    if (!breakdown) return [];
    return Object.entries(breakdown)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);
  }

  getControllerProjectEntries(): { name: string; in: number; out: number }[] {
    return Object.entries(this.controllerStatusByProject)
      .map(([name, val]) => ({ name, in: val.in, out: val.out }))
      .sort((a, b) => (b.in + b.out) - (a.in + a.out));
  }

  processApiData(data: any[]) {
    const counts: any = {};
    const primaryDependent: any = {};
    const nrdBreakdown: any = {};
    const cardSummaryNrdBreakdown: any = {};
    let controllerActive = 0, controllerNonActive = 0;
    // let encoded = 0, nonEncoded = 0, total = 0;
        let encoded = 0, nonEncoded = 0, blocked = 0, total = 0;

    let twoWheelerCount = 0;
    let fourWheelerCount = 0;

    for (const item of data) {
      // Cardholder counts
      if (item.keyName === 'CardHoldersCount') {
        const type = item.displayData;
        const count = +item.total;

        if (type === 'DResident') {
          counts['Residents'] = (counts['Residents'] || 0) + count;
          primaryDependent['Residents'] = {
            primary: primaryDependent['Residents']?.primary || 0,
            dependent: count
          };
        }
        if (type === 'PResident') {
          counts['Residents'] = (counts['Residents'] || 0) + count;
          primaryDependent['Residents'] = {
            primary: count,
            dependent: primaryDependent['Residents']?.dependent || 0
          };
        }

        if (type === 'DTenant') {
          counts['Tenants'] = (counts['Tenants'] || 0) + count;
          primaryDependent['Tenants'] = {
            primary: primaryDependent['Tenants']?.primary || 0,
            dependent: count
          };
        }
        if (type === 'PTenant') {
          counts['Tenants'] = (counts['Tenants'] || 0) + count;
          primaryDependent['Tenants'] = {
            primary: count,
            dependent: primaryDependent['Tenants']?.dependent || 0
          };
        }

        if (type === 'DLandOwner') {
          counts['Landowners'] = (counts['Landowners'] || 0) + count;
          primaryDependent['Landowners'] = {
            primary: primaryDependent['Landowners']?.primary || 0,
            dependent: count
          };
        }
        if (type === 'PLandOwner') {
          counts['Landowners'] = (counts['Landowners'] || 0) + count;
          primaryDependent['Landowners'] = {
            primary: count,
            dependent: primaryDependent['Landowners']?.dependent || 0
          };
        }

        if (type === 'Guest') counts['Guests'] = (counts['Guests']||0)+count;
        if (type === 'Visitor') counts['Visitors'] = (counts['Visitors']||0)+count;
        if (type === 'SProvider') counts['Service Providers'] = (counts['Service Providers']||0)+count;
      if (type === 'Employee') counts['Employees'] = (counts['Employees']||0)+count;
        if (type === 'Contractor' || type === 'DContractor') counts['Contractors'] = (counts['Contractors']||0)+count;
      }

            // NRD-wise breakdown per metric (for stat-card tooltips)
      if (item.groupID === 'CardHolderTypeByNRD') {
        const metric = this.mapCardTypeToMetric(item.keyName);
        const nrd = item.displayData;
        const count = +item.total;
        if (metric && nrd) {
          if (!nrdBreakdown[metric]) nrdBreakdown[metric] = {};
          nrdBreakdown[metric][nrd] = (nrdBreakdown[metric][nrd] || 0) + count;
        }
      }

      // NRD-wise breakdown for Card Summary (Total / Encoded / NonEncoded)
      if (item.groupID === 'CardEncodedNonEncodeByNRD') {
        const key = item.keyName; // 'Total' | 'Encoded' | 'NonEncoded'
        const nrd = item.displayData;
        const count = +item.total;
        if (key && nrd) {
          if (!cardSummaryNrdBreakdown[key]) cardSummaryNrdBreakdown[key] = {};
          cardSummaryNrdBreakdown[key][nrd] = (cardSummaryNrdBreakdown[key][nrd] || 0) + count;
        }
      }



      // Encoded/Non-encoded counts
      if (item.groupID === 'CardEncodedNonEncode') {
        if (item.displayData === 'Encoded') encoded = +item.total;
        // if (item.displayData === 'NonEncoded') nonEncoded = +item.total;
                if (item.displayData === 'NonEncoded') nonEncoded = +item.total;
        if (item.displayData === 'Blocked') blocked = +item.total;
        if (item.displayData === 'Encode/NonEncodeTotal') total = +item.total;
      }

      // Controller status
      if (item.keyName==='ControllerCount') {
        if (item.displayData==='Active') controllerActive = +item.total;
        if (item.displayData==='Non-Active') controllerNonActive = +item.total;
      }

      // Vehicle counts
      if (item.groupID === 'Vehicle') {
        if (item.displayData === 'Two Wheeler') twoWheelerCount = +item.total;
        if (item.displayData === 'Four Wheeler') fourWheelerCount = +item.total;
      }
    }

    // Update component state
   this.counts = counts;
    this.primaryDependent = primaryDependent;
    this.nrdBreakdown = nrdBreakdown;
    this.cardSummaryNrdBreakdown = cardSummaryNrdBreakdown;  
    this.counts['Encoded'] = encoded;
    // this.counts['NonEncoded'] = nonEncoded;
        this.counts['NonEncoded'] = nonEncoded;
    this.counts['Blocked'] = blocked;
       // controllerStatus now comes from fetchControllerStatus() (live Reader API check) - don't overwrite it here
    // this.vehicleStatus = { connected: (twoWheelerCount+fourWheelerCount)>0, in: twoWheelerCount+fourWheelerCount, out: 0 };
    this.visitorStatus = { twoWheeler: twoWheelerCount, fourWheeler: fourWheelerCount };

    // Set displayed counts with API total if available
    // this.displayedCounts = {
    //   Encoded: encoded,
    //   NonEncoded: nonEncoded,
    //   Total: total || (encoded + nonEncoded)
    // };


               this.displayedCounts = {
      Encoded: encoded,
      NonEncoded: Math.max(nonEncoded - blocked, 0),   // Not Issued = no CSN minus Blocked
      Blocked: blocked,
      Total: total || (encoded + nonEncoded)
    };

    this.animateCounts();
    this.updatePieChart();
    this.loadBarChartFromCounts();
  }

  animateCounts() {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    const targets = { ...this.displayedCounts };
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      this.displayedCounts.Encoded = Math.floor(targets.Encoded*(currentStep/steps));
      // this.displayedCounts.NonEncoded = Math.floor(targets.NonEncoded*(currentStep/steps));
            this.displayedCounts.NonEncoded = Math.floor(targets.NonEncoded*(currentStep/steps));
      this.displayedCounts.Blocked = Math.floor(targets.Blocked*(currentStep/steps));
      this.displayedCounts.Total = Math.floor(targets.Total*(currentStep/steps));
      if(currentStep>=steps){
        this.displayedCounts = {...targets};
        clearInterval(timer);
      }
    }, interval);
  }

  updatePieChart() {
    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];

    this.metricsOrder.forEach((metric, i)=>{
      const pd = this.primaryDependent[metric];
      if(pd){
        labels.push(`${metric} Primary`);
        labels.push(`${metric} Dependent`);
        data.push(pd.primary);
        data.push(pd.dependent);
        colors.push(this.pieChartColors[i]);
        colors.push(this.pieChartColors[i]+'80');
      } else {
        labels.push(metric);
        data.push(this.counts[metric]||0);
        colors.push(this.pieChartColors[i]);
      }
    });

    this.pieChartData = { labels, datasets: [{ data, backgroundColor: colors }] };
  }

  loadBarChartFromCounts() {
    const labels = this.metricsOrder;
    const primaryData: number[] = [];
    const dependentData: number[] = [];
    const dependentColors = this.barChartColors.map(c => c+'80');

    this.metricsOrder.forEach((metric, i) => {
      const pd = this.primaryDependent[metric];
      if(pd){
        primaryData.push(pd.primary);
        dependentData.push(pd.dependent);
      } else {
        primaryData.push(this.counts[metric] || 0);
        dependentData.push(0);
      }
    });

    this.barChartData = {
      labels,
      datasets: [
        { data: primaryData, label: 'Primary', backgroundColor: this.barChartColors },
        { data: dependentData, label: 'Dependent', backgroundColor: dependentColors }
      ]
    };
  }

            loadProjectData(project: string) {
    const pd = this.projectData[project] || this.projectData['Falcon'];
    if(!pd) return;

    // vehicleStatus now comes from fetchCameraStatus() (real camera pings) - don't overwrite it here
    // controllerStatus now comes from fetchControllerStatus() (real Reader API check) - don't overwrite it here

    this.lineChartData = {
      labels: pd.chartData.months,
      datasets: [
        { data: pd.chartData.visitors, label: `${project} - Visitors`, borderColor: '#00B8A9', backgroundColor: 'rgba(0,184,169,0.18)', fill: true, tension: 0.4, borderWidth: 3, pointRadius: 5, pointHoverRadius: 7, pointBackgroundColor: '#fff', pointBorderColor: '#00B8A9', pointBorderWidth: 2 },
        { data: pd.chartData.vehicles, label: `${project} - Vehicles`, borderColor: '#F67280', backgroundColor: 'rgba(246,114,128,0.18)', fill: true, tension: 0.4, borderWidth: 3, pointRadius: 5, pointHoverRadius: 7, pointBackgroundColor: '#fff', pointBorderColor: '#F67280', pointBorderWidth: 2 }
      ]
    };
  }

  // onProjectChange(project: 'Falcon'|'Skylark'|'Tiger') {
  //   this.selectedProject = project;
  //   this.loadProjectData(project);
  // }

               onProjectChange(project: string) {
    this.selectedProject = project;
    this.loadProjectData(project);
    this.fetchCameraStatus();
    this.fetchControllerStatus();
  }
    getStatusClass(connected: boolean) { return connected ? 'connected' : 'disconnected'; }

  



  

    // ── Alert: OVERALL Not Exited unknown vehicles (all dates, location wise) ──
  fetchNotExitedOverall() {
    const apiUrl = `${environment.apiurl}Report/UnAuthorisedNotExitedOverall`;
    this.http.get<any>(apiUrl).subscribe({
      next: (res) => {
        this.notExitedOverall = {
          total: res?.total ?? 0,
          byLocation: res?.data ?? []
        };
        // Today comes from the same API response
        this.notExitedToday = {
          total: res?.today?.total ?? 0,
          byLocation: res?.today?.data ?? []
        };
      },
      error: () => {
        // leave existing values untouched on failure
      }
    });
  }

  // Report khulegi: aaj ki date + Not Exited (location ho to wo bhi)
    // Unauthorized report khulegi (filter wahan se select karna hai)
  goToNotExited(location?: string) {
    this.router.navigate(['/reports/unauthorized']);
  }
}
