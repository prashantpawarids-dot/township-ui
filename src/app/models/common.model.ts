import { DataSource } from "@angular/cdk/collections";
import { Observable, ReplaySubject } from "rxjs";

export class LandownerCommon {
    id: string;
    csn: string;
    idNumber: string;
    tagNumber: string;
    shortName: string;
    photo: string;
    firstName: string;
    middleName: string;
    lastName: string;
    icEno: string;
    gender: string;
    bloodGroup: string;
    dob: string;
    emailID: string;
    mobileNo: string;
    landLine: string;
    paNnumber: string;
    licenseNo: string;
    passportNo: string;
    voterID: string;
    aadharCardId: string;
    nrd: string;
    building: string;
    flatNumber: string;
    cardIssueDate: string;
    cardPrintingDate: string;
    logicalDeleted: number;
    isView: boolean;
    files: File[] = [];
}



export class LandOwner extends LandownerCommon {
    landOwnerIssueDate: string;
}

export class Employee {
    id: number;
    idNumber: number;
    code: string;
    firstName: string;
    middlename: string;
    lastName: string;
    gender: string;
    cardCSN: string;
    mobileNo: string;
    emailID: string;
    dob: string;
    doj: string;
    isResident: number;
    residentID: number;
    siteID: number;
    role: string;
    isactive: number;
    createdby: number;
    createdon: string;
    updatedby: number;
    updatedon: string;
}

export class Resident extends LandownerCommon {
    registrationIssueDate: string;
}
//Added by NB 040820225
export class Contractors extends LandownerCommon {
    Agency:string;
    ContractorTypeName: string;
  company: string;
  project:string;
  
  neighbourhood: string[]; //need to be add in a API and Database      
    validFromDate: string;        
    validToDate: string;          
} 

export class Tenant extends LandownerCommon {
    rid: number;
    aggreement_From: string;
    aggreement_To: string;
    tenentType: number;
    registrationIssueDate: string;
} 
export class Guest extends LandownerCommon {
    rid: string;
    rname: string;
    validFrom: string;
    validTill: string;
}

export class Visitor extends LandownerCommon {
    hid: string;
    visitStartTime: string;
    visitStartDate: string;
    visitEndTime: string;
    visitEndDate: string;
    visitPurpose: string;
    visitDesription: string;
    visitStatus: string;
    vType: string;
    regNo: string;
}

export class AddonCard {
    pid: number;
    id: number;
    csn: string;
    idNumber: string;
    tagNumber: string;
    paNnumber: string;
    passportNo: string;
    licenseNo: string;
    aadharCardId: string;
    voterID: string;
    firstName: string;
    middleName: string;
    lastName: string;
    shortName: string;
    gender: string;
    bloodGroup: string;
    dob: string;
    mobileNo: string;
    cardIssueDate: string;
    cardPrintingDate: string;
    logicalDeleted: string;
    dependLandOwnerIssueDate: string;
    photo: File | string;
    srno: string;
    aggreement_From: string;
    aggreement_To: string;
    registrationIssueDate: string;

}

export class AdditionalAccessRightsData {
    srno?: number;
    moduleName?: string;
    id: number;
    moduleID: string;
    cardHolderID: string;
    validTillDate: string;
    isactive: boolean;
    isdeleted: boolean;
    flatNumber?: string; // ADD THIS LINE
}

export type DaysOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export class Vehicle {
    srno: string;
    id: string;
    vType: string;
    vMake: string;
    regNo: string;
    vColor: string;
    stickerNo: string;
     isactive?: number;
     logical_Delete?: number;
}

// Building
export class Building {
    id: number;
    name: string;
    code: string;
    typeID: number;
    parentID: number;
    moduleType: string;
    discriminator: string;
    isactive: boolean;
    createdby: number;
    createdon: string;
    updatedby: number;
    updatedon: string;
}

export enum EntityType {
    OwnerCompany = 1,
    NRD = 2,
    Building = 3,
    VehicleType = 4,
    ReaderType = 5
  }

  export class Neighbourhood {
  id: number;
  name: string;
  code: string;
  typeID: number;
  parentID: number;
  moduleType: string;
  discriminator: string;
  isactive: boolean;
  createdby: number;
  createdon: string;
  updatedby: number;
  updatedon: string;
  }

  export class AdditionalAccessRights {
    srno: string;
    validTill: string;
    days: string[];
    neighbourhood: string[];
    building: string[];
    amenities: string[];
}
 
export interface Days {
    name: string;
    selected: boolean;
    weekDays: Map<DaysOfWeek, boolean>;
}

export class ServiceProvider {
    id: number;
    idNumber: string;
    shortName: string;
    firstName: string;
    middleName: string;
    gender: string;
    lastName: string;
    emailID: string;
    mobileNo: string;
    serviceTypeId: number;
    voterID: string;
    aadharCardId: string;
    doj: string;
    address: string;
    refrence1ID: string;
    refrence1Name: string;
    refrence2Name: string;
    refrence1Mobile: string;
    refrence2Mobile: string;
    refrence2Details: string;
    isActive: number;
    isDeleted: number;
    createdby: number;
    createdon: string;
    updatedby: number;
    updatedon:string;
    validFromDate: string;
    validToDate: string;
    photo: File | string 
        
}

export class AddonDataSource extends DataSource<any> {
    private _dataStream = new ReplaySubject<any[]>();

    constructor(initialData: any[]) {
        super();
        this.setData(initialData);
    }

    connect(): Observable<any[]> {
        return this._dataStream;
    }

    disconnect() { }

    setData(data: any[]) {
        this._dataStream.next(data);
    }
}
