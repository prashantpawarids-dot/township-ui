


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
      if (a?.moduleKey != null && a?.authorityLevel != null) {
        const key = a.moduleKey;
        const level = Number(a.authorityLevel) || 0;
        //console.log(`Loading authority - ModuleKey: ${key}, Level: ${level}`);
        this.authorityMap.set(key, level);
      }
    });

    // console.log('🟢 AUTHORITY MAP AFTER LOAD:', Array.from(this.authorityMap.entries()));
  }

  /** Initialize from localStorage (for refresh) */
  initFromLocalStorage() {
    const stored = localStorage.getItem('authorities');
    if (stored) {
      const authorities = JSON.parse(stored);
      this.loadAuthorities(authorities);
      // console.log('🟢 Authorities reloaded from localStorage:', authorities);
    } else {
      // console.warn('⚠️ No authorities found in localStorage');
    }
  }

    private getLevel(moduleKey?:number | null): number {
      // console.log("Authority Map Contents:");
  this.authorityMap.forEach((value, key) => {
    // console.log(`Key: ${key}, Value: ${value}`);
  });

    if (!moduleKey) return 0;
    return this.authorityMap.get(moduleKey) ?? 0;
  }

  /** VIEW = Authority >= 1 */
  canView(moduleKey?: number | null): boolean {
    const level = this.getLevel(moduleKey);

   // console.log('Checking VIEW for moduleKey', moduleKey, '=> level', level);
    
    return level >=0;
  }

  /** INSERT = Authority >= 2 */
  canInsert(moduleKey?: number | null): boolean {
    const level = this.getLevel(moduleKey);
    // console.log('Checking INSERT for moduleKey', moduleKey, '=> level', level>0);
    return level >0;
  }

  /** UPDATE = Authority >= 3 */
  canUpdate(moduleKey?: number | null): boolean {
    const level = this.getLevel(moduleKey);
    //  console.log('Checking UPDATE for moduleKey', moduleKey, '=> level', (level > 2 && level >=3));
    return(level > 2 && level >=3);
  }

  /** DELETE = Authority === 4 */
  canDelete(moduleKey?: number | null): boolean {
    const level = this.getLevel(moduleKey);
    //  console.log('Checking DELETE for moduleKey', moduleKey, '=> level', level>3);
    return (level >3);
  }

   canBlock(moduleKey?: number | null): boolean {
    const level = this.getLevel(moduleKey);
    //  console.log('Checking DELETE for moduleKey', moduleKey, '=> level', level>3);
    return (level >2 );
  }


  
  isFullAccess(moduleKey?: number | null): boolean {
    return (this.getLevel(moduleKey) >3);
  }
}