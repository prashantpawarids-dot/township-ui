// import { CommonModule, KeyValue } from '@angular/common';
// import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { MaterialModule } from '../../material/material.module';
// import { DomSanitizer } from '@angular/platform-browser';
// import { Days, AdditionalAccessRights, AddonDataSource, AdditionalAccessRightsData, DaysOfWeek } from 'src/app/models/common.model';
// import { AuthService } from 'src/app/services/auth.service';

// @Component({
//   selector: 'app-town-add-access-rights',
//   imports: [CommonModule, MaterialModule, FormsModule],
//   templateUrl: './town-add-access-rights.component.html',
//   styleUrl: './town-add-access-rights.component.scss'
// })
// export class TownAddAccessRightsComponent implements OnInit {

//   @Input() addAccessRights: AdditionalAccessRightsData;
//   seletedAccessRights = new AdditionalAccessRights();
//   neighbourhoodOptions: any[] = [];
//   buildingOptions: any[] = [];
//   amenitiesOptions: any[] = [];
  
//   updateId = 0;
//   days: Days = {
//     name: 'All',
//     selected: false,
//     weekDays: new Map([
//       ['sun', false],
//       ['mon', false],
//       ['tue', false],
//       ['wed', false],
//       ['thu', false],
//       ['fri', false],
//       ['sat', false],
//     ])
//   };
  
//   // displayedColumns: string[] = ['srno', 'id', 'photo', 'fname', 'mname', 'lname',
//   //   'gender', 'blood', 'dob', 'mobile', 'pan', 'licence', 'passport', 'aadhar', 'voter', 'actions'];
//   displayedColumnsAAR: string[] = ['srno', 'validTill', 'access point', 'actions'];

//   @Input() dataToDisplayAAR: AdditionalAccessRightsData[] = [];
//   @Input() dataSourceAAR = new AddonDataSource(this.dataToDisplayAAR);
//   @Output() addAREvent = new EventEmitter<any>();
//   isEdit: boolean = false;
//   editAccessRights: AdditionalAccessRights = new AdditionalAccessRights();

//   constructor(private sanitizer: DomSanitizer, private authService: AuthService) {

//   }
//   ngOnInit(): void {
//     this.getBuildings();
//     this.getNeighbourhood();
//     this.getAmenities();
//   }

//   getBuildings() {
//     this.authService.getBuildings().subscribe(res => {
//       this.buildingOptions = res;
//     })
//   }

//   getNeighbourhood() {
//     this.authService.getNeighbourhood().subscribe(res => {
//       this.neighbourhoodOptions = res;
//     })
//   }

//   getAmenities() {
//     this.authService.getAmenities().subscribe(res => {
//       this.amenitiesOptions = res;
//     })
//   }

//   updateAllSelected(selected:boolean, day:DaysOfWeek){
//     this.days.weekDays.set(day, selected)
//     this.checkSelectAll();
//   }

//   checkSelectAll():string {
//     const totalLength = this.days.weekDays.size;
//     const selectedDaysLength = Array.from(this.days.weekDays.values()).filter(selected => selected).length;
//     if (totalLength == selectedDaysLength) {
//       this.days.selected = true;
//       return 'All';
//     } else if (selectedDaysLength > 0) {
//       this.days.selected = false;
//       return 'Intermediate';
//     } else {
//       return '';
//     }
//   }

//   get someSelected(): boolean {
//     return this.checkSelectAll() === 'Intermediate';
//   }

//   selectAllDays(selected: boolean) {
//     this.days.weekDays.forEach((_, key) => {
//       this.days.weekDays.set(key, selected)
//     })
//     this.days.selected = selected;
//   }

//   getModuleIdFromName = function(name: string) {
//     const result = this.find(element => element.name == name);
//     return String(result.id);
//   }

//   addAAR(id = 0) {
//     let payload: AdditionalAccessRightsData[] = [];
//     const eachData: AdditionalAccessRightsData = {
//       id:id,
//       moduleID: "0",
//       cardHolderID:'',
//       validTillDate: this.seletedAccessRights.validTill,
//       isactive:false,
//       isdeleted:false,
//       ...Object.fromEntries(this.days.weekDays)
//     } 

//     if (this.seletedAccessRights.neighbourhood && this.seletedAccessRights.neighbourhood.length > 0) {
//       this.seletedAccessRights.neighbourhood.forEach((data: string) => {
//         eachData.moduleID = this.getModuleIdFromName.call(this.neighbourhoodOptions, data)
//         payload.push({...eachData});
//       });
//     }
//     if (this.seletedAccessRights.building && this.seletedAccessRights.building.length > 0) {
//       this.seletedAccessRights.building.forEach((data: string) => {
//         eachData.moduleID = this.getModuleIdFromName.call(this.buildingOptions, data)
//         payload.push({...eachData});
//       });
//     }
//     if (this.seletedAccessRights.amenities && this.seletedAccessRights.amenities.length > 0) {
//       this.seletedAccessRights.amenities.forEach((data: string) => {
//         eachData.moduleID = this.getModuleIdFromName.call(this.amenitiesOptions, data)
//         payload.push({...eachData});
//       });
//     }
//     this.addAREvent.emit({
//       action: this.isEdit ? 'update' : 'add',
//       data: payload
//     });
//     this.isEdit = false;
//     this.reset();
//     //  locally add logic
//   }

