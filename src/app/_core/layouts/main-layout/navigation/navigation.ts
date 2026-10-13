// import { ModuleKeys } from 'src/app/_core/enums/module-keys.enum';

// export interface NavigationItem {
//   id: string;
//   title: string;
//   type: 'item' | 'collapse' | 'group';
//   translate?: string;
//   icon?: string;
//   hidden?: boolean;
//   url?: string;
//   classes?: string;
//   groupClasses?: string;
//   exactMatch?: boolean;
//   external?: boolean;
//   target?: boolean;
//   breadcrumbs?: boolean;
//   children?: NavigationItem[];
//   link?: string;
//   description?: string;
//   path?: string;
//   moduleKey?: number;
// }

// export const NavigationItems: NavigationItem[] = [
//   {
//     id: '',
//     title: '',
//     type: 'group',
//     icon: '',
//     children: [
//       {
//         id: 'dashboard',
//         title: 'Dashboard',
//         type: 'item',
//         classes: 'nav-item',
//         url: '/dashboard',
//         icon: 'dashboard',
//         breadcrumbs: true,
//         moduleKey: ModuleKeys.Dashboard
//       },
//       {
//         id: 'master',
//         title: 'Master',
//         type: 'collapse',
//         icon: 'dashboard',
//         children: [
//           { id: 'company',       title: 'Company',        type: 'item', classes: 'nav-item', url: '/master/company',        icon: 'ant-design', moduleKey: ModuleKeys.Company },
//           { id: 'cardDesign',    title: 'Card Design',    type: 'item', classes: 'nav-item', url: '/master/card-design',    icon: 'ant-design', moduleKey: ModuleKeys.CardDesign },
//           { id: 'profile',       title: 'Profile',        type: 'item', classes: 'nav-item', url: '/master/profile',        icon: 'ant-design', moduleKey: ModuleKeys.Profile },
//           { id: 'user',          title: 'User',           type: 'item', classes: 'nav-item', url: '/master/user',           icon: 'ant-design', moduleKey: ModuleKeys.User },
//           { id: 'riverViewCity', title: 'RiverView City', type: 'item', classes: 'nav-item', url: '/master/river-view-city',icon: 'ant-design', hidden: true },
//           { id: 'neighbourhood', title: 'Neighbourhood',  type: 'item', classes: 'nav-item', url: '/master/neighbourhood',  icon: 'ant-design', moduleKey: ModuleKeys.Neighbourhood },
//           { id: 'nrdcardtemplate', title: 'NRD Card Template', type: 'item', classes: 'nav-item', url: '/master/nrdcardtemplate', icon: 'ant-design', moduleKey: ModuleKeys.Nrdcardtemplate },
//           { id: 'building',      title: 'Building',       type: 'item', classes: 'nav-item', url: '/master/building',       icon: 'ant-design', moduleKey: ModuleKeys.Building },
        
//           { id: 'serviceType',   title: 'Service Type',   type: 'item', classes: 'nav-item', url: '/master/service-type',   icon: 'ant-design', moduleKey: ModuleKeys.ServiceType },
//         { id: 'contractorType', title: 'Contractor Type', type: 'item', classes: 'nav-item', url: '/master/contrator-type', icon: 'ant-design', moduleKey: ModuleKeys.ContractorType },
//           { id: 'amenities',     title: 'Amenities',      type: 'item', classes: 'nav-item', url: '/master/amenities',      icon: 'ant-design', moduleKey: ModuleKeys.Amenities },
//           { id: 'Reader',        title: 'Reader Relay',   type: 'item', classes: 'nav-item', url: '/master/reader-relay',   icon: 'ant-design', moduleKey: ModuleKeys.ReaderRelay },
//   { id: 'readerLocation',title: 'Reader Location',type: 'item', classes: 'nav-item', url: '/master/reader-location',icon: 'ant-design', moduleKey: ModuleKeys.ReaderLocation },
//             { id: 'Camera',        title: 'ANPR Camera',         type: 'item', classes: 'nav-item', url: '/master/camera',         icon: 'ant-design', moduleKey: ModuleKeys.Camera },

