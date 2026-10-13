// import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { MaterialModule } from 'src/app/_core/shared/material/material.module';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatCardModule } from '@angular/material/card';
// import { AuthService } from 'src/app/services/auth.service';
// import { ErrorHandlerService } from 'src/app/services/error-handler.service';
// import { AlertService } from 'src/app/services/alert.service';


// @Component({
//   selector: 'app-profile',
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MaterialModule,
//     FormsModule,
//     RouterModule,
//     MatToolbarModule,
//     MatMenuModule,
//     MatDialogModule,
//     MatCardModule,
//   ],
//   templateUrl: './profile.component.html',
//   styleUrl: './profile.component.scss'
// })
// export class ProfileComponent implements OnInit {

//   @ViewChildren('ModuleList') elems: QueryList<ElementRef>;
//   @ViewChildren('ReportList') elems2: QueryList<ElementRef>;

//   constructor(private router: Router,
//     private authService: AuthService,
//     private errorHandlerService: ErrorHandlerService,
//     private alertService: AlertService,
//     private activatedRoute: ActivatedRoute,

//   ) { }

//   moduleList: any[] = [];
//   reportList: any[] = [];
// username: string = '';
// actualProfileID: number = 0; // ✅ Store the actual profileID


//   profileForm = {
//     id: 0,
//     profileName: null,
//     isActive: true,
//     isDeleted: false,
//     userid:0,
//     roleId: null,
//     companyid: localStorage.getItem("companyID")
//   };

//   editMode: boolean = false;
//   viewMode: boolean = false;




// ngOnInit(): void {
//     this.activatedRoute.queryParams.subscribe(params => {
//       const id = params['id'];  // This is uid

//       this.moduleList = [];
//       this.reportList = [];

//       // ✅ ADD MODE
//       if (id === undefined || id === null) {
//         this.editMode = false;
//         this.viewMode = false;
//         this.username = '';
//         this.actualProfileID = 0;
//         return;
//       }

//       // ✅ EDIT / VIEW MODE
//       this.editMode = true;
//       this.viewMode = params['view'] === 'true';

//       this.authService.getProfileRegister().subscribe(res => {
//         const profile = res.find(p => p.uid === Number(id));

//         if (!profile) {
//           console.warn('Profile not found with uid:', id);
//           return;
//         }

//         // ✅ Store both uid and profileID
//         this.profileForm.id = profile.uid;           // uid for display
//         this.profileForm.userid = profile.uid;       // uid for routing
//         this.actualProfileID = profile.profileID;    // ✅ Actual profileID for backend
//         this.profileForm.profileName = profile.profileName;
//         this.username = profile.user;

//         console.log('Loaded profile - uid:', id, 'profileID:', this.actualProfileID, 'username:', this.username);

//         // ✅ Load modules/permissions
//         this.getAllAuthorityModules(this.username);
//       });
//     });
//   }


// // Update getProfileById if still being used elsewhere


//   ngAfterViewInit() {
//     this.elems.changes.subscribe((list) => {
//       if (list.length) {
//         this.setInitialModuleCheckboxStatus(); // DOM is ready
//       }
//     });

//     this.elems2.changes.subscribe((list) => {
//       if (list.length) {
//         this.setInitialReportCheckboxStatus(); // DOM is ready
//       }
//     });
// }

  



// getProfileById(uid: number, callback?: () => void) {
//   this.authService.getProfileRegister().subscribe({
//     next: (res: any[]) => {
//       if (res && res.length) {
//         // ✅ Find the profile with matching uid
//         const profile = res.find(p => p.uid === uid);
        
//         if (profile) {
//           this.profileForm.id = profile.uid;
//           this.profileForm.userid = profile.uid;
//           this.profileForm.profileName = profile.profileName;
//           this.profileForm.isActive = profile.isActive ?? true;
//           this.profileForm.isDeleted = profile.isDeleted ?? false;
//           this.username = profile.user;

//           console.log('Profile Form after mapping:', this.profileForm);

//           if (callback) callback();
//         } else {
//           console.warn('Profile not found with uid:', uid);
//         }
//       }
//     },
//     error: (err: any) => {
//       this.errorHandlerService.handleError(err);
//     }
//   });
// }



//   getProfileDetailsById(id: number) {
//     this.authService.getProfileDetailsById(id).subscribe({
//       next: (res) => {
//         this.setModuleAndReportData(res)
//       },
//       error: (err: any) => {
//         this.errorHandlerService.handleError(err);
//       }
//     });
//   }

