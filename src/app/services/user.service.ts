import { Injectable } from '@angular/core';

export interface User {
  name: string;
  companyID: string;
  company: string;
  email: string;
  uid: string;
  roleID: string;
  role?: string;
  loginTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private storageKey = 'user';

  constructor() { }

  setUser(user: User): void {
    const userWithTime = {
      ...user,
      loginTime: new Date().toISOString(),
      role: 'true'
    };
    localStorage.setItem(this.storageKey, JSON.stringify(userWithTime));
  }

  getUser(): User | null {
    const user = localStorage.getItem(this.storageKey);
    return user ? JSON.parse(user) : null;
  }

  getUserName(): string | null {
    return this.getUser()?.name || null;
  }

  getUserEmail(): string | null {
    return this.getUser()?.email || null;
  }

  getUserRoleID(): string | null {
    return this.getUser()?.roleID || null;
  }

  getCompanyName(): string | null {
    return this.getUser()?.company || null;
  }

  getCompanyID(): string | null {
    return this.getUser()?.companyID || null;
  }

  clearUser(): void {
    localStorage.removeItem(this.storageKey);
  }
}