//              { id: 'Turnstile Live Transactions',        title: 'Turnstile Live Transactions',         type: 'item', classes: 'nav-item', url: '/master/turnstile-live-transactions',         icon: 'ant-design', moduleKey: ModuleKeys.TurnstileLiveTransactions }
//         ]
//       },
//       {
//         id: 'cardholder',
//         title: 'Card Holder',
//         type: 'collapse',
//         icon: 'dashboard',
//         children: [
//           { id: 'land-owner',      title: 'Land Owner',      type: 'item', classes: 'nav-item', url: '/land-owner',      icon: 'dashboard', breadcrumbs: true, moduleKey: ModuleKeys.LandOwner },
//           { id: 'resident',        title: 'Resident',        type: 'item', classes: 'nav-item', url: '/resident',        icon: 'dashboard', breadcrumbs: true, moduleKey: ModuleKeys.Resident },
//           { id: 'tenant',          title: 'Tenant',          type: 'item', classes: 'nav-item', url: '/tenant',          icon: 'dashboard', breadcrumbs: true, moduleKey: ModuleKeys.Tenant },
//           { id: 'contractor',      title: 'Contractor',      type: 'item', classes: 'nav-item', url: '/contractor',      icon: 'dashboard', breadcrumbs: true, moduleKey: ModuleKeys.Contractor },
//           { id: 'service-provider',title: 'Service Provider',type: 'item', classes: 'nav-item', url: '/service-provider',icon: 'dashboard', breadcrumbs: true, moduleKey: ModuleKeys.ServiceProvider },
//           { id: 'employee',        title: 'Employee',        type: 'item', classes: 'nav-item', url: '/employee',        icon: 'dashboard', breadcrumbs: true, moduleKey: ModuleKeys.Employee },
//           { id: 'card-lost-damage',title: 'Card Lost Damage',type: 'item', classes: 'nav-item', url: '/card-lost-damage',icon: 'dashboard', breadcrumbs: true, moduleKey: ModuleKeys.CardLostDamage },
//           { id: 'tag-block-revoke',title: 'Card Block Revoke',type: 'item',classes: 'nav-item', url: '/tag-block-remove',icon: 'dashboard', breadcrumbs: true, moduleKey: ModuleKeys.TagBlockRevoke },
//           { id: 'guest',           title: 'Guest',           type: 'item', classes: 'nav-item', url: '/guest',           icon: 'dashboard', breadcrumbs: true, moduleKey: ModuleKeys.Guest },
//           { id: 'visitor',         title: 'Visitor',         type: 'item', classes: 'nav-item', url: '/visitor',         icon: 'dashboard', breadcrumbs: true, moduleKey: ModuleKeys.Visitor }
//         ]
//       },
//       {
//         id: 'reports',
//         title: 'Reports',
//         type: 'collapse',
//         icon: 'dashboard',
//         children: [
//           {
//             id: 'master-report',
//             title: 'Master Report',
//             type: 'collapse',
//             icon: 'ant-design',
//             children: [
             

