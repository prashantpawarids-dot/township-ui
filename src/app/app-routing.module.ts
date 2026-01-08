import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './_core/layouts/main-layout/main-layout.component';
import { AdminLayoutComponent } from './_core/layouts/admin-layout/admin-layout.component';
import { authGuard } from './guards/auth.guard';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
     {
  path: 'dashboard',
  loadComponent: () => import('./components/dashboard/dashboard.component').then(c => c.DashboardComponent),
}
,
      {
        path: 'master',
        loadComponent: () => import('./components/master/master.component').then((c) => c.MasterComponent),
        children: [
          {
            path: 'company',
            canActivate: [authGuard],
            loadComponent: () => import('./components/master/company/company.component').then((c) => c.CompanyComponent)
          },
          
          {
            path: 'profile',
            canActivate: [authGuard],
            loadComponent: () => import('./components/master/profile/profile.component').then((c) => c.ProfileComponent)
          },
          {
            path: 'project',
            canActivate: [authGuard],
            loadComponent: () => import('./components/master/project/project.component').then((c) => c.ProjectComponent)
          },
          {
            path: 'user',
            canActivate: [authGuard],
            loadComponent: () => import('./components/master/user/user.component').then((c) => c.UserComponent)
          },
          {
            path: 'river-view-city',
            canActivate: [authGuard],
            loadComponent: () => import('./components/master/river-view-city/river-view-city.component').then((c) => c.RiverViewCityComponent)
          },
          {
            path: 'neighbourhood',
            canActivate: [authGuard],
            loadComponent: () => import('./components/master/neighbourhood/neighbourhood.component').then((c) => c.NeighbourhoodComponent)
          },
          {
            path: 'building',
            canActivate: [authGuard],
            loadComponent: () => import('./components/master/building/building.component').then((c) => c.BuildingComponent)
          },
          {
            path: 'reader-location',
            canActivate: [authGuard],
            loadComponent: () => import('./components/master/reader-location/reader-location.component').then((c) => c.ReaderLocationComponent)
          },
          {
            path: 'service-type',
            canActivate: [authGuard],
            loadComponent: () => import('./components/master/service-type/service-type.component').then((c) => c.ServiceTypeComponent)
          },
          {
            path: 'amenities',
            canActivate: [authGuard],
            loadComponent: () => import('./components/master/amenities/amenities.component').then((c) => c.AmenitiesComponent)
          },
          {
            path: 'reader-relay',
            canActivate: [authGuard],
            loadComponent: () => import('./components/master/reader-relay/reader-relay.component').then((c) => c.ReaderRelayComponent)
          },
        ]
      },
