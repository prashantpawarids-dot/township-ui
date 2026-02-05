// angular import
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-nav-right',
  imports: [CommonModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent {

  styleSelectorToggle = input<boolean>();
  Customize = output();
  windowWidth: number;
  screenFull: boolean = true;

  constructor(private router: Router) {
    this.windowWidth = window.innerWidth;

  }

  onLogout() {
    this.router.navigate(['/login']);
  }

  get getName() {
    return localStorage.getItem("Name") || "";
  }

  get lastLoginTime() {
    return localStorage.getItem("loginTime");
  }



}