//               { id: 'company',        title: 'Company-Report',  type: 'item', url: '/master-report/company',         icon: 'ant-design', moduleKey: ModuleKeys.MasterReportCompany },
// { id: 'profile',        title: 'Profile',         type: 'item', url: '/master-report/profile',         icon: 'ant-design', moduleKey: ModuleKeys.MasterReportProfile },
// { id: 'user',           title: 'User',            type: 'item', url: '/master-report/user',            icon: 'ant-design', moduleKey: ModuleKeys.MasterReportUser },
// { id: 'neighbourhood',  title: 'Neighbourhood',   type: 'item', url: '/master-report/neighbourhood',   icon: 'ant-design', moduleKey: ModuleKeys.MasterReportNeighbourhood },
// { id: 'building',       title: 'Building',        type: 'item', url: '/master-report/building',        icon: 'ant-design', moduleKey: ModuleKeys.MasterReportBuilding },
// { id: 'readerLocation', title: 'Reader Location', type: 'item', url: '/master-report/reader-location', icon: 'ant-design', moduleKey: ModuleKeys.MasterReportReaderLocation },
// { id: 'serviceType',    title: 'Service Type',    type: 'item', url: '/master-report/service-type',    icon: 'ant-design', moduleKey: ModuleKeys.MasterReportServiceType },
// { id: 'amenities',      title: 'Amenities',       type: 'item', url: '/master-report/amenities',       icon: 'ant-design', moduleKey: ModuleKeys.MasterReportAmenities },
// { id: 'reader',         title: 'Reader Relay',    type: 'item', url: '/master-report/reader-relay',    icon: 'ant-design', moduleKey: ModuleKeys.MasterReportReaderRelay }
//             ]
//           },
//           {
//             id: 'transaction-report',
//             title: 'Transaction Report',
//             type: 'collapse',
//             icon: 'ant-design',
//             children: [
//               { id: 'inOutLog',             title: 'TurnStile(In/Out) Log',                   type: 'item', url: '/reports/inOutLog',             icon: 'ant-design', moduleKey: ModuleKeys.InOutLog },
//               { id: 'vechileInOutLog',      title: 'Vehicle In Out Log',           type: 'item', url: '/reports/vechileInOutLog',      icon: 'ant-design', moduleKey: ModuleKeys.VehicleInOutLog },
//               { id: 'vechileInOutRegister', title: 'Vehicle In-Out Reg.',      type: 'item', url: '/reports/vechileInOutRegister', icon: 'ant-design', moduleKey: ModuleKeys.VehicleInOutLog },
//               { id: 'visitorInOutLog',      title: 'Visitor In Out Log',           type: 'item', url: '/reports/visitorInOutLog',      icon: 'ant-design', moduleKey: ModuleKeys.VisitorInOutLog },
//               { id: 'unauthorized',         title: 'Unauthorized Vehicle Reg.',type: 'item', url: '/reports/unauthorized',         icon: 'ant-design', moduleKey: ModuleKeys.UnauthorisedVehicles },
//               { id: 'cardEncodingLog',      title: 'Card Encoding Log',            type: 'item', url: '/reports/cardEncodingLog',      icon: 'ant-design', moduleKey: ModuleKeys.CardEncodingLog },
//               { id: 'cardPrintingLog',      title: 'Card Printing Log',            type: 'item', url: '/reports/cardPrintingLog',      icon: 'ant-design', moduleKey: ModuleKeys.CardPrintingLog },
//               { id: 'cardLostDamaged',      title: 'Card LostDamage',              type: 'item', url: '/reports/cardLostDamaged',      icon: 'ant-design', moduleKey: ModuleKeys.CardLostDamaged },
//               { id: 'cardBlockRevoke',      title: 'Card BlockRevoke',             type: 'item', url: '/reports/card-block-revoke',    icon: 'ant-design', moduleKey: ModuleKeys.TagBlockRemove },
//               { id: 'vechileList',          title: 'Vehicle List',                 type: 'item', url: '/reports/vechileList',          icon: 'ant-design', moduleKey: ModuleKeys.VehicleList },
//               { id: 'resident',             title: 'Resident',                     type: 'item', url: '/reports/resident',             icon: 'ant-design', moduleKey: ModuleKeys.ResidentReport },
//               { id: 'tenant',               title: 'Tenant',                       type: 'item', url: '/reports/tenant',               icon: 'ant-design', moduleKey: ModuleKeys.TenantReport },
//               { id: 'serviceProvider',      title: 'Service Provider',             type: 'item', url: '/reports/serviceProvider',      icon: 'ant-design', moduleKey: ModuleKeys.ServiceProviderReport },
//               { id: 'contractorEmployee',   title: 'Contractor',                   type: 'item', url: '/reports/contractorEmployee',   icon: 'ant-design', moduleKey: ModuleKeys.ContractorEmployee },
//               { id: 'employee',             title: 'Employee',                     type: 'item', url: '/reports/employee',             icon: 'ant-design', moduleKey: ModuleKeys.Employee },
//               { id: 'landOwner',            title: 'Land Owner',                   type: 'item', url: '/reports/landOwner',            icon: 'ant-design', moduleKey: ModuleKeys.LandOwnerReport },
//               { id: 'guestInOutLog',        title: 'Guest In Out Log',             type: 'item', url: '/reports/guestInOutLog',        icon: 'ant-design', moduleKey: ModuleKeys.GuestInOutLog }
//             ]
//           }
//         ]
//       },
//       {
//         id: 'card-print-enroll',
//         title: 'Card Print Enroll',
//         type: 'item',
//         classes: 'nav-item',
//         url: '/card-print-enroll',
//         icon: 'dashboard',
//         breadcrumbs: true,
//         moduleKey: ModuleKeys.CardPrintEnroll
//       }
//     ]
//   }
// ];



