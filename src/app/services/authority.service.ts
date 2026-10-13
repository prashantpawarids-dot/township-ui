



import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthorityService {

  private permissionMap = new Map<number, {
    canInsert: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canView: boolean;
  }>();

  loadAuthorities(authorities: any[]) {
    this.permissionMap.clear();

    authorities.forEach(a => {
      const key = a?.moduleKey ?? a?.moduleId ?? null;
      if (key != null && key > 0) {
        this.permissionMap.set(key, {
          canInsert: a.canInsert === true || a.canInsert === 1,
          canUpdate: a.canUpdate === true || a.canUpdate === 1,
          canDelete: a.canDelete === true || a.canDelete === 1,
          canView:   a.canView   === true || a.canView   === 1
        });
      }
    });
  }

  initFromLocalStorage() {
    const stored = localStorage.getItem('authorities');
    if (stored) {
      const authorities = JSON.parse(stored);
      this.loadAuthorities(authorities);
    }
  }

  canView(moduleKey?: number | null): boolean {
    if (!moduleKey) return false;
    return this.permissionMap.get(moduleKey)?.canView ?? false;
  }

  canInsert(moduleKey?: number | null): boolean {
    if (!moduleKey) return false;
    return this.permissionMap.get(moduleKey)?.canInsert ?? false;
  }

  canUpdate(moduleKey?: number | null): boolean {
    if (!moduleKey) return false;
    return this.permissionMap.get(moduleKey)?.canUpdate ?? false;
  }

  canDelete(moduleKey?: number | null): boolean {
    if (!moduleKey) return false;
    return this.permissionMap.get(moduleKey)?.canDelete ?? false;
  }

  canBlock(moduleKey?: number | null): boolean {
  if (!moduleKey) return false;
  const p = this.permissionMap.get(moduleKey);
  // Block button only shows if user has all 4 permissions
  return (p?.canInsert && p?.canUpdate && p?.canDelete && p?.canView) ?? false;
}

  isFullAccess(moduleKey?: number | null): boolean {
    if (!moduleKey) return false;
    const p = this.permissionMap.get(moduleKey);
    return (p?.canInsert && p?.canUpdate && p?.canDelete && p?.canView) ?? false;
  }
}