// master report routes
{
  path: 'master-report',
  loadComponent: () =>
    import('./components/master-report/master-report.component')
      .then(c => c.MasterReportComponent),
  children: [
    {
      path: 'company',
      loadComponent: () =>
        import('./components/master-report/company/company.component')
          .then(c => c.CompanyComponent)
    },
    {
      path: 'profile',
      loadComponent: () =>
        import('./components/master-report/profile/profile.component')
          .then(c => c.ProfileComponent)
    },
    {
      path: 'project',
      loadComponent: () =>
        import('./components/master-report/project/project.component')
          .then(c => c.ProjectComponent)
    },
    {
      path: 'user',
      loadComponent: () =>
        import('./components/master-report/user/user.component')
          .then(c => c.UserComponent)
    },
    
    {
      path: 'neighbourhood',
      loadComponent: () =>
        import('./components/master-report/neighbourhood/neighbourhood.component')
          .then(c => c.NeighbourhoodComponent)
    },
    {
      path: 'building',
      loadComponent: () =>
        import('./components/master-report/building/building.component')
          .then(c => c.BuildingComponent)
    },
    {
      path: 'reader-location',
      loadComponent: () =>
        import('./components/master-report/reader-location/reader-location.component')
          .then(c => c.ReaderLocationComponent)
    },
    {
      path: 'service-type',
      loadComponent: () =>
        import('./components/master-report/service-type/service-type.component')
          .then(c => c.ServiceTypeComponent)
    },
    {
      path: 'amenities',
      loadComponent: () =>
        import('./components/master-report/amenities/amenities.component')
          .then(c => c.AmenitiesComponent)
    },
    {
      path: 'reader-relay',
      loadComponent: () =>
        import('./components/master-report/reader-relay/reader-relay.component')
          .then(c => c.ReaderRelayComponent)
    },
    {
      path: '',
      redirectTo: 'company',
      pathMatch: 'full'
    }
  ]
}
,
      {
        path: 'land-owner',
        canActivate: [authGuard],
        loadComponent: () => import('./components/land-owner/land-owner.component').then((c) => c.LandOwnerComponent)
      },
      {
        path: 'resident',
        canActivate: [authGuard],
        loadComponent: () => import('./components/resident/resident.component').then((c) => c.ResidentComponent)
      },
      {
        path: 'employee',
        canActivate: [authGuard],
        loadComponent: () => import('./components/employee/employee.component').then((c) => c.EmployeeComponent)
      },
      {
        path: 'card-lost-damage',
        loadComponent: () => import('./components/card-lost-damage/card-lost-damage.component').then((c) => c.CardLostDamageComponent)
      },
      {
        path: 'tag-block-revoke',
        loadComponent: () => import('./components/tag-block-revoke/tag-block-revoke.component').then((c) => c.TagBlockRevokeComponent)
      },
      {
        path: 'guest',
        canActivate: [authGuard],
        loadComponent: () => import('./components/guest/guest.component').then((c) => c.GuestComponent)
      },
      {
        path: 'visitor',
        canActivate: [authGuard],
        loadComponent: () => import('./components/visitor/visitor.component').then((c) => c.VisitorComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./components/reports/reports.component').then((c) => c.ReportsComponent),
        children: [
          {
            path: 'inOutLog',
            loadComponent: () => import('./components/reports/in-out-log/in-out-log.component').then((c) => c.InOutLogComponent)
          },
          {
            path: 'vechileInOutLog',
            loadComponent: () => import('./components/reports/vechile-in-out-log/vechile-in-out-log.component').then((c) => c.VehicleInOutLogComponent)
          },
           {
            path: 'vechileInOutRegister',
            loadComponent: () => import('./components/reports/vehicle-register-in-out/vehicle-register-in-out.component').then((c) => c.VehicleRegisterInOutComponent)
          },
          {
            path: 'visitorInOutLog',
            loadComponent: () => import('./components/reports/visitor-in-out-log/visitor-in-out-log.component').then((c) => c.VisitorInOutLogComponent)
          },
          {
            path: 'cardEncodingLog',
            loadComponent: () => import('./components/reports/card-encoding-log/card-encoding-log.component').then((c) => c.CardEncodingLogComponent)
          },
          {
            path: 'cardPrintingLog',
            loadComponent: () => import('./components/reports/card-printing-log/card-printing-log.component').then((c) => c.CardPrintingLogComponent)
          },
          {
            path: 'cardLostDamaged',
            loadComponent: () => import('./components/reports/card-lost-damaged/card-lost-damaged.component').then((c) => c.CardLostDamagedComponent)
          },
          {
            path: 'vechileList',
            loadComponent: () => import('./components/reports/vechile-list/vechile-list.component').then((c) => c.VechileListComponent)
          },
          {
            path: 'vechileEncodingLog',
            loadComponent: () => import('./components/reports/vechile-encoding-log/vechile-encoding-log.component').then((c) => c.VechileEncodingLogComponent)
          },
          {
            path: 'tagLostDamage',
            loadComponent: () => import('./components/reports/tag-lost-damage/tag-lost-damage.component').then((c) => c.TagLostDamageComponent)
          },
          {
            path: 'tagBlockRemove',
            loadComponent: () => import('./components/reports/tag-block-remove/tag-block-remove.component').then((c) => c.TagBlockRemoveComponent)
          },
          {
            path: 'resident',
            loadComponent: () => import('./components/reports/resident/resident.component').then((c) => c.ResidentComponent)
          },
          {
            path: 'tenant',
            loadComponent: () => import('./components/reports/tenant/tenant.component').then((c) => c.TenantComponent)
          },
          {
            path: 'serviceProvider',
            loadComponent: () => import('./components/reports/service-provider/service-provider.component').then((c) => c.ServiceProviderComponent)
          },
          {
            path: 'riverViewCityEmployee',
            loadComponent: () => import('./components/reports/river-view-city-employee/river-view-city-employee.component').then((c) => c.RiverViewCityEmployeeComponent)
          },
          {
            path: 'contractorEmployee',
            loadComponent: () => import('./components/reports/contractor-employee/contractor-employee.component').then((c) => c.ContractorEmployeeComponent)
          },
          {
            path: 'employee',
            loadComponent: () => import('./components/reports/employee/employee.component').then((c) => c.EmployeeComponent)
          },
          {
            path: 'landOwner',
            loadComponent: () => import('./components/reports/land-owner/land-owner.component').then((c) => c.LandOwnerComponent)
          },
          {
            path: 'tenantHistory',
            loadComponent: () => import('./components/reports/tenant-history/tenant-history.component').then((c) => c.TenantHistoryComponent)
          },
          {
            path: 'datewiseSearchReport',
            loadComponent: () => import('./components/reports/datewise-search-report/datewise-search-report.component').then((c) => c.DatewiseSearchReportComponent)
          },
          {
            path: 'agreementEndReport',
            loadComponent: () => import('./components/reports/agreement-end-report/agreement-end-report.component').then((c) => c.AgreementEndReportComponent)
          },
          {
            path: 'guestInOutLog',
            loadComponent: () => import('./components/reports/guest-in-out-log/guest-in-out-log.component').then((c) => c.GuestInOutLogComponent)
          },
        ]
      },
      {
        path: 'tenant',
        canActivate: [authGuard],
        loadComponent: () => import('./components/tenant/tenant.component').then((c) => c.TenantComponent)
      },
      {
        path: "contractor",
        canActivate: [authGuard],
        loadComponent: () => import('./components/contractor/contractor.component').then((c) => c.ContractorComponent)
      },
      {
        path: 'service-provider',
        canActivate: [authGuard],
        loadComponent: () => import('./components/service-provider/service-provider.component').then((c) => c.ServiceProviderComponent)
      },
      {
        path: 'search',
        loadComponent: () => import('./components/search/search.component').then((c) => c.SearchComponent)
      }
    ]
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./components/authentication/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./components/authentication/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