// //   getAllAuthorityModules(profileName: string) {
// //   this.authService.getAllAuthorityModules(profileName).subscribe({
// //     next: (res) => {
// //       this.setModuleAndReportData(res); // reuse your existing logic
// //     },
// //     error: (err: any) => {
// //       this.errorHandlerService.handleError(err);
// //     }
// //   });
// // }


// getAllAuthorityModules(username: string) {
//   console.log('Fetching modules for user:', username);
//   this.authService.getAllAuthorityModules(username).subscribe({
//     next: (res) => {
//       console.log('MODULE LIST:', res);
//       this.setModuleAndReportData(res); 
//     },
//     error: (err: any) => {
//       this.errorHandlerService.handleError(err);
//     }
//   });
// }




  
// setModuleAndReportData(data: any[]) {
//   const moduleList = [];
//   const reportList = [];

//   if (data) {
//     data.forEach(item => {
//       const temPlateObj = {
//         moduleId: item.moduleId,               // top-level
//         name: this.formatName(item.moduleName), // top-level
//         canView: item.canview ?? false,        // note lowercase 'v'
//         canInsert: item.canInsert ?? false,
//         canUpdate: item.canUpdate ?? false,
//         canDelete: item.canDelete ?? false
//       };

//       if (item.viewreadonly) {                 // top-level
//         reportList.push(temPlateObj);
//       } else {
//         moduleList.push(temPlateObj);
//       }
//     });
//   }

//   // this.moduleList = moduleList;
//   // this.reportList = reportList;

//   // this.setInitialModuleCheckboxStatus();
//   // this.setInitialReportCheckboxStatus();
//   this.moduleList = moduleList;
// this.reportList = reportList;
// setTimeout(() => {
//   this.setInitialModuleCheckboxStatus();
//   this.setInitialReportCheckboxStatus();
// }, 200);
// }

//   formatName(name) {
//   return name
//     // Replace dashes with spaces
//     .replace(/-/g, ' ')
//     // Add space before capital letters (camelCase)
//     .replace(/([a-z])([A-Z])/g, '$1 $2')
//     // Convert to lowercase, split into words, capitalize each word
//     .toLowerCase()
//     .split(' ')
//     .filter(Boolean) // Remove any empty strings
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(' ');
// }

//   setInitialModuleCheckboxStatus() {
//     this.moduleList.forEach(element => {
//       this.checkUncheckParent('module'+ element.moduleId)
//     })
//   }

//   setInitialReportCheckboxStatus() {
//     this.checkUncheckParent('selectAllReport');
//   }

//   checkboxRecursion(event: Event) {
//     let element = event.target as HTMLInputElement;
//     let parentID = element.getAttribute('data-parent-id');

//     if (element.id) this.checkUncheckChild(element.id)
//     if (parentID) this.checkUncheckParent(parentID);
//   }

//   checkUncheckChild(elementID: string) {
//     if (elementID) {
//       const parentCheckbox = document.getElementById(elementID) as HTMLInputElement;
//       const allChildCheckboxes = document.querySelectorAll(`input[data-parent-id=${elementID}]`) as NodeListOf<HTMLInputElement>;
//       allChildCheckboxes.forEach((childCheckbox: HTMLInputElement) => {
//         childCheckbox.checked = parentCheckbox.checked;
//         childCheckbox.indeterminate = false;
//         if (childCheckbox.id) this.checkUncheckChild(childCheckbox.id)
//       })
//     }
//   }

//   checkUncheckParent(parentID: string | null) {
//     if (parentID) {
//       const parentCheckbox = document.getElementById(parentID) as HTMLInputElement;
//       if (parentCheckbox) {
//         const allChildCheckboxes = document.querySelectorAll(`input[data-parent-id=${parentID}]`) as NodeListOf<HTMLInputElement>;
//         const checkedChildCheckboxes = document.querySelectorAll(`input[data-parent-id=${parentID}]:checked`) as NodeListOf<HTMLInputElement>;
//         const inddeterminateChildCheckboxes = document.querySelectorAll(`input[data-parent-id=${parentID}]:indeterminate`) as NodeListOf<HTMLInputElement>;
//         this.setCheckboxStatus(parentCheckbox, checkedChildCheckboxes.length, inddeterminateChildCheckboxes.length, allChildCheckboxes.length);
//         parentID = parentCheckbox.getAttribute('data-parent-id');
//         if (parentID) this.checkUncheckParent(parentID);
//       }
      
