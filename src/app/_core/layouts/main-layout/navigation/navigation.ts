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
        icon: 'dashboard',
        breadcrumbs: true
      },
      {
        
        id: 'master',
        title: 'Master',
        type: 'collapse',
        icon: 'dashboard',
        children: [
          {
            id: 'company',
            title: 'Company',
            type: 'item',
            classes: 'nav-item',
            url: '/master/company',
            icon: 'ant-design'
          },
          
          {
            id: 'profile',
            title: 'Profile',
            type: 'item',
            classes: 'nav-item',
            url: '/master/profile',
            icon: 'ant-design'
          },
          // {
          //   id: 'project',
          //   title: 'Project',
          //   type: 'item',
          //   classes: 'nav-item',
          //   url: '/master/project',
          //   icon: 'ant-design'
          // },
          {
            id: 'user',
            title: 'User',
            type: 'item',
            classes: 'nav-item',
            url: '/master/user',
            icon: 'ant-design'
          },
          {
            id: 'riverViewCity',
            title: 'RiverView City',
            type: 'item',
            hidden: true,
            classes: 'nav-item',
            url: '/master/river-view-city',
            icon: 'ant-design'
          },
          {
            id: 'neighbourhood',
            title: 'Neighbourhood',
            type: 'item',
            classes: 'nav-item',
            url: '/master/neighbourhood',
            icon: 'ant-design'
          },
          {
            id: 'building',
            title: 'Building',
            type: 'item',
            classes: 'nav-item',
            url: '/master/building',
            icon: 'ant-design'
          },
          {
            id: 'readerLocation',
            title: 'Reader Location',
            type: 'item',
            classes: 'nav-item',
            url: '/master/reader-location',
            icon: 'ant-design'
          },
          {
            id: 'serviceType',
            title: 'Service Type',
            type: 'item',
            classes: 'nav-item',
            url: '/master/service-type',
            icon: 'ant-design'
          },
          //  {
          //   id: 'contractorType',
          //   title: 'Contractor Type',
          //   type: 'item',
          //   classes: 'nav-item',
          //   url: '/master/contrator-type',
          //   icon: 'ant-design'
          // },
          {
            id: 'amenities',
            title: 'Amenities',
            type: 'item',
            classes: 'nav-item',
            url: '/master/amenities',
            icon: 'ant-design'
          },
          {
            id: 'Reader',
            title: 'Reader Relay',
            type: 'item',
            classes: 'nav-item',
            url: '/master/reader-relay',
            icon: 'ant-design'
          }
          
        ]
      },
      
