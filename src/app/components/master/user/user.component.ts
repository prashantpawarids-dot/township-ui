import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { AlertService } from 'src/app/services/alert.service';
@Component({
  selector: 'app-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit{

  constructor(private authService: AuthService,
      private errorHandlerService: ErrorHandlerService,
      private alertService: AlertService,
      private router: Router,
      private activatedRoute: ActivatedRoute,
      ) {}

   companyOptions: any[] = [];
   profilenameOptions: any[] = [];
  editMode: boolean = false;
  viewMode: boolean = false;
   projectOptions: any[] = [];
  userForm: FormGroup = new FormGroup({
    id: new FormControl(0, Validators.required),
    name: new FormControl('', Validators.required),
    uid: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
    email: new FormControl("", Validators.required),
    phone: new FormControl("", Validators.required),
    isactive: new FormControl(true, Validators.required),
    isdeleted: new FormControl(false, Validators.required),
    projectID: new FormControl("1", Validators.required),
    companyID: new FormControl("", Validators.required),
    project: new FormControl(""),
    createdby: new FormControl(0),
    updatedon: new FormControl(null),
    updatedby: new FormControl(0),
    createdon: new FormControl(null),
    roleID: new FormControl(null),
    role: new FormControl(null),
  });
  getCompany() {
    this.authService.getCompany().subscribe(res => {
      this.companyOptions = res;
    })
  }

  displayProfileName = (roleID: any): string => {
  const match = this.profilenameOptions?.find(opt => opt.id == roleID)
  return match && match.profileName ? match.profileName : '';
}

  displayCompanyName = (companyID: any): string => {
    const match = this.companyOptions?.find(opt => opt.id == companyID)
    return match && match.companyName ? match.companyName : '';
  }

  getProfileName(){
    this.authService.getProfileName().subscribe(res => {
      this.profilenameOptions = res;
    })  
  }

  ngOnInit() {
    this.getCompany();
    this.getProject();
    this.getProfileName();
    this.activatedRoute.queryParams.subscribe(params => {
      
      const id = params['id'];
      if (id) {
        this.editMode = true;
        const view = params['view'];
        if (view === 'true') {
          this.viewMode = true;
        }
        this.getUserById(Number(id));
      }
    });
}

  getUserById(id: number) {
    this.authService.getUserById(id).subscribe({
      next: (res) => {
        this.editData(res);
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
    
  }

  onSave() {
    console.log(this.userForm.value);
    if (this.userForm.valid) {
       const selectedId = this.userForm.value.projectID;
    const selected = this.projectOptions.find(p => p.id == selectedId);

    this.userForm.patchValue({
      project: selected ? selected.projectName : ''
    });
      this.userForm.patchValue({
        createdon: new Date().toISOString(),
      });
      this.authService.addUser(this.userForm.value).subscribe({
        next: (res) => {
          this.alertService.openSuccess('Successfully Saved');
          this.onCancel();
        },
        error: (err: any) => {
          this.errorHandlerService.handleError(err);
        }
      });
    }
    // Add your save logic here
  }

  onUpdate() {
    if (this.userForm.valid) {
      this.userForm.patchValue({
        updatedon: new Date().toISOString(),
      });
      this.authService.updateUserById(this.userForm.value).subscribe({
        next: (res) => {
          this.alertService.openSuccess('Successfully Updated');
          this.onCancel();
        },
        error: (err: any) => {
          this.errorHandlerService.handleError(err);
        }
      });
    }
  }

  getProject() {
    this.authService.getProject().subscribe(res => {
      this.projectOptions = res;
    });
  }

  editData(res: any) {
    this.userForm.patchValue(res)
  }

  onCancel() {
    this.editMode = false;
    this.userForm.reset();
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/master/user' }
    });
  }

  displayProjectName = (projectName: string): string => {
    const match = this.projectOptions?.find(opt => opt.id == projectName)
    this.userForm.patchValue(match.projectName)
    return match && match.projectName ? match.projectName : '';
  }

}




//new code 

// import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
// import { MaterialModule } from 'src/app/_core/shared/material/material.module';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatDialogModule } from '@angular/material/dialog';
// import { AuthService } from 'src/app/services/auth.service';
// import { ErrorHandlerService } from 'src/app/services/error-handler.service';
// import { AlertService } from 'src/app/services/alert.service';

// @Component({
//   selector: 'app-user',
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MaterialModule,
//     FormsModule,
//     RouterModule,
//     MatToolbarModule,
//     MatMenuModule,
//     MatDialogModule
//   ],
//   templateUrl: './user.component.html',
//   styleUrl: './user.component.scss'
// })
// export class UserComponent implements OnInit {

//   @ViewChildren('ModuleList') elems: QueryList<ElementRef>;
//   @ViewChildren('ReportList') elems2: QueryList<ElementRef>;

//   constructor(
//     private authService: AuthService,
//     private errorHandlerService: ErrorHandlerService,
//     private alertService: AlertService,
//     private router: Router,
//     private activatedRoute: ActivatedRoute,
//   ) {}

//   companyOptions:  any[] = [];
//   projectOptions:  any[] = [];
//   editMode:  boolean = false;
//   viewMode:  boolean = false;

  
//   showProfileDetails: boolean = false;
//   moduleList:  any[] = [];
//   reportList:  any[] = [];
//   actualProfileID: number = 0;

//   userForm: FormGroup = new FormGroup({
//     id:        new FormControl(0,    Validators.required),
//     name:      new FormControl('',   Validators.required),
//     uid:       new FormControl('',   Validators.required),
//     password:  new FormControl('',   Validators.required),
//     email:     new FormControl('',   Validators.required),
//     phone:     new FormControl('',   Validators.required),
//     isactive:  new FormControl(true, Validators.required),
//     isdeleted: new FormControl(false, Validators.required),
//     projectID: new FormControl('1',  Validators.required),
//     companyID: new FormControl('',   Validators.required),
//     project:   new FormControl(''),
//     createdby: new FormControl(0),
//     updatedon: new FormControl(null),
//     updatedby: new FormControl(0),
//     createdon: new FormControl(null),
//     roleID:    new FormControl(null),
//     role:      new FormControl(null),
//   });

  
//   ngOnInit() {
//     this.getCompany();
//     this.getProject();

//     this.activatedRoute.queryParams.subscribe(params => {
//       const id = params['id'];
//       if (id) {
//         this.editMode = true;
//         if (params['view'] === 'true') this.viewMode = true;
//         this.getUserById(Number(id));
//       }
//     });
//   }

//   ngAfterViewInit() {
//     this.elems.changes.subscribe(list => {
//       if (list.length) this.setInitialModuleCheckboxStatus();
//     });
//     this.elems2.changes.subscribe(list => {
//       if (list.length) this.setInitialReportCheckboxStatus();
//     });
//   }

 
//   getCompany() {
//     this.authService.getCompany().subscribe(res => this.companyOptions = res);
//   }

//   displayCompanyName = (companyID: any): string => {
//     const match = this.companyOptions?.find(opt => opt.id == companyID);
//     return match?.companyName ?? '';
//   };

//   getProject() {
//     this.authService.getProject().subscribe(res => this.projectOptions = res);
//   }

//   displayProjectName = (projectName: string): string => {
//     const match = this.projectOptions?.find(opt => opt.id == projectName);
//     this.userForm.patchValue(match.projectName);
//     return match?.projectName ?? '';
//   };

 
//   getUserById(id: number) {
//     this.authService.getUserById(id).subscribe({
//       next: (res) => this.userForm.patchValue(res),
//       error: (err: any) => this.errorHandlerService.handleError(err)
//     });
//   }

//   onSave() {
//     if (this.userForm.valid) {
//       const selectedId = this.userForm.value.projectID;
//       const selected   = this.projectOptions.find(p => p.id == selectedId);
//       this.userForm.patchValue({
//         project:   selected ? selected.projectName : '',
//         createdon: new Date().toISOString(),
//       });
//       this.authService.addUser(this.userForm.value).subscribe({
//         next: () => { this.alertService.openSuccess('Successfully Saved'); this.onCancel(); },
//         error: (err: any) => this.errorHandlerService.handleError(err)
//       });
//     }
//   }

//   onUpdate() {
//     if (this.userForm.valid) {
//       this.userForm.patchValue({ updatedon: new Date().toISOString() });
//       this.authService.updateUserById(this.userForm.value).subscribe({
//         next: () => { this.alertService.openSuccess('Successfully Updated'); this.onCancel(); },
//         error: (err: any) => this.errorHandlerService.handleError(err)
//       });
//     }
//   }

//   onCancel() {
//     this.editMode = false;
//     this.userForm.reset();
//     this.router.navigate(['/search'], { queryParams: { returnPath: '/master/user' } });
//   }

  
//   toggleProfileDetails() {
//     this.showProfileDetails = !this.showProfileDetails;

//     if (this.showProfileDetails && this.moduleList.length === 0) {
//       const username = this.userForm.value.name;  
//       if (username) {
//         this.loadModulesForUser(username);
//       }
//     }
//   }

  
//   loadModulesForUser(username: string) {
//     this.authService.getAllAuthorityModules(username).subscribe({
//       next: (res: any[]) => {
//         if (res && res.length > 0) {
       
//           this.setModuleAndReportData(res);
//         } else {
       
//           this.loadAllModulesBlank();
//         }
//       },
//       error: () => {
       
//         this.loadAllModulesBlank();
//       }
//     });
//   }

  
//   loadAllModulesBlank() {
//     this.authService.getAllAuthorityModules('').subscribe({
//       next: (res: any[]) => {
       
//         const blanked = (res || []).map(item => ({
//           ...item,
//           canview:   false,
//           canInsert: false,
//           canUpdate: false,
//           canDelete: false,
//         }));
//         this.setModuleAndReportData(blanked);
//       },
//       error: (err) => this.errorHandlerService.handleError(err)
//     });
//   }

//   setModuleAndReportData(data: any[]) {
//     const moduleList: any[] = [];
//     const reportList: any[] = [];

//     (data || []).forEach(item => {
//       const obj = {
//         moduleId:  item.moduleId,
//         name:      this.formatName(item.moduleName),
//         canView:   item.canview   ?? false,  
//         canInsert: item.canInsert ?? false,
//         canUpdate: item.canUpdate ?? false,
//         canDelete: item.canDelete ?? false,
//       };
//       if (item.viewreadonly) {
//         reportList.push(obj);
//       } else {
//         moduleList.push(obj);
//       }
//     });

//     this.moduleList = moduleList;
//     this.reportList = reportList;
   
//   }

//   formatName(name: string): string {
//     return name
//       .replace(/-/g, ' ')
//       .replace(/([a-z])([A-Z])/g, '$1 $2')
//       .toLowerCase()
//       .split(' ')
//       .filter(Boolean)
//       .map(w => w.charAt(0).toUpperCase() + w.slice(1))
//       .join(' ');
//   }

 
//   setInitialModuleCheckboxStatus() {
//     this.moduleList.forEach(m => this.checkUncheckParent('module' + m.moduleId));
//   }

//   setInitialReportCheckboxStatus() {
//     this.checkUncheckParent('selectAllReport');
//   }

//   checkboxRecursion(event: Event) {
//     const el       = event.target as HTMLInputElement;
//     const parentID = el.getAttribute('data-parent-id');
//     if (el.id)    this.checkUncheckChild(el.id);
//     if (parentID) this.checkUncheckParent(parentID);
//   }

//   checkUncheckChild(elementID: string) {
//     if (!elementID) return;
//     const parent   = document.getElementById(elementID) as HTMLInputElement;
//     const children = document.querySelectorAll(
//       `input[data-parent-id=${elementID}]`
//     ) as NodeListOf<HTMLInputElement>;
//     children.forEach(child => {
//       child.checked       = parent.checked;
//       child.indeterminate = false;
//       if (child.id) this.checkUncheckChild(child.id);
//     });
//   }

//   checkUncheckParent(parentID: string | null) {
//     if (!parentID) return;
//     const parentCb = document.getElementById(parentID) as HTMLInputElement;
//     if (parentCb) {
//       const all    = document.querySelectorAll(`input[data-parent-id=${parentID}]`)            as NodeListOf<HTMLInputElement>;
//       const checked = document.querySelectorAll(`input[data-parent-id=${parentID}]:checked`)   as NodeListOf<HTMLInputElement>;
//       const indet  = document.querySelectorAll(`input[data-parent-id=${parentID}]:indeterminate`) as NodeListOf<HTMLInputElement>;
//       this.setCheckboxStatus(parentCb, checked.length, indet.length, all.length);
//       const next = parentCb.getAttribute('data-parent-id');
//       if (next) this.checkUncheckParent(next);
//     }
//   }

//   setCheckboxStatus(node: HTMLInputElement, checked: number, indeterminate: number, total: number) {
//     if (!node) return;
//     if (checked === 0 && indeterminate === 0) {
//       node.checked = false; node.indeterminate = false;
//     } else if (checked === total) {
//       node.checked = true;  node.indeterminate = false;
//     } else {
//       node.checked = false; node.indeterminate = true;
//     }
//   }

  
//   savePermissions() {
//     const userId = this.userForm.value.id;
//     if (!userId || userId === 0) {
//       this.alertService.openSuccess('Please save the user first before assigning permissions.');
//       return;
//     }
//     const payload = this.createModulePayload();
//     this.authService.postProfileDetails(userId, payload).subscribe({
//       next: () => {
//         this.alertService.openSuccess('Permissions saved successfully');
       
//         this.moduleList = [];
//         this.reportList = [];
//         this.loadModulesForUser(this.userForm.value.name);
//       },
//       error: (err: any) => this.errorHandlerService.handleError(err)
//     });
//   }

//   createModulePayload() {
//     const modulePayload: any = {};
//     const finalPayload: any[] = [];

//     (document.querySelectorAll('input[data-permission-type=moduleList]') as NodeListOf<HTMLInputElement>)
//       .forEach(el => {
//         const moduleId = Number(el.getAttribute('data-parent-id')!.replace('module', ''));
//         if (modulePayload[moduleId]) {
//           modulePayload[moduleId][el.value] = el.checked;
//         } else {
//           modulePayload[moduleId] = { [el.value]: el.checked };
//         }
//       });

//     (document.querySelectorAll('input[data-permission-type=reportList]') as NodeListOf<HTMLInputElement>)
//       .forEach(el => {
//         const moduleId = Number(el.value);
//         if (modulePayload[moduleId]) {
//           modulePayload[moduleId]['canView'] = el.checked;
//         } else {
//           modulePayload[moduleId] = { canView: el.checked };
//         }
//       });

//     Object.entries(modulePayload).forEach((item: any) => {
//       const p = item[1];
//       if (p.canView || p.canInsert || p.canUpdate || p.canDelete) {
//         item[1].id        = 0;
//         item[1].moduleId  = Number(item[0]);
//         item[1].profileid = this.actualProfileID;
//         item[1].userid    = this.userForm.value.id;
//         finalPayload.push(item[1]);
//       }
//     });

//     return finalPayload;
//   }
// }