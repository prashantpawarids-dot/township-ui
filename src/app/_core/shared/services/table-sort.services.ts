import { Injectable } from '@angular/core';

export type SortDirection = 'asc' | 'desc';

@Injectable({ providedIn: 'root' })
export class TableSortService {
  private sortColumn: string = '';
  private sortDirection: SortDirection = 'asc';

  sortData<T>(data: T[], column: string): T[] {
    const direction = this.sortDirection;

    return data.sort((a: any, b: any) => {
      let valueA = a[column] ?? '';
      let valueB = b[column] ?? '';

      if (column.toLowerCase().includes('time') || valueA instanceof Date || valueB instanceof Date) {
        return direction === 'asc'
          ? new Date(valueA).getTime() - new Date(valueB).getTime()
          : new Date(valueB).getTime() - new Date(valueA).getTime();
      }

      if (typeof valueA === 'string') {
        return direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return direction === 'asc'
        ? valueA - valueB
        : valueB - valueA;
    });
  }

  getSortColumn(): string {
    return this.sortColumn;
  }

  getSortDirection(): 'asc' | 'desc' {
    return this.sortDirection;
  }

  setSortColumn(column: string, direction: 'asc' | 'desc' = 'asc') {
    this.sortColumn = column;

    // Automatically set date/time columns to 'desc' (descending) by default
    if (column.toLowerCase().includes('time')) {
      this.sortDirection = 'desc';
    } else {
      this.sortDirection = direction;
    }
  }

  toggleDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }
}