import { ModuleKeys } from 'src/app/_core/enums/module-keys.enum';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
  moduleKey?: number;
}

export const NavigationItems: NavigationItem[] = [
  {
    id: '',
    title: '',
    type: 'group',
    icon: '',
    children: [
      {
               id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard',
        icon: 'appstore',
        breadcrumbs: true,
        moduleKey: ModuleKeys.Dashboard
      },
      {
        id: 'master',
        title: 'Master',
        type: 'collapse',
        icon: 'setting',
        children: [
          { id: 'company',       title: 'Company',        type: 'item', classes: 'nav-item', url: '/master/company',        icon: 'bank', moduleKey: ModuleKeys.Company },
          { id: 'cardDesign',    title: 'Card Design',    type: 'item', classes: 'nav-item', url: '/master/card-design',    icon: 'idcard', moduleKey: ModuleKeys.CardDesign },
          { id: 'profile',       title: 'Profile',        type: 'item', classes: 'nav-item', url: '/master/profile',        icon: 'user', moduleKey: ModuleKeys.Profile },
          { id: 'user',          title: 'User',           type: 'item', classes: 'nav-item', url: '/master/user',           icon: 'team', moduleKey: ModuleKeys.User },
          { id: 'riverViewCity', title: 'RiverView City', type: 'item', classes: 'nav-item', url: '/master/river-view-city',icon: 'environment', hidden: true },
          { id: 'neighbourhood', title: 'Neighbourhood',  type: 'item', classes: 'nav-item', url: '/master/neighbourhood',  icon: 'environment', moduleKey: ModuleKeys.Neighbourhood },
          { id: 'nrdcardtemplate', title: 'NRD Card Template', type: 'item', classes: 'nav-item', url: '/master/nrdcardtemplate', icon: 'file-text', moduleKey: ModuleKeys.Nrdcardtemplate },
          { id: 'building',      title: 'Building',       type: 'item', classes: 'nav-item', url: '/master/building',       icon: 'bank', moduleKey: ModuleKeys.Building },
          { id: 'serviceType',   title: 'Service Type',   type: 'item', classes: 'nav-item', url: '/master/service-type',   icon: 'tool', moduleKey: ModuleKeys.ServiceType },
          { id: 'contractorType', title: 'Contractor Type', type: 'item', classes: 'nav-item', url: '/master/contrator-type', icon: 'solution', moduleKey: ModuleKeys.ContractorType },
          { id: 'amenities',     title: 'Amenities',      type: 'item', classes: 'nav-item', url: '/master/amenities',      icon: 'gift', moduleKey: ModuleKeys.Amenities },
            { id: 'readerLocation',title: 'Reader Location',type: 'item', classes: 'nav-item', url: '/master/reader-location',icon: 'environment', moduleKey: ModuleKeys.ReaderLocation },
          { id: 'Reader',        title: 'Reader Relay',   type: 'item', classes: 'nav-item', url: '/master/reader-relay',   icon: 'wifi', moduleKey: ModuleKeys.ReaderRelay },
          { id: 'Turnstile Live Transactions',        title: 'Turnstile Live Transactions',         type: 'item', classes: 'nav-item', url: '/master/turnstile-live-transactions',         icon: 'swap', moduleKey: ModuleKeys.TurnstileLiveTransactions },
          { id: 'Camera',        title: 'ANPR Camera',         type: 'item', classes: 'nav-item', url: '/master/camera',         icon: 'video-camera', moduleKey: ModuleKeys.Camera },
           { id: 'Camera Live Transactions',        title: 'Camera Live Transactions',         type: 'item', classes: 'nav-item', url: '/master/camera-live',         icon: 'swap', moduleKey: ModuleKeys.CameraLiveTransactions },
             { id: 'Backup Maintenance',        title: 'Backup Maintenance',         type: 'item', classes: 'nav-item', url: '/master/backup-maintenance',         icon: 'swap', moduleKey: ModuleKeys.BackupMaintenance },
                { id: 'Parking Managament',        title: 'Parking Management',         type: 'item', classes: 'nav-item', url: '/master/parking-managament',         icon: 'swap', moduleKey: ModuleKeys.ParkingManagement },
        
        
        ]
      },
      {
        id: 'cardholder',
        title: 'Card Holder',
        type: 'collapse',
        icon: 'idcard',
        children: [
          { id: 'land-owner',      title: 'Land Owner',      type: 'item', classes: 'nav-item', url: '/land-owner',      icon: 'home', breadcrumbs: true, moduleKey: ModuleKeys.LandOwner },
          { id: 'resident',        title: 'Resident',        type: 'item', classes: 'nav-item', url: '/resident',        icon: 'home', breadcrumbs: true, moduleKey: ModuleKeys.Resident },
          { id: 'tenant',          title: 'Tenant',          type: 'item', classes: 'nav-item', url: '/tenant',          icon: 'user', breadcrumbs: true, moduleKey: ModuleKeys.Tenant },
          { id: 'contractor',      title: 'Contractor',      type: 'item', classes: 'nav-item', url: '/contractor',      icon: 'tool', breadcrumbs: true, moduleKey: ModuleKeys.Contractor },
          { id: 'service-provider',title: 'Service Provider',type: 'item', classes: 'nav-item', url: '/service-provider',icon: 'customer-service', breadcrumbs: true, moduleKey: ModuleKeys.ServiceProvider },
          { id: 'employee',        title: 'Employee',        type: 'item', classes: 'nav-item', url: '/employee',        icon: 'team', breadcrumbs: true, moduleKey: ModuleKeys.Employee },
          { id: 'card-lost-damage',title: 'Card Lost Damage',type: 'item', classes: 'nav-item', url: '/card-lost-damage',icon: 'warning', breadcrumbs: true, moduleKey: ModuleKeys.CardLostDamage },
          { id: 'tag-block-revoke',title: 'Card Block Revoke',type: 'item',classes: 'nav-item', url: '/tag-block-remove',icon: 'stop', breadcrumbs: true, moduleKey: ModuleKeys.TagBlockRevoke },
          { id: 'guest',           title: 'Guest',           type: 'item', classes: 'nav-item', url: '/guest',           icon: 'user-add', breadcrumbs: true, moduleKey: ModuleKeys.Guest },
          { id: 'visitor',         title: 'Visitor',         type: 'item', classes: 'nav-item', url: '/visitor',         icon: 'eye', breadcrumbs: true, moduleKey: ModuleKeys.Visitor }
        ]
      },
      {
        id: 'reports',
        title: 'Reports',
        type: 'collapse',
        icon: 'bar-chart',
        children: [
          {
            id: 'master-report',
            title: 'Master Report',
            type: 'collapse',
            icon: 'file-text',
            children: [
              { id: 'company',        title: 'Company-Report',  type: 'item', url: '/master-report/company',         icon: 'bank', moduleKey: ModuleKeys.MasterReportCompany },
              { id: 'profile',        title: 'Profile',         type: 'item', url: '/master-report/profile',         icon: 'user', moduleKey: ModuleKeys.MasterReportProfile },
              { id: 'user',           title: 'User',            type: 'item', url: '/master-report/user',            icon: 'team', moduleKey: ModuleKeys.MasterReportUser },
              { id: 'neighbourhood',  title: 'Neighbourhood',   type: 'item', url: '/master-report/neighbourhood',   icon: 'environment', moduleKey: ModuleKeys.MasterReportNeighbourhood },
              { id: 'building',       title: 'Building',        type: 'item', url: '/master-report/building',        icon: 'bank', moduleKey: ModuleKeys.MasterReportBuilding },
              { id: 'readerLocation', title: 'Reader Location', type: 'item', url: '/master-report/reader-location', icon: 'environment', moduleKey: ModuleKeys.MasterReportReaderLocation },
              { id: 'serviceType',    title: 'Service Type',    type: 'item', url: '/master-report/service-type',    icon: 'tool', moduleKey: ModuleKeys.MasterReportServiceType },
              { id: 'amenities',      title: 'Amenities',       type: 'item', url: '/master-report/amenities',       icon: 'gift', moduleKey: ModuleKeys.MasterReportAmenities },
              { id: 'reader',         title: 'Reader Relay',    type: 'item', url: '/master-report/reader-relay',    icon: 'wifi', moduleKey: ModuleKeys.MasterReportReaderRelay }
            ]
          },
          {
            id: 'transaction-report',
            title: 'Transaction Report',
            type: 'collapse',
            icon: 'swap',
            children: [
              { id: 'inOutLog',             title: 'TurnStile(In/Out) Log',                   type: 'item', url: '/reports/inOutLog',             icon: 'swap', moduleKey: ModuleKeys.InOutLog },
              { id: 'vechileInOutLog',      title: 'Vehicle In Out Log',           type: 'item', url: '/reports/vechileInOutLog',      icon: 'car', moduleKey: ModuleKeys.VehicleInOutLog },
              { id: 'vechileInOutRegister', title: 'Vehicle In-Out Reg.',      type: 'item', url: '/reports/vechileInOutRegister', icon: 'car', moduleKey: ModuleKeys.VehicleInOutLog },
              { id: 'visitorInOutLog',      title: 'Visitor In Out Log',           type: 'item', url: '/reports/visitorInOutLog',      icon: 'eye', moduleKey: ModuleKeys.VisitorInOutLog },
              { id: 'unauthorized',         title: 'Unauthorized Vehicle Reg.',type: 'item', url: '/reports/unauthorized',         icon: 'warning', moduleKey: ModuleKeys.UnauthorisedVehicles },
               { id: 'cardsummary',      title: 'Card Summary',            type: 'item', url: '/reports/card-summary',      icon: 'credit-card', moduleKey: ModuleKeys.CardSummary },
              { id: 'cardEncodingLog',      title: 'Card Encoding Log',            type: 'item', url: '/reports/cardEncodingLog',      icon: 'credit-card', moduleKey: ModuleKeys.CardEncodingLog },
              { id: 'cardPrintingLog',      title: 'Card Printing Log',            type: 'item', url: '/reports/cardPrintingLog',      icon: 'printer', moduleKey: ModuleKeys.CardPrintingLog },
              { id: 'cardLostDamaged',      title: 'Card LostDamage',              type: 'item', url: '/reports/cardLostDamaged',      icon: 'warning', moduleKey: ModuleKeys.CardLostDamaged },
              { id: 'cardBlockRevoke',      title: 'Card BlockRevoke',             type: 'item', url: '/reports/card-block-revoke',    icon: 'stop', moduleKey: ModuleKeys.TagBlockRemove },
              { id: 'vechileList',          title: 'Vehicle List',                 type: 'item', url: '/reports/vechileList',          icon: 'car', moduleKey: ModuleKeys.VehicleList },
              { id: 'resident',             title: 'Resident',                     type: 'item', url: '/reports/resident',             icon: 'home', moduleKey: ModuleKeys.ResidentReport },
              { id: 'tenant',               title: 'Tenant',                       type: 'item', url: '/reports/tenant',               icon: 'user', moduleKey: ModuleKeys.TenantReport },
              { id: 'serviceProvider',      title: 'Service Provider',             type: 'item', url: '/reports/serviceProvider',      icon: 'customer-service', moduleKey: ModuleKeys.ServiceProviderReport },
              { id: 'contractorEmployee',   title: 'Contractor',                   type: 'item', url: '/reports/contractorEmployee',   icon: 'tool', moduleKey: ModuleKeys.ContractorEmployee },
              { id: 'employee',             title: 'Employee',                     type: 'item', url: '/reports/employee',             icon: 'team', moduleKey: ModuleKeys.Employee },
              { id: 'landOwner',            title: 'Land Owner',                   type: 'item', url: '/reports/landOwner',            icon: 'home', moduleKey: ModuleKeys.LandOwnerReport },
              { id: 'guestInOutLog',        title: 'Guest In Out Log',             type: 'item', url: '/reports/guestInOutLog',        icon: 'user-add', moduleKey: ModuleKeys.GuestInOutLog },
               { id: 'guestList',            title: 'Guest List',                   type: 'item', url: '/reports/guestList',            icon: 'user-add', moduleKey: ModuleKeys.GuestList }
            ]
          }
        ]
      },
      {
        id: 'card-print-enroll',
        title: 'Card Print Enroll',
        type: 'item',
        classes: 'nav-item',
        url: '/card-print-enroll',
        icon: 'printer',
        breadcrumbs: true,
        moduleKey: ModuleKeys.CardPrintEnroll
      }
    ]
  }
];
