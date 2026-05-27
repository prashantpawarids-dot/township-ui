import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthorityService {

  private authorityMap = new Map<number, number>();

  /** Load authorities into map */
  loadAuthorities(authorities: any[]) {
    this.authorityMap.clear();

    authorities.forEach(a => {
      const key = a?.moduleId ?? a?.moduleKey ?? null;
      const level = Number(a?.Authority ?? a?.authorityLevel ?? 0);

      if (key != null && key > 0) {
        this.authorityMap.set(key, level);
      }
    });
  }
private currentModuleId: number | null = null;

setCurrentModuleId(id: number) {
  this.currentModuleId = id;
}

  /** Initialize from localStorage (for refresh) */
  initFromLocalStorage() {
    const stored = localStorage.getItem('authorities');
    if (stored) {
      const authorities = JSON.parse(stored);
      this.loadAuthorities(authorities);
      // console.log('🟢 Authorities reloaded from localStorage');
    } else {
      console.warn('⚠️ No authorities found in localStorage');
    }
  }

  private getLevel(moduleKey?: number | null): number {
    if (!moduleKey) {
      // console.log('⚠️ moduleKey is null or undefined, returning level 0');
      return 0;
    }
    const level = this.authorityMap.get(moduleKey) ?? 0;
    // console.log(`🔍 getLevel(${moduleKey}) => ${level}`);
    return level;
  }

 

  /** VIEW = Authority >= 1 */
canView(moduleKey?: number | null): boolean {
  const level = this.getLevel(moduleKey);
  return level >= 1;
}

/** INSERT = Authority >= 2 */
canInsert(moduleKey?: number | null): boolean {
  const level = this.getLevel(moduleKey);
  return level >= 2;
}

/** UPDATE = Authority >= 3 */
canUpdate(moduleKey?: number | null): boolean {
  const level = this.getLevel(moduleKey);
  return level >= 3;
}

/** DELETE = Authority >= 4 */
canDelete(moduleKey?: number | null): boolean {
  const level = this.getLevel(moduleKey);
  return level >= 4;
}

/** BLOCK = Authority >= 3 */
canBlock(moduleKey?: number | null): boolean {
  const level = this.getLevel(moduleKey);
  return level >= 3;
}

/** FULL ACCESS = Authority === 4 */
isFullAccess(moduleKey?: number | null): boolean {
  const level = this.getLevel(moduleKey);
  return level === 4;
}

}