//   reset() {
//     this.seletedAccessRights = new AdditionalAccessRights();
//     this.seletedAccessRights.neighbourhood = [];
//     this.seletedAccessRights.amenities = [];
//     this.seletedAccessRights.building = [];
//     this.selectAllDays(false);
//   }

//   removeAAR(data) {
//     // this.dataToDisplayAAR = this.dataToDisplayAAR.filter(x => x.srno !== data.srno);
//     // this.dataSourceAAR.setData(this.dataToDisplayAAR);
//     this.addAREvent.emit({
//       action: 'delete',
//       data: data
//     });
//   }

//   editAAR(data:any) {
//     this.reset();
//     this.isEdit = true;
//     this.updateId = data.id;
//     this.seletedAccessRights.validTill = data.validTillDate;
//     this.days.weekDays.set('sun', data.sun === 'true')
//     this.days.weekDays.set('mon', data.mon === 'true')
//     this.days.weekDays.set('tue', data.tue === 'true')
//     this.days.weekDays.set('wed', data.wed === 'true')
//     this.days.weekDays.set('thu', data.thu === 'true')
//     this.days.weekDays.set('fri', data.fri === 'true')
//     this.days.weekDays.set('sat', data.sat === 'true')
//     if (data.moduleType == "NRD") {
//       this.seletedAccessRights.neighbourhood = [data.moduleName];
//     } else if (data.moduleType == "Building") {
//       this.seletedAccessRights.building = [data.moduleName];
//     } else if (data.moduleType == "AMT") {
//       this.seletedAccessRights.amenities = [data.moduleName];
//     }
//   }

//   updateAAR() {
//     this.addAAR(this.updateId)
//   }

// }



//new code 
import { CommonModule, KeyValue } from '@angular/common';
// import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Component, EventEmitter, Input, OnInit, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { DomSanitizer } from '@angular/platform-browser';
import { MatChipsModule } from '@angular/material/chips';
import { Days, AdditionalAccessRights, AddonDataSource, AdditionalAccessRightsData, DaysOfWeek } from 'src/app/models/common.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-town-add-access-rights',
  standalone: true, 
  imports: [CommonModule, MaterialModule, FormsModule, MatChipsModule],
  templateUrl: './town-add-access-rights.component.html',
  styleUrls: ['./town-add-access-rights.component.scss']
})
export class TownAddAccessRightsComponent implements OnInit {

  @Input() addAccessRights: AdditionalAccessRightsData;
  @Input() serviceProviderId: string = '';
  
  seletedAccessRights = new AdditionalAccessRights();
  neighbourhoodOptions: any[] = [];
  buildingOptions: any[] = [];
  amenitiesOptions: any[] = [];
  
  // For flat assignment section
  selectedBuildingForFlat: string = '';
  availableFlatsForBuilding: any[] = [];
  selectedFlatsForAssignment: any[] = [];
  assignedFlatsData: any[] = []; // For table display
  
  updateId = 0;
  days: Days = {
    name: 'All',
    selected: false,
    weekDays: new Map([
      ['sun', false],
      ['mon', false],
      ['tue', false],
      ['wed', false],
      ['thu', false],
      ['fri', false],
      ['sat', false],
    ])
  };
  
  displayedColumnsAAR: string[] = ['srno', 'validTill', 'access point', 'actions'];
  displayedColumnsFlats: string[] = ['srno', 'flatNumber', 'actions'];

  @Input() dataToDisplayAAR: AdditionalAccessRightsData[] = [];
  @Input() dataSourceAAR = new AddonDataSource(this.dataToDisplayAAR);
  @Output() addAREvent = new EventEmitter<any>();
  @Output() flatAssignmentEvent = new EventEmitter<any>();
  
  isEdit: boolean = false;
  editAccessRights: AdditionalAccessRights = new AdditionalAccessRights();

  constructor(private sanitizer: DomSanitizer, private authService: AuthService) {}
ngOnChanges(changes: any): void {
  // Load assigned flats when serviceProviderId is set or changes
  if (changes.serviceProviderId && changes.serviceProviderId.currentValue) {
    this.loadAllAssignedFlats();
  }
}
  ngOnInit(): void {
    this.getBuildings();
    this.getNeighbourhood();
    this.getAmenities();
    
    // Load assigned flats if service provider ID exists
    // if (this.serviceProviderId) {
    //   this.loadAllAssignedFlats();
    // }
  }

