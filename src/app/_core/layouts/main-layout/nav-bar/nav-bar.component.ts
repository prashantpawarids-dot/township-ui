// angular import
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
// project import

import { NavLeftComponent } from './nav-left/nav-left.component';
import { NavRightComponent } from './nav-right/nav-right.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, NavLeftComponent, NavRightComponent],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
  // Output events
  @Output() NavCollapse = new EventEmitter<void>();
  @Output() NavCollapsedMob = new EventEmitter<void>();

  navCollapsed: boolean;
  windowWidth: number;
  navCollapsedMob: boolean;

  backgroundImages: string[] = [
    // 'assets/images/header-Image-1.jpeg',
    'assets/images/header-Image-2.jpeg',
    // 'assets/images/header-Image-3.jpeg',
    'assets/images/header-Image-4.jpeg',
    'assets/images/header-Image-5.jpeg',
    'assets/images/header-Image-6.jpeg',
    'assets/images/header-Image-7.jpeg'

  ];
  currentBackground: string = this.backgroundImages[0];
  private index = 0;
  private intervalId: any;


  // Constructor
  constructor() {
    this.windowWidth = window.innerWidth;
    this.navCollapsedMob = false;
  }

  ngOnInit(): void {
    this.intervalId = setInterval(()=> {
      this.setBackgroundImage();
    }, 4000);
  }

  setBackgroundImage() {
    var img = new Image();
    this.index = (this.index + 1) % this.backgroundImages.length;
    let image_url = this.backgroundImages[this.index];

    img.onload = () => {
      this.currentBackground = image_url;
    };
    img.src = this.backgroundImages[this.index];
  }

  // Cleanup
  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }


  // public method
  navCollapse() {
    if (this.windowWidth >= 1025) {
      this.navCollapsed = !this.navCollapsed;
      this.NavCollapse.emit();
    }
  }

  navCollapseMob() {
    if (this.windowWidth < 1025) {
      this.NavCollapsedMob.emit();
    }
  }
}
