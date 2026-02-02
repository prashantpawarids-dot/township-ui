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



import { CommonModule, KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { DomSanitizer } from '@angular/platform-browser';
import { Days, AdditionalAccessRights, AddonDataSource, AdditionalAccessRightsData, DaysOfWeek } from 'src/app/models/common.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-town-add-access-rights',
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './town-add-access-rights.component.html',
  styleUrl: './town-add-access-rights.component.scss'
})
export class TownAddAccessRightsComponent implements OnInit {

  @Input() addAccessRights: AdditionalAccessRightsData;
  @Input() isServiceProvider: boolean = false; // NEW INPUT
  
  seletedAccessRights = new AdditionalAccessRights();
  neighbourhoodOptions: any[] = [];
  buildingOptions: any[] = [];
  amenitiesOptions: any[] = [];
  flatNumberOptions: any[] = []; // NEW
  assignedFlatNumbers: string[] = []; // I want show assined flats checkbox marked 
  selectedFlatNumbers: string[] = []; // NEW
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

  @Input() dataToDisplayAAR: AdditionalAccessRightsData[] = [];
  @Input() dataSourceAAR = new AddonDataSource(this.dataToDisplayAAR);
  @Output() addAREvent = new EventEmitter<any>();
  isEdit: boolean = false;
  editAccessRights: AdditionalAccessRights = new AdditionalAccessRights();

  constructor(private sanitizer: DomSanitizer, private authService: AuthService) {}
  
  ngOnInit(): void {
    this.getBuildings();
    this.getNeighbourhood();
    this.getAmenities();
    if (this.isServiceProvider) {
    this.fetchFlatNumbers();
  }
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

  // NEW METHOD: Fetch flat numbers based on NRD and Building selection
  onBuildingChange() {
    if (this.isServiceProvider && 
        this.seletedAccessRights.neighbourhood?.length > 0 && 
        this.seletedAccessRights.building?.length > 0) {
      this.fetchFlatNumbers();
    } else {
      this.flatNumberOptions = [];
      this.selectedFlatNumbers = [];
    }
  }


// fetchFlatNumbers() {
//   this.authService.getNRDFlats().subscribe({
//     next: (res: any[]) => {
//       // console.log('API Response:', res); 
//       // console.log('Selected NRDs:', this.seletedAccessRights.neighbourhood); 
//       // console.log('Selected Buildings:', this.seletedAccessRights.building); 
      
     
//        const selectedNRDs = ["NRD THREE"];
//       //const selectedBuildings = ["Building"];
//       // const selectedNRDs = this.seletedAccessRights.neighbourhood || [];
//       const selectedBuildings = this.seletedAccessRights.building || [];
      
//       this.flatNumberOptions = res.filter(item => {
        
//         const nrdMatch = selectedNRDs.includes(item.nrd);
//         const buildingMatch = selectedBuildings.includes(item.buildingName);
//         return nrdMatch || buildingMatch;
//       });
      
//       // console.log('Filtered Flat Options:', this.flatNumberOptions); 
//     },
//     error: (err) => {
//       console.error('Error fetching flat numbers:', err);
//       this.flatNumberOptions = [];
//     }
//   });
// }



fetchFlatNumbers() {
  this.authService.getNRDFlats().subscribe({
    next: (res: any[]) => {
      // console.log('API Response:', res); 
      // console.log('Selected NRDs:', this.seletedAccessRights.neighbourhood); 
      // console.log('Selected Buildings:', this.seletedAccessRights.building); 

       const selectedNRDs = ["Building-C"];
      // const selectedBuildings = ["Building"];
      // const selectedNRDs = this.seletedAccessRights.neighbourhood || [];
      const selectedBuildings = this.seletedAccessRights.building || [];

      
      this.flatNumberOptions = res.filter(item => {
        if (selectedNRDs.length && selectedBuildings.length) {
          
          return selectedNRDs.includes(item.nrd) && selectedBuildings.includes(item.buildingName);
        } else if (selectedNRDs.length) {
        
          return selectedNRDs.includes(item.nrd);
        } else if (selectedBuildings.length) {
         
          return selectedBuildings.includes(item.buildingName);
        } else {
         
          return true; // show all
          // return false; // show none
        }
      });

      
      // console.log('Filtered Flat Options:', this.flatNumberOptions);
    },
    error: (err) => {
      console.error('Error fetching flat numbers:', err);
      this.flatNumberOptions = [];
    }
  });
}


  // NEW METHOD: Check if a flat is selected
  isFlatSelected(flatNumber: string): boolean {
    return this.selectedFlatNumbers.includes(flatNumber);
  }

  // NEW METHOD: Update flat selection
  updateFlatSelection(checked: boolean, flatNumber: string) {
    if (checked) {
      if (!this.selectedFlatNumbers.includes(flatNumber)) {
        this.selectedFlatNumbers.push(flatNumber);
      }
    } else {
      this.selectedFlatNumbers = this.selectedFlatNumbers.filter(f => f !== flatNumber);
    }
  }

  updateAllSelected(selected: boolean, day: DaysOfWeek) {
    this.days.weekDays.set(day, selected)
    this.checkSelectAll();
  }

  checkSelectAll(): string {
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
      id: id,
      moduleID: "0",
      cardHolderID: '',
      validTillDate: this.seletedAccessRights.validTill,
      isactive: false,
      isdeleted: false,
      ...Object.fromEntries(this.days.weekDays)
    } 

    // For Service Provider: Create entries for each selected flat number
    if (this.isServiceProvider && this.selectedFlatNumbers.length > 0) {
      this.selectedFlatNumbers.forEach(flatNumber => {
        const flatData = this.flatNumberOptions.find(f => f.flatNumber === flatNumber);
        if (flatData) {
          payload.push({
            ...eachData,
            moduleID: flatData.building, // Use building ID as moduleID
            flatNumber: flatNumber
          });
        }
      });
    } else {
      // Original logic for non-service providers
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
    this.selectedFlatNumbers = []; // NEW
    this.flatNumberOptions = []; // NEW
    this.selectAllDays(false);
  }

  removeAAR(data) {
    this.addAREvent.emit({
      action: 'delete',
      data: data
    });
  }

  editAAR(data: any) {
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
      if (this.isServiceProvider && data.flatNumber) {
        this.selectedFlatNumbers = [data.flatNumber];
      }
    } else if (data.moduleType == "AMT") {
      this.seletedAccessRights.amenities = [data.moduleName];
    }
  }

  updateAAR() {
    this.addAAR(this.updateId)
  }
}