  getBuildings() {
    this.authService.getBuildings().subscribe(res => {
      this.buildingOptions = res;
    })
  }

  getNeighbourhood() {
    this.authService.getNeighbourhood().subscribe(res => {
      this.neighbourhoodOptions = res;
    })
  }

  getAmenities() {
    this.authService.getAmenities().subscribe(res => {
      this.amenitiesOptions = res;
    })
  }

  onFlatBuildingChange() {
    if (!this.selectedBuildingForFlat) {
      this.availableFlatsForBuilding = [];
      this.selectedFlatsForAssignment = [];
      return;
    }

    this.authService.getNRDFlats().subscribe({
      next: (res: any[]) => {
        this.availableFlatsForBuilding = res.filter(item => 
          item.buildingName === this.selectedBuildingForFlat
        );
        
        // Load already assigned flats and pre-select them
        if (this.serviceProviderId) {
          this.loadAssignedFlats();
        }
      },
      error: (err) => {
        console.error('Error fetching flats:', err);
        this.availableFlatsForBuilding = [];
      }
    });
  }

  // Load all assigned flats for table display
  loadAllAssignedFlats() {
    this.authService.getServiceProviderReferenceFlatAll().subscribe({
      next: (res: any[]) => {
        const providerFlats = res.find(item => item.idNumber === this.serviceProviderId);
        
        if (providerFlats && providerFlats.flatNumber) {
          // Split by comma: "Falcon-A:101,Falcon-B:102,Falcon-C:104"
          const assignedFlatStrings = providerFlats.flatNumber.split(',');
          
          // Each row shows one flat (e.g., "Falcon-A:101")
          this.assignedFlatsData = assignedFlatStrings.map(flatStr => {
            return { flatNumber: flatStr.trim() };
          });
        } else {
          this.assignedFlatsData = [];
        }
      },
      error: (err) => {
        console.error('Error loading assigned flats:', err);
        this.assignedFlatsData = [];
      }
    });
  }

  // Load and pre-select assigned flats (when building changes)
  loadAssignedFlats() {
    this.authService.getServiceProviderReferenceFlatAll().subscribe({
      next: (res: any[]) => {
        const providerFlats = res.find(item => item.idNumber === this.serviceProviderId);
        
        if (providerFlats && providerFlats.flatNumber) {
          const assignedFlatStrings = providerFlats.flatNumber.split(',');
          
          // Pre-select assigned flats that match current building
          this.selectedFlatsForAssignment = assignedFlatStrings.map(flatStr => {
            const [buildingName, flatNumber] = flatStr.trim().split(':');
            return this.availableFlatsForBuilding.find(
              f => f.buildingName === buildingName && f.flatNumber === flatNumber
            );
          }).filter(f => f !== undefined);
        }
      },
      error: (err) => {
        console.error('Error loading assigned flats:', err);
      }
    });
  }

  // Edit flat assignment - load into dropdown
  editFlatAssignment(element: any) {
    // Parse "Falcon-A:101" format
    const [buildingName, flatNumber] = element.flatNumber.split(':');
    
    // Set building dropdown
    this.selectedBuildingForFlat = buildingName;
    
    // Load flats for that building
    this.authService.getNRDFlats().subscribe({
      next: (res: any[]) => {
        this.availableFlatsForBuilding = res.filter(item => 
          item.buildingName === buildingName
        );
        
        // Pre-select all currently assigned flats
        this.loadAssignedFlatsForEdit();
      },
      error: (err) => {
        console.error('Error fetching flats:', err);
      }
    });
  }

  // Load all assigned flats into dropdown for editing
  loadAssignedFlatsForEdit() {
    this.authService.getServiceProviderReferenceFlatAll().subscribe({
      next: (res: any[]) => {
        const providerFlats = res.find(item => item.idNumber === this.serviceProviderId);
        
        if (providerFlats && providerFlats.flatNumber) {
          const assignedFlatStrings = providerFlats.flatNumber.split(',');
          
          // Pre-select all assigned flats in the dropdown
          this.selectedFlatsForAssignment = assignedFlatStrings.map(flatStr => {
            const [buildingName, flatNumber] = flatStr.trim().split(':');
            return this.availableFlatsForBuilding.find(
              f => f.buildingName === buildingName && f.flatNumber === flatNumber
            );
          }).filter(f => f !== undefined);
        }
      },
      error: (err) => {
        console.error('Error loading assigned flats:', err);
      }
    });
  }