//     }
//   }

//   setCheckboxStatus(parentNode: HTMLInputElement, checkedLength: number, indeterminateLength: number, totalLength: number) {
//     if (parentNode) {
//       if(checkedLength === 0 && indeterminateLength === 0) {
//         parentNode.checked = false;
//         parentNode.indeterminate = false;
//       } else if (checkedLength === totalLength) {
//         parentNode.indeterminate = false;
//         parentNode.checked = true;
//       } else {
//         parentNode.checked = false;
//         parentNode.indeterminate = true;
//       }
//     }
//   }

  
   

//   onSave() {
//   this.profileForm.companyid = "1";
//   // roleId is already part of profileForm, it will be sent automatically
//   this.authService.postProfile(this.profileForm).subscribe({
//     next: (res) => {
//       this.alertService.openSuccess('Successfully Saved');
//       this.onCancel();
//     },
//     error: (err: any) => {
//       this.errorHandlerService.handleError(err);
//     }
//   });
// }

//   onUpdate() {
//     this.authService.postProfile(this.profileForm).subscribe({
//       next: (res) => {
//         this.alertService.openSuccess('Successfully Updated');
//         this.onCancel();
//       },
//       error: (err: any) => {
//         this.errorHandlerService.handleError(err);
//       }
//     });
//   }

//   onCancel() {
//     this.router.navigate(['/search'], {
//       queryParams: { returnPath: '/master/profile' }
//     });
//   }


  

//   savePermissions() {
//   if (!this.profileForm.userid || this.profileForm.userid === 0) {
//     this.alertService.openSuccess('Please save the profile first before assigning permissions');
//     return;
//   }

//   let payload = this.createModulePayload();

//   // ✅ Pass uid and payload separately
//   this.authService.postProfileDetails(this.profileForm.userid, payload).subscribe({
//     next: () => {
//       this.alertService.openSuccess('Permissions saved successfully');
//     },
//     error: (err: any) => {
//       this.errorHandlerService.handleError(err);
//     }
//   });
// }


 


//   createModulePayload() {
//   const modulePayload = {};
//   const finalPayload = [];
  
//   const moduleCheckboxes = document.querySelectorAll('input[data-permission-type=moduleList]') as NodeListOf<HTMLInputElement>;
//   moduleCheckboxes.forEach((element) => {
//     let moduleId: string | number = element.getAttribute("data-parent-id");
//     moduleId = Number(moduleId.replace("module", ''));
//     if (modulePayload[moduleId]) {
//       modulePayload[moduleId][element.value] = element.checked
//     } else {
//       modulePayload[moduleId] = { 
//         [element.value]: element.checked
//       }
//     }
//   })

//   const reportCheckboxes = document.querySelectorAll('input[data-permission-type=reportList]') as NodeListOf<HTMLInputElement>;
//   reportCheckboxes.forEach((element) => {
//     let moduleId: string | number = element.value;
//     moduleId = Number(moduleId);
//     if (modulePayload[moduleId]) {
//       modulePayload[moduleId]['canView'] = element.checked
//     } else {
//       modulePayload[moduleId] = { 
//         ['canView']: element.checked
//       }
//     }
//   })

//   Object.entries(modulePayload).forEach((item: any) => {
//     const permissions = item[1];
    
//     // ✅ Only include if at least one permission is true
//     const hasAnyPermission = 
//       permissions.canView === true || 
//       permissions.canInsert === true || 
//       permissions.canUpdate === true || 
//       permissions.canDelete === true;
    
//   //   if (hasAnyPermission) {
//   //     item[1].id = 0;
//   //     item[1].moduleId = Number(item[0]);
//   //     item[1].profileid = this.actualProfileID;
//   //     item[1].userid = this.profileForm.userid;
//   //     finalPayload.push(item[1]);
//   //   }
//   // })


//   if (hasAnyPermission) {
//       item[1].id = 0;
// item[1].moduleId = Number(item[0]);
// item[1].profileid = this.actualProfileID;
// item[1].userid = this.profileForm.userid;
// finalPayload.push(item[1]);
//     }
//   })
  
