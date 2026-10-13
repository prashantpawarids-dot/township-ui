// Angular import
import { Component, OnInit, inject, output } from '@angular/core';
import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
// import { NavigationItem, NavigationItems } from '../navigation';
import { NavigationItem, NavigationItems } from '../navigation';
import { AuthorityService } from 'src/app/services/authority.service';
import { environment } from 'src/environments/environment';

import { NavGroupComponent } from './nav-group/nav-group.component';

// icon
import { IconService } from '@ant-design/icons-angular';
import {
   DashboardOutline,
  AppstoreOutline,
  CreditCardOutline,
  LoginOutline,
  QuestionOutline,
  ChromeOutline,
  FontSizeOutline,
  ProfileOutline,
  BgColorsOutline,
  AntDesignOutline,
  SettingOutline,
  BankOutline,
  IdcardOutline,
  UserOutline,
  TeamOutline,
  EnvironmentOutline,
  FileTextOutline,
  ToolOutline,
  SolutionOutline,
  GiftOutline,
  WifiOutline,
  VideoCameraOutline,
  SwapOutline,
  HomeOutline,
  CustomerServiceOutline,
  WarningOutline,
  StopOutline,
  UserAddOutline,
  EyeOutline,
  CarOutline,
  PrinterOutline,
  BarChartOutline
} from '@ant-design/icons-angular/icons';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-nav-content',
  imports: [CommonModule, RouterModule, NavGroupComponent, NgScrollbarModule],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit {
  private location = inject(Location);
private locationStrategy = inject(LocationStrategy);
private iconService = inject(IconService);
private authorityService = inject(AuthorityService);

  // public props
  NavCollapsedMob = output();

  navigations: NavigationItem[];
  // noAccessMessage: string = '';

  // version
  title = 'Demo application for version numbering';
  currentApplicationVersion = environment.appVersion;

  navigation = NavigationItems;
  windowWidth = window.innerWidth;

  // Constructor
  constructor() {
        this.iconService.addIcon(
      ...[
                DashboardOutline,
        AppstoreOutline,
        CreditCardOutline,
        FontSizeOutline,
        LoginOutline,
        ProfileOutline,
        BgColorsOutline,
        AntDesignOutline,
        ChromeOutline,
        QuestionOutline,
        SettingOutline,
        BankOutline,
        IdcardOutline,
        UserOutline,
        TeamOutline,
        EnvironmentOutline,
        FileTextOutline,
        ToolOutline,
        SolutionOutline,
        GiftOutline,
        WifiOutline,
        VideoCameraOutline,
        SwapOutline,
        HomeOutline,
        CustomerServiceOutline,
        WarningOutline,
        StopOutline,
        UserAddOutline,
        EyeOutline,
        CarOutline,
        PrinterOutline,
        BarChartOutline
      ]
    );
    this.navigations = NavigationItems;
  }

  // Life cycle events
  // ngOnInit() {
  //   if (this.windowWidth < 1025) {
  //     (document.querySelector('.coded-navbar') as HTMLDivElement).classList.add('menupos-static');
  //   }
  // }


//   ngOnInit() {
//   if (this.windowWidth < 1025) {
//     const navbar = document.querySelector('.coded-navbar') as HTMLDivElement;
//     if (navbar) {
//       navbar.classList.add('menupos-static');
//     }
//   }
//   // ✅ Filter navigation based on permissions
//   // this.navigations = this.filterNavigation(NavigationItems);

//   // ✅ Reload permissions from localStorage first
//   this.authorityService.initFromLocalStorage();
//   // ✅ Then filter navigation
//   this.navigations = this.filterNavigation(NavigationItems);
// }


ngOnInit() {
  if (this.windowWidth < 1025) {
    const navbar = document.querySelector('.coded-navbar') as HTMLDivElement;
    if (navbar) {
      navbar.classList.add('menupos-static');
    }
  }
  this.authorityService.initFromLocalStorage();
this.navigations = this.filterNavigation(NavigationItems);

// ✅ Re-run after short delay to catch post-login state
setTimeout(() => {
  this.authorityService.initFromLocalStorage();
  this.navigations = this.filterNavigation(NavigationItems);

  const hasAnyAccess = this.navigations
    .flatMap(g => g.children || [])
    .some(item => item.type === 'item' || (item.children || []).length > 0);

  
}, 500);
  // console.log('FILTERED NAV:', JSON.stringify(this.navigations));
  // ✅ Check if user has any access at all
  const hasAnyAccess = this.navigations
    .flatMap(g => g.children || [])
    .some(item => item.type === 'item' || (item.children || []).length > 0);

  
}

filterNavigation(items: NavigationItem[]): NavigationItem[] {
  return items
    .map(item => {
      // recursively filter children
      if (item.children && item.children.length > 0) {
        return { ...item, children: this.filterNavigation(item.children) };
      }
      return item;
    })
    .filter(item => {
      // always show groups
      if (item.type === 'group') return true;
      // show collapse only if it has visible children
      if (item.type === 'collapse') return (item.children || []).length > 0;
      // hide hidden items
      if (item.hidden) return false;
      // if no moduleKey — always show (dashboard, card-print-enroll)
      if (!item.moduleKey) return true;
      // ✅ show only if user has canView permission
      return this.authorityService.canView(item.moduleKey);
    });
}


  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('coded-hasmenu')) {
        parent.classList.add('coded-trigger');
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('coded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('coded-trigger');
        last_parent.classList.add('active');
      }
    }
  }

  navMob() {
    if (this.windowWidth < 1025 && document.querySelector('app-navigation.coded-navbar').classList.contains('mob-open')) {
      this.NavCollapsedMob.emit();
    }
  }
}
