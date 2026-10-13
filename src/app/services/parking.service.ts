// src/app/services/parking.service.ts
// Frontend-only logic. Uses ONLY existing APIs (no new table / no new API):
//   Report/vehicleInoutRegister  -> camera IN/OUT events
//   ANPR/vehicle                 -> registered vehicle master
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export type ParkStatus = 'IN' | 'OUT' | 'NONE';

export interface ParkingVehicle {
  plate: string;
  normPlate: string;
  owner: string;
  nrd: string;
  building: string;
  flat: string;
  status: ParkStatus;
  lastSeen: Date | null;
  camera: string;
  uniqueId: string;
}

export interface ParkingSummary {
  total: number;      // registered active four wheelers
  inside: number;     // latest event = IN
  out: number;        // latest event = OUT
  none: number;       // no event in the look-back window
  available: number;  // out + none
  percentFull: number;
}

@Injectable({ providedIn: 'root' })
export class ParkingService {
  private readonly PAGE_SIZE = 2000;

  constructor(private auth: AuthService) {}

  /** Plate normalisation: "MH 12 PP-7829" / "Mh12pp7829" -> "MH12PP7829" */
  static norm(plate: string): string {
    return (plate || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  /** lookbackDays = 1 means yesterday + today (so an IN from last night still counts). */
  load(lookbackDays: number = 1): Observable<ParkingVehicle[]> {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - lookbackDays);

    return forkJoin({
      vehicles: this.auth.getAnprVehicles(),
      events: this.loadEvents(from, to)
    }).pipe(map(r => this.build(r.vehicles || [], r.events || [])));
  }

  static summarize(list: ParkingVehicle[], nrd: string = 'All'): ParkingSummary {
    const rows = nrd === 'All' ? list : list.filter(v => v.nrd === nrd);
    const inside = rows.filter(v => v.status === 'IN').length;
    const out = rows.filter(v => v.status === 'OUT').length;
    const none = rows.filter(v => v.status === 'NONE').length;
    const total = rows.length;
    return {
      total, inside, out, none,
      available: out + none,
      percentFull: total ? Math.round((inside / total) * 100) : 0
    };
  }

  // ---------------------------------------------------------------

   private loadEvents(from: Date, to: Date): Observable<any[]> {
    const f = this.fmt(from), t = this.fmt(to);
    return this.auth.getVehicleInoutRegister(f, t, 1, this.PAGE_SIZE).pipe(
      switchMap((first: any) => {
        const firstRows: any[] = first?.data || [];
        const total = first?.totalCount || 0;
        const size = firstRows.length;
        console.log('PARKING paging: totalCount', total, 'firstPage', size);
        if (!size || total <= size) { return of(firstRows); }
        const pages = Math.min(Math.ceil(total / size), 30);
        const rest: Observable<any>[] = [];
        for (let p = 2; p <= pages; p++) {
          rest.push(this.auth.getVehicleInoutRegister(f, t, p, size));
        }
        return forkJoin(rest).pipe(map(results => {
          let all: any[] = firstRows.slice();
          results.forEach((r: any) => { all = all.concat(r?.data || []); });
          return all;
        }));
      })
    );
  }
  private build(vehicles: any[], events: any[]): ParkingVehicle[] {
    console.log('PARKING vehicles:', vehicles.length, vehicles[0]);
    console.log('PARKING events:', events.length, events[0]);
    // 1) latest event per plate, four wheeler only (duplicate reads are ignored automatically)
    const latest = new Map<string, { e: any; t: number }>();
    events.forEach(e => {
      if (e.vType !== 'Four Wheeler') { return; }
      const key = ParkingService.norm(e.vehicleNumber);
      if (!key) { return; }
      const t = Math.max(
        e.inTime ? new Date(e.inTime).getTime() : 0,
        e.outTime ? new Date(e.outTime).getTime() : 0
      );
      const cur = latest.get(key);
      if (!cur || t > cur.t) { latest.set(key, { e, t }); }
    });

    // 2) registered ACTIVE four wheelers, de-duplicated by normalised plate
    const master = new Map<string, any>();
      vehicles.forEach(v => {
      const plateRaw = v.regNo || v.vehicleNumber || v.vehicleNo || '';
      const vt = v.vType || v.vehicleType || '';
      const st = (v.status || 'Active') + '';
      if (vt !== 'Four Wheeler' || st.toLowerCase() !== 'active') { return; }
      const key = ParkingService.norm(plateRaw);
      if (key && !master.has(key)) { master.set(key, v); }
    });

    // 3) merge
    const result: ParkingVehicle[] = [];
    master.forEach((v, key) => {
      const hit = latest.get(key);
      let status: ParkStatus = 'NONE';
      let camera = '-';
      let uniqueId = '';
      if (hit) {
        const isIn = !!hit.e.inTime && (!hit.e.outTime ||
          new Date(hit.e.inTime).getTime() >= new Date(hit.e.outTime).getTime());
        status = isIn ? 'IN' : 'OUT';
        camera = (isIn ? hit.e.inCameraLocation : hit.e.outCameraLocation) || '-';
        uniqueId = (isIn ? hit.e.inUniqueId : hit.e.outUniqueId) || '';
      }
      result.push({
        // plate: (v.regNo || '').trim(),
                plate: (v.regNo || v.vehicleNumber || v.vehicleNo || '').trim(),
        normPlate: key,
        // owner: (v.shortname || '').trim(),
                owner: (v.shortname || v.ownerName || '').trim(),
        nrd: v.nrd || '-',
        building: typeof v.building === 'string' ? v.building : '-',
        flat: v.flatNumber || '-',
        status,
        lastSeen: hit ? new Date(hit.t) : null,
        camera,
        uniqueId
      });
    });
    // return result;
        console.log('PARKING result:', result.length, result[0]);
    return result;
  }

  /** API format: 01-Oct-2026 */
  private fmt(d: Date): string {
    const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dd = ('0' + d.getDate()).slice(-2);
    return `${dd}-${m[d.getMonth()]}-${d.getFullYear()}`;
  }
}
