// Angular import
import { Component, output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// project import

import { NavContentComponent } from './nav-content/nav-content.component';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import { MenuFoldOutline, MenuUnfoldOutline } from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [NavContentComponent, CommonModule, IconDirective],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  // media 1025 After Use Menu Open
  NavCollapsedMob = output();
  NavCollapse = output();

  @Input() navCollapsed = false;

  navCollapsedMob;
  windowWidth: number;

  // Constructor
    // Constructor
  constructor(private iconService: IconService) {
    this.iconService.addIcon(...[MenuFoldOutline, MenuUnfoldOutline]);
    this.windowWidth = window.innerWidth;
    this.navCollapsedMob = false;
  }

  // public method
  navCollapseMob() {
    if (this.windowWidth < 1025) {
      this.NavCollapsedMob.emit();
    }
  }

  toggleCollapse() {
    this.NavCollapse.emit();
  }
}