  // Save flat assignment (emit to parent)
  saveFlatAssignment() {
    if (!this.selectedFlatsForAssignment || this.selectedFlatsForAssignment.length === 0) {
      alert('Please select at least one flat');
      return;
    }

    // Check for duplicates within selection
    const flatStrings = this.selectedFlatsForAssignment.map(
      flat => `${flat.buildingName}:${flat.flatNumber}`
    );
    const uniqueFlats = [...new Set(flatStrings)];
    
    if (flatStrings.length !== uniqueFlats.length) {
      alert('Duplicate flats detected in selection. Please remove duplicates.');
      return;
    }

    // Emit event to parent to save
    this.flatAssignmentEvent.emit({
      action: 'save',
      data: this.selectedFlatsForAssignment
    });

    // Reset selection
    this.selectedFlatsForAssignment = [];
    this.selectedBuildingForFlat = '';
    this.availableFlatsForBuilding = [];
    
    // Refresh table after save
    setTimeout(() => {
      this.loadAllAssignedFlats();
    }, 500);
  }

  updateAllSelected(selected:boolean, day:DaysOfWeek){
    this.days.weekDays.set(day, selected)
    this.checkSelectAll();
  }

  checkSelectAll():string {
    const totalLength = this.days.weekDays.size;
    const selectedDaysLength = Array.from(this.days.weekDays.values()).filter(selected => selected).length;
    if (totalLength == selectedDaysLength) {
      this.days.selected = true;
      return 'All';
    } else if (selectedDaysLength > 0) {
      this.days.selected = false;
      return 'Intermediate';
    } else {
      return '';
    }
  }

  get someSelected(): boolean {
    return this.checkSelectAll() === 'Intermediate';
  }

  selectAllDays(selected: boolean) {
    this.days.weekDays.forEach((_, key) => {
      this.days.weekDays.set(key, selected)
    })
    this.days.selected = selected;
  }

  getModuleIdFromName = function(name: string) {
    const result = this.find(element => element.name == name);
    return String(result.id);
  }

  addAAR(id = 0) {
    let payload: AdditionalAccessRightsData[] = [];
    const eachData: AdditionalAccessRightsData = {
      id:id,
      moduleID: "0",
      cardHolderID:'',
      validTillDate: this.seletedAccessRights.validTill,
      isactive:false,
      isdeleted:false,
      ...Object.fromEntries(this.days.weekDays)
    } 

    if (this.seletedAccessRights.neighbourhood && this.seletedAccessRights.neighbourhood.length > 0) {
      this.seletedAccessRights.neighbourhood.forEach((data: string) => {
        eachData.moduleID = this.getModuleIdFromName.call(this.neighbourhoodOptions, data)
        payload.push({...eachData});
      });
    }
    if (this.seletedAccessRights.building && this.seletedAccessRights.building.length > 0) {
      this.seletedAccessRights.building.forEach((data: string) => {
        eachData.moduleID = this.getModuleIdFromName.call(this.buildingOptions, data)
        payload.push({...eachData});
      });
    }
    if (this.seletedAccessRights.amenities && this.seletedAccessRights.amenities.length > 0) {
      this.seletedAccessRights.amenities.forEach((data: string) => {
        eachData.moduleID = this.getModuleIdFromName.call(this.amenitiesOptions, data)
        payload.push({...eachData});
      });
    }
    this.addAREvent.emit({
      action: this.isEdit ? 'update' : 'add',
      data: payload
    });
    this.isEdit = false;
    this.reset();
  }

  reset() {
    this.seletedAccessRights = new AdditionalAccessRights();
    this.seletedAccessRights.neighbourhood = [];
    this.seletedAccessRights.amenities = [];
    this.seletedAccessRights.building = [];
    this.selectAllDays(false);
  }

  removeAAR(data) {
    this.addAREvent.emit({
      action: 'delete',
      data: data
    });
  }

  editAAR(data:any) {
    this.reset();
    this.isEdit = true;
    this.updateId = data.id;
    this.seletedAccessRights.validTill = data.validTillDate;
    this.days.weekDays.set('sun', data.sun === 'true')
    this.days.weekDays.set('mon', data.mon === 'true')
    this.days.weekDays.set('tue', data.tue === 'true')
    this.days.weekDays.set('wed', data.wed === 'true')
    this.days.weekDays.set('thu', data.thu === 'true')
    this.days.weekDays.set('fri', data.fri === 'true')
    this.days.weekDays.set('sat', data.sat === 'true')
    if (data.moduleType == "NRD") {
      this.seletedAccessRights.neighbourhood = [data.moduleName];
    } else if (data.moduleType == "Building") {
      this.seletedAccessRights.building = [data.moduleName];
    } else if (data.moduleType == "AMT") {
      this.seletedAccessRights.amenities = [data.moduleName];
    }
  }

  updateAAR() {
    this.addAAR(this.updateId)
  }
}