{
        
        id: 'cardholder',
        title: 'Card Holder',
        type: 'collapse',
        icon: 'dashboard',
        children: [
           {
        id: 'land-owner',
        title: 'Land Owner',
        type: 'item',
        classes: 'nav-item',
        url: '/land-owner',
        icon: 'dashboard',
        breadcrumbs: true
      },
      {
        id: 'resident',
        title: 'Resident',
        type: 'item',
        classes: 'nav-item',
        url: '/resident',
        icon: 'dashboard',
        breadcrumbs: true
      },
      {
        id: 'tenant',
        title: 'Tenant',
        type: 'item',
        classes: 'nav-item',
        url: '/tenant',
        icon: 'dashboard',
        breadcrumbs: true
      },
      {
        id: 'contractor',
        title: 'Contractor',
        type: 'item',
        classes: 'nav-item',
        url: '/contractor',
        icon: 'dashboard',
        breadcrumbs: true
      },
      {
        id: 'service-provider',
        title: 'Service Provider',
        type: 'item',
        classes: 'nav-item',
        url: '/service-provider',
        icon: 'dashboard',
        breadcrumbs: true
      },
      {
        id: 'employee',
        title: 'Employee',
        type: 'item',
        classes: 'nav-item',
        url: '/employee',
        icon: 'dashboard',
        breadcrumbs: true
      },
      {
        id: 'card-lost-damage',
        title: 'Card Lost Damage',
        type: 'item',
        classes: 'nav-item',
        url: '/card-lost-damage',
        icon: 'dashboard',
        breadcrumbs: true
      },
      {
        id: 'tag-block-revoke',
        title: 'Card Block Revoke',
        type: 'item',
        classes: 'nav-item',
        url: '/tag-block-remove',
        icon: 'dashboard',
        breadcrumbs: true
      },
      {
        id: 'guest',
        title: 'Guest',
        type: 'item',
        classes: 'nav-item',
        url: '/guest',
        icon: 'dashboard',
        breadcrumbs: true
      },
      {
        id: 'visitor',
        title: 'Visitor',
        type: 'item',
        classes: 'nav-item',
        url: '/visitor',
        icon: 'dashboard',
        breadcrumbs: true
      },
        ]
},
      // {
      //   id: 'master',
      //   title: 'Master',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: 'master',
      //   icon: 'dashboard',
      //   breadcrumbs: true
      // },
      // {
      //   id: 'land-owner',
      //   title: 'Land Owner',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/land-owner',
      //   icon: 'dashboard',
      //   breadcrumbs: true
      // },
      // {
      //   id: 'resident',
      //   title: 'Resident',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/resident',
      //   icon: 'dashboard',
      //   breadcrumbs: true
      // },
      // {
      //   id: 'tenant',
      //   title: 'Tenant',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/tenant',
      //   icon: 'dashboard',
      //   breadcrumbs: true
      // },
      // {
      //   id: 'contractor',
      //   title: 'Contractor',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/contractor',
      //   icon: 'dashboard',
      //   breadcrumbs: true
      // },
      // {
      //   id: 'service-provider',
      //   title: 'Service Provider',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/service-provider',
      //   icon: 'dashboard',
      //   breadcrumbs: true
      // },
      // {
      //   id: 'employee',
      //   title: 'Employee',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/employee',
      //   icon: 'dashboard',
      //   breadcrumbs: true
      // },
      // {
      //   id: 'card-lost-damage',
      //   title: 'Card Lost Damage',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/card-lost-damage',
      //   icon: 'dashboard',
      //   breadcrumbs: true
      // },
      // {
      //   id: 'tag-block-revoke',
      //   title: 'Tag Block Revoke',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/tag-block-revoke',
      //   icon: 'dashboard',
      //   breadcrumbs: true
      // },
      // {
      //   id: 'guest',
      //   title: 'Guest',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/guest',
      //   icon: 'dashboard',
      //   breadcrumbs: true
      // },
      // {
      //   id: 'visitor',
      //   title: 'Visitor',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/visitor',
      //   icon: 'dashboard',
      //   breadcrumbs: true
      // },
      
      {
    id: 'reports',
    title: 'Reports',
    type: 'collapse',
    icon: 'dashboard',
    children: [
      // 1️⃣ Master Report inside Reports
      {
        id: 'master-report',
        title: 'Master Report',
        type: 'collapse',
        icon: 'ant-design',
        children: [
          { id: 'company', title: 'Company-Report', type: 'item', url: '/master-report/company', icon: 'ant-design' },
          { id: 'profile', title: 'Profile', type: 'item', url: '/master-report/profile', icon: 'ant-design' },
          // { id: 'project', title: 'Project', type: 'item', url: '/master-report/project', icon: 'ant-design' },
          { id: 'user', title: 'User', type: 'item', url: '/master-report/user', icon: 'ant-design' },
          { id: 'neighbourhood', title: 'Neighbourhood', type: 'item', url: '/master-report/neighbourhood', icon: 'ant-design' },
          { id: 'building', title: 'Building', type: 'item', url: '/master-report/building', icon: 'ant-design' },
          { id: 'readerLocation', title: 'Reader Location', type: 'item', url: '/master-report/reader-location', icon: 'ant-design' },
          { id: 'serviceType', title: 'Service Type', type: 'item', url: '/master-report/service-type', icon: 'ant-design' },
          { id: 'amenities', title: 'Amenities', type: 'item', url: '/master-report/amenities', icon: 'ant-design' },
          { id: 'reader', title: 'Reader Relay', type: 'item', url: '/master-report/reader-relay', icon: 'ant-design' }
        ]
      },

      // 2️⃣ Transaction / In-Out Reports
      {
        id: 'transaction-report',
        title: 'Transaction Report',
        type: 'collapse',
        icon: 'ant-design',
        children: [
          { id: 'inOutLog', title: 'In/Out Log', type: 'item', url: '/reports/inOutLog', icon: 'ant-design' },
          { id: 'vechileInOutLog', title: 'Vehicle In Out Log', type: 'item', url: '/reports/vechileInOutLog', icon: 'ant-design' },
          { id: 'vechileInOutRegister', title: 'Vehicle In-Out Register', type: 'item', url: '/reports/vechileInOutRegister', icon: 'ant-design' },
          { id: 'visitorInOutLog', title: 'Visitor In Out Log', type: 'item', url: '/reports/visitorInOutLog', icon: 'ant-design' },
          { id: 'cardEncodingLog', title: 'Card Encoding Log', type: 'item', url: '/reports/cardEncodingLog', icon: 'ant-design' },
          { id: 'cardPrintingLog', title: 'Card Printing Log', type: 'item', url: '/reports/cardPrintingLog', icon: 'ant-design' },
          { id: 'cardLostDamaged', title: 'Card LostDamage', type: 'item', url: '/reports/cardLostDamaged', icon: 'ant-design' },
          { id: 'cardBlockRevoke', title: 'Card Blockrevoke', type: 'item', url: '/reports/card-block-revoke', icon: 'ant-design' },
          { id: 'vechileList', title: 'Vehicle List', type: 'item', url: '/reports/vechileList', icon: 'ant-design' },
          // { id: 'vechileEncodingLog', title: 'Vehicle Encoding Log', type: 'item', url: '/reports/vechileEncodingLog', icon: 'ant-design' },
          // { id: 'tagLostDamage', title: 'Tag Lost Damage', type: 'item', url: '/reports/tagLostDamage', icon: 'ant-design' },
          { id: 'tagBlockRemove', title: 'Card Revoke/Block', type: 'item', url: '/reports/tagBlockRemove', icon: 'ant-design' },
          { id: 'resident', title: 'Resident', type: 'item', url: '/reports/resident', icon: 'ant-design' },
          { id: 'tenant', title: 'Tenant', type: 'item', url: '/reports/tenant', icon: 'ant-design' },
          { id: 'serviceProvider', title: 'Service Provider', type: 'item', url: '/reports/serviceProvider', icon: 'ant-design' },
          // { id: 'riverViewCityEmployee', title: 'RiverView City Employee', type: 'item', url: '/reports/riverViewCityEmployee', icon: 'ant-design' },
          { id: 'contractorEmployee', title: 'Contractor', type: 'item', url: '/reports/contractorEmployee', icon: 'ant-design' },
          { id: 'employee', title: 'Employee', type: 'item', url: '/reports/employee', icon: 'ant-design' },
          { id: 'landOwner', title: 'Land Owner', type: 'item', url: '/reports/landOwner', icon: 'ant-design' },
          // { id: 'tenantHistory', title: 'Tenant History', type: 'item', url: '/reports/tenantHistory', icon: 'ant-design' },
          // { id: 'datewiseSearchReport', title: 'Datewise Report', type: 'item', url: '/reports/datewiseSearchReport', icon: 'ant-design' },
          // { id: 'agreementEndReport', title: 'Agreement End Report', type: 'item', url: '/reports/agreementEndReport', icon: 'ant-design' },
          { id: 'guestInOutLog', title: 'Guest In Out Log', type: 'item', url: '/reports/guestInOutLog', icon: 'ant-design' }
        ]
      }
    ]
  },
    ]
  },
  // {
  //   id: 'authentication',
  //   title: 'Authentication',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   children: [
  //     {
  //       id: 'login',
  //       title: 'Login',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/login',
  //       icon: 'login',
  //       target: true,
  //       breadcrumbs: false
  //     },
  //     {
  //       id: 'register',
  //       title: 'Register',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/register',
  //       icon: 'profile',
  //       target: true,
  //       breadcrumbs: false
  //     }
  //   ]
  // },
];