//   // console.log('Final Payload (filtered):', finalPayload);
//   // console.log('UID for route:', this.profileForm.userid);
//   // console.log('ProfileID in payload:', this.actualProfileID);
//   // console.log('Total modules with permissions:', finalPayload.length);
  
//   return finalPayload;
// }


// }




import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatMenuModule,
    MatDialogModule,
    MatCardModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  @ViewChildren('ModuleList') elems: QueryList<ElementRef>;
  @ViewChildren('ReportList') elems2: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
  ) { }

  moduleList: any[] = [];
  reportList: any[] = [];
  username: string = '';
  actualProfileID: number = 0;

  profileForm = {
    id: 0,              // ← this will hold actualProfileID for backend update
    profileName: null,
    isActive: true,
    isDeleted: false,   // ← always false, never true
    userid: 0,
    roleId: null,
    companyid: localStorage.getItem("companyID")
  };

  editMode: boolean = false;
  viewMode: boolean = false;

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];

      this.moduleList = [];
      this.reportList = [];

      // ADD MODE
      if (id === undefined || id === null) {
        this.editMode = false;
        this.viewMode = false;
        this.username = '';
        this.actualProfileID = 0;
        this.profileForm.id = 0;
        this.profileForm.userid = 0;
        return;
      }

      // EDIT / VIEW MODE
      this.editMode = true;
      this.viewMode = params['view'] === 'true';

      this.authService.getProfileRegister().subscribe(res => {
        const profile = res.find(p => p.uid === Number(id));

        if (!profile) {
          console.warn('Profile not found with uid:', id);
          return;
        }

        this.actualProfileID = profile.profileID;        // real profileID for permissions save
        this.profileForm.id = profile.profileID;         // ✅ send profileID to backend for update
        this.profileForm.userid = profile.uid;           // uid for permissions route
        this.profileForm.profileName = profile.profileName;
        this.profileForm.isActive = true;
        this.profileForm.isDeleted = false;              // ✅ always false
        this.username = profile.user;

        console.log('uid:', id, 'profileID:', this.actualProfileID, 'username:', this.username);

        this.getAllAuthorityModules(this.username);
      });
    });
  }

  ngAfterViewInit() {
    this.elems.changes.subscribe((list) => {
      if (list.length) {
        this.setInitialModuleCheckboxStatus();
      }
    });
    this.elems2.changes.subscribe((list) => {
      if (list.length) {
        this.setInitialReportCheckboxStatus();
      }
    });
  }

  getAllAuthorityModules(username: string) {
    this.authService.getAllAuthorityModules(username).subscribe({
      next: (res) => {
        this.setModuleAndReportData(res);
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
  }

  setModuleAndReportData(data: any[]) {
    const moduleList = [];
    const reportList = [];

    if (data) {
      data.forEach(item => {
        const obj = {
          moduleId: item.moduleId,
          name: this.formatName(item.moduleName),
          canView: item.canview ?? false,
          canInsert: item.canInsert ?? false,
          canUpdate: item.canUpdate ?? false,
          canDelete: item.canDelete ?? false
        };
        if (item.viewreadonly) {
          reportList.push(obj);
        } else {
          moduleList.push(obj);
        }
      });
    }

    this.moduleList = moduleList;
    this.reportList = reportList;

    // ✅ Wait for DOM to render before setting checkbox state
    setTimeout(() => {
      this.setInitialModuleCheckboxStatus();
      this.setInitialReportCheckboxStatus();
    }, 200);
  }

  formatName(name: string): string {
    return name
      .replace(/-/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  setInitialModuleCheckboxStatus() {
    this.moduleList.forEach(element => {
      this.checkUncheckParent('module' + element.moduleId);
    });
  }

  setInitialReportCheckboxStatus() {
    this.checkUncheckParent('selectAllReport');
  }

  checkboxRecursion(event: Event) {
    const element = event.target as HTMLInputElement;
    const parentID = element.getAttribute('data-parent-id');
    if (element.id) this.checkUncheckChild(element.id);
    if (parentID) this.checkUncheckParent(parentID);
  }

  checkUncheckChild(elementID: string) {
    if (elementID) {
      const parentCheckbox = document.getElementById(elementID) as HTMLInputElement;
      const allChildCheckboxes = document.querySelectorAll(
        `input[data-parent-id=${elementID}]`
      ) as NodeListOf<HTMLInputElement>;
      allChildCheckboxes.forEach((childCheckbox) => {
        childCheckbox.checked = parentCheckbox.checked;
        childCheckbox.indeterminate = false;
        if (childCheckbox.id) this.checkUncheckChild(childCheckbox.id);
      });
    }
  }

  checkUncheckParent(parentID: string | null) {
    if (parentID) {
      const parentCheckbox = document.getElementById(parentID) as HTMLInputElement;
      if (parentCheckbox) {
        const all = document.querySelectorAll(`input[data-parent-id=${parentID}]`) as NodeListOf<HTMLInputElement>;
        const checked = document.querySelectorAll(`input[data-parent-id=${parentID}]:checked`) as NodeListOf<HTMLInputElement>;
        const indeterminate = document.querySelectorAll(`input[data-parent-id=${parentID}]:indeterminate`) as NodeListOf<HTMLInputElement>;
        this.setCheckboxStatus(parentCheckbox, checked.length, indeterminate.length, all.length);
        const nextParent = parentCheckbox.getAttribute('data-parent-id');
        if (nextParent) this.checkUncheckParent(nextParent);
      }
    }
  }

  setCheckboxStatus(
    parentNode: HTMLInputElement,
    checkedLength: number,
    indeterminateLength: number,
    totalLength: number
  ) {
    if (parentNode) {
      if (checkedLength === 0 && indeterminateLength === 0) {
        parentNode.checked = false;
        parentNode.indeterminate = false;
      } else if (checkedLength === totalLength) {
        parentNode.indeterminate = false;
        parentNode.checked = true;
      } else {
        parentNode.checked = false;
        parentNode.indeterminate = true;
      }
    }
  }

  // ✅ Save = Add new profile
  onSave() {
    this.profileForm.companyid = "1";
    this.profileForm.isDeleted = false;
    this.authService.postProfile(this.profileForm).subscribe({
      next: () => {
        this.alertService.openSuccess('Successfully Saved');
        this.onCancel();
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
  }

  // ✅ Update = Edit existing profile name only
  onUpdate() {
    this.profileForm.isDeleted = false; // ✅ always false — never delete on update
    this.authService.postProfile(this.profileForm).subscribe({
      next: () => {
        this.alertService.openSuccess('Successfully Updated');
        this.onCancel();
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/master/profile' }
    });
  }

  // ✅ Save permissions — sends ALL modules including unchecked
  savePermissions() {
    if (!this.profileForm.userid || this.profileForm.userid === 0) {
      this.alertService.openSuccess('Please save the profile first before assigning permissions');
      return;
    }

    const payload = this.createModulePayload();
    console.log('Saving permissions - payload count:', payload.length);
    console.log('Sample:', payload[0]);

    this.authService.postProfileDetails(this.profileForm.userid, payload).subscribe({
      next: () => {
        this.alertService.openSuccess('Permissions saved successfully');
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
  }

  createModulePayload() {
    const modulePayload: any = {};
    const finalPayload: any[] = [];

    // Read all module checkboxes
    const moduleCheckboxes = document.querySelectorAll(
      'input[data-permission-type=moduleList]'
    ) as NodeListOf<HTMLInputElement>;

    moduleCheckboxes.forEach((element) => {
      let moduleId: string | number = element.getAttribute("data-parent-id");
      moduleId = Number(moduleId.replace("module", ''));
      if (modulePayload[moduleId]) {
        modulePayload[moduleId][element.value] = element.checked;
      } else {
        modulePayload[moduleId] = { [element.value]: element.checked };
      }
    });

    // Read all report checkboxes
    const reportCheckboxes = document.querySelectorAll(
      'input[data-permission-type=reportList]'
    ) as NodeListOf<HTMLInputElement>;

    reportCheckboxes.forEach((element) => {
      const moduleId = Number(element.value);
      if (modulePayload[moduleId]) {
        modulePayload[moduleId]['canView'] = element.checked;
      } else {
        modulePayload[moduleId] = { canView: element.checked };
      }
    });

    // ✅ Send ALL modules — including unchecked (no hasAnyPermission filter)
    Object.entries(modulePayload).forEach((item: any) => {
      item[1].id = 0;
      item[1].moduleId = Number(item[0]);
      item[1].profileid = this.actualProfileID;
      item[1].userid = this.profileForm.userid;
      finalPayload.push(item[1]);
    });

    return finalPayload;
  }
}
