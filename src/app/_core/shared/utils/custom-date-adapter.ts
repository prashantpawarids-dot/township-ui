import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const str = value.toString().trim();
    const parts = str.split('/');
    if (parts.length === 3) {
      const d = new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`);
      if (!isNaN(d.getTime())) return d;
    }
    const fallback = new Date(str);
    return isNaN(fallback.getTime()) ? null : fallback;
  }
  override format(date: Date): string {
    const dd = date.getDate().toString().padStart(2,'0');
    const mm = (date.getMonth()+1).toString().padStart(2,'0');
    return `${dd}/${mm}/${date.getFullYear()}`;
  }
}