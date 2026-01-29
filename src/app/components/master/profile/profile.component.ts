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

  constructor(private router: Router,
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,

  ) { }

  moduleList: any[] = [];
  reportList: any[] = [];

  profileForm = {
    id: 0,
    profileName: null,
    isActive: true,
    isDeleted: true,
    companyid: localStorage.getItem("companyID")
  };

  editMode: boolean = false;
  viewMode: boolean = false;

  ngOnInit(): void {
      this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.editMode = true;
        const view = params['view'];
        if (view === 'true') {
          this.viewMode = true;
        }
        
    this.moduleList = null;
    this.reportList = null; 
    // this.setInitialModuleCheckboxStatus();
    // this.setInitialReportCheckboxStatus();
       // this.getProfileById(Number(id));
        // this.getProfileDetailsById(Number(id));
          this.getProfileById(Number(id), () => {
        this.getAllAuthorityModules(this.profileForm.profileName);
      });
      }
    });
  }

  ngAfterViewInit() {
    this.elems.changes.subscribe((list) => {
      if (list.length) {
        this.setInitialModuleCheckboxStatus(); // DOM is ready
      }
    });

    this.elems2.changes.subscribe((list) => {
      if (list.length) {
        this.setInitialReportCheckboxStatus(); // DOM is ready
      }
    });
}

  // getProfileById(id: number) {
  //   this.authService.getProfileById(id).subscribe({
  //     next: (res) => {
  //       this.profileForm = res[0];
  //     },
  //     error: (err: any) => {
  //       this.errorHandlerService.handleError(err);
  //     }
  //   });
  // }


  getProfileById(id: number, callback?: () => void) {
  this.authService.getProfileById(id).subscribe({
    next: (res) => {
      this.profileForm = res[0];
      if (callback) callback(); // call after profileForm is ready
    },
    error: (err: any) => {
      this.errorHandlerService.handleError(err);
    }
  });
}


  getProfileDetailsById(id: number) {
    this.authService.getProfileDetailsById(id).subscribe({
      next: (res) => {
        this.setModuleAndReportData(res)
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
  }

  getAllAuthorityModules(profileName: string) {
  this.authService.getAllAuthorityModules(profileName).subscribe({
    next: (res) => {
      this.setModuleAndReportData(res); // reuse your existing logic
    },
    error: (err: any) => {
      this.errorHandlerService.handleError(err);
    }
  });
}



  // setModuleAndReportData(data) {
  //   let module = [];
  //   let report = [];
  //   if (data) {
  //     data.forEach(item => {
  //       let temPlateObj = {
  //         moduleId: item.module.moduleID,
  //         name: this.formatName(item.module.moduleName),
  //         canView: item.canView,
  //         canInsert: item.canInsert,
  //         canUpdate: item.canUpdate,
  //         canDelete: item.canDelete 
  //       }
  //       if (item.module.viewreadonly) {
  //         report.push(temPlateObj);
  //       } else {
  //         module.push(temPlateObj);
  //       }
  //     })
  //   }
  //   this.moduleList = module;
  //   this.reportList = report;
  //   this.setInitialModuleCheckboxStatus();
  //   this.setInitialReportCheckboxStatus();
  // }
setModuleAndReportData(data: any[]) {
  const moduleList = [];
  const reportList = [];

  if (data) {
    data.forEach(item => {
      const temPlateObj = {
        moduleId: item.moduleId,               // top-level
        name: this.formatName(item.moduleName), // top-level
        canView: item.canview ?? false,        // note lowercase 'v'
        canInsert: item.canInsert ?? false,
        canUpdate: item.canUpdate ?? false,
        canDelete: item.canDelete ?? false
      };

      if (item.viewreadonly) {                 // top-level
        reportList.push(temPlateObj);
      } else {
        moduleList.push(temPlateObj);
      }
    });
  }

  this.moduleList = moduleList;
  this.reportList = reportList;

  this.setInitialModuleCheckboxStatus();
  this.setInitialReportCheckboxStatus();
}

  formatName(name) {
  return name
    // Replace dashes with spaces
    .replace(/-/g, ' ')
    // Add space before capital letters (camelCase)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Convert to lowercase, split into words, capitalize each word
    .toLowerCase()
    .split(' ')
    .filter(Boolean) // Remove any empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

  setInitialModuleCheckboxStatus() {
    this.moduleList.forEach(element => {
      this.checkUncheckParent('module'+ element.moduleId)
    })
  }

  setInitialReportCheckboxStatus() {
    this.checkUncheckParent('selectAllReport');
  }

  checkboxRecursion(event: Event) {
    let element = event.target as HTMLInputElement;
    let parentID = element.getAttribute('data-parent-id');

    if (element.id) this.checkUncheckChild(element.id)
    if (parentID) this.checkUncheckParent(parentID);
  }

  checkUncheckChild(elementID: string) {
    if (elementID) {
      const parentCheckbox = document.getElementById(elementID) as HTMLInputElement;
      const allChildCheckboxes = document.querySelectorAll(`input[data-parent-id=${elementID}]`) as NodeListOf<HTMLInputElement>;
      allChildCheckboxes.forEach((childCheckbox: HTMLInputElement) => {
        childCheckbox.checked = parentCheckbox.checked;
        childCheckbox.indeterminate = false;
        if (childCheckbox.id) this.checkUncheckChild(childCheckbox.id)
      })
    }
  }

  checkUncheckParent(parentID: string | null) {
    if (parentID) {
      const parentCheckbox = document.getElementById(parentID) as HTMLInputElement;
      if (parentCheckbox) {
        const allChildCheckboxes = document.querySelectorAll(`input[data-parent-id=${parentID}]`) as NodeListOf<HTMLInputElement>;
        const checkedChildCheckboxes = document.querySelectorAll(`input[data-parent-id=${parentID}]:checked`) as NodeListOf<HTMLInputElement>;
        const inddeterminateChildCheckboxes = document.querySelectorAll(`input[data-parent-id=${parentID}]:indeterminate`) as NodeListOf<HTMLInputElement>;
        this.setCheckboxStatus(parentCheckbox, checkedChildCheckboxes.length, inddeterminateChildCheckboxes.length, allChildCheckboxes.length);
        parentID = parentCheckbox.getAttribute('data-parent-id');
        if (parentID) this.checkUncheckParent(parentID);
      }
      
    }
  }

  setCheckboxStatus(parentNode: HTMLInputElement, checkedLength: number, indeterminateLength: number, totalLength: number) {
    if (parentNode) {
      if(checkedLength === 0 && indeterminateLength === 0) {
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

  onSave() {
    this.profileForm.companyid="1";
    this.authService.postProfile(this.profileForm).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Saved');
        this.onCancel();
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
  } 
   

  onUpdate() {
    this.authService.postProfile(this.profileForm).subscribe({
      next: (res) => {
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


  savePermissions() {
    let payload = this.createModulePayload();
    this.authService.postProfileDetails(payload).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Saved');
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
  }

  createModulePayload() {
    const modulePayload = {};
    const finalPayload = [];
    const moduleCheckboxes = document.querySelectorAll('input[data-permission-type=moduleList]') as NodeListOf<HTMLInputElement>;
    moduleCheckboxes.forEach((element) => {
      let moduleId: string | number = element.getAttribute("data-parent-id");
      moduleId = Number(moduleId.replace("module", ''));
      if (modulePayload[moduleId]) {
          modulePayload[moduleId][element.value] = element.checked
      } else {
        modulePayload[moduleId] = { 
          [element.value]: element.checked
        }
      }
    })

    const reportCheckboxes = document.querySelectorAll('input[data-permission-type=reportList]') as NodeListOf<HTMLInputElement>;
    reportCheckboxes.forEach((element) => {
      let moduleId: string | number = element.value;
      moduleId = Number(moduleId);
      if (modulePayload[moduleId]) {
          modulePayload[moduleId]['canView'] = element.checked
      } else {
        modulePayload[moduleId] = { 
          ['canView']: element.checked
        }
      }
    })


    Object.entries(modulePayload).forEach((item: any) => {
      item[1].id = 0;
      item[1].moduleId = Number(item[0]);
      item[1].profileid = this.profileForm.id;
      finalPayload.push(item[1]);
    })
    return finalPayload;

  }

}

