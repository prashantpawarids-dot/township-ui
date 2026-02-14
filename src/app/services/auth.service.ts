import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { catchError, map, Observable, throwError,tap } from 'rxjs';
import { landownerMapper, residentMapper, tenantMapper } from '../mapper/post-mapper';
import { employeeMapperGet, landownerMapperGet } from '../mapper/get-mapper';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Console } from 'console';



@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private baseUrl = environment.apiurl; // Replace with your API URL

  constructor(private http: HttpClient) {

  }
get roleId(): string | null {
    return localStorage.getItem("roleid");
  }


  //added by NB
  get(data: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/items`, data);
  }

  getAllItems(): Observable<any> {
    return this.http.get(`${this.baseUrl}/items`);
  }

  getItemById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/items/${id}`);
  }

  createItem(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/items`, data);
  }

  updateItem(id: number, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/items/${id}`, data);
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/items/${id}`);
  }

  // Building

  // getBuildings(): Observable<any> {
  //   let url = this.baseUrl + 'Building'
  //   return this.http.get(url).pipe(map(res => {
  //     return res;
  //   }),
  //     catchError(this.handleError));
  // }


  getBuildings(): Observable<any[]> {
  const url = this.baseUrl + 'Building';
  const roleid = localStorage.getItem("roleid"); // get role ID

  return this.http.get<any[]>(url).pipe(
    map(res => {
      // Admin sees all, others see only active buildings
      return roleid === "100" ? res : res.filter(item => item.isactive === true);
    }),
    catchError(this.handleError)
  );
}



  getBuildingById(id): Observable<any> {
    let url = this.baseUrl + 'Building/GetBuilding/' + id;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  postBuilding(payload: any): Observable<any> {
    let url = this.baseUrl + 'Building/AddBuilding';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateBuilding(payload: any): Observable<any> {
    const url = this.baseUrl + 'Building/UpdateBuilding/' + payload.id; // Adjust endpoint if different
    return this.http.post(url, payload).pipe(
      map(res => res),
      catchError(this.handleError)
    );
  }

  // Ammenities

  // getAmenities(): Observable<any> {
  //   let url = this.baseUrl + 'Amenities'
  //   return this.http.get(url).pipe(map(res => {
  //     return res;
  //   }),
  //     catchError(this.handleError));
  // }


  getAmenities(): Observable<any[]> {
  const url = this.baseUrl + 'Amenities';
  const roleid = localStorage.getItem('roleid');

  return this.http.get<any[]>(url).pipe(
    map(res => {
      // Admin sees all, others see only active
      return roleid === '100'
        ? res
        : res.filter(item => item.isactive === true);
    }),
    catchError(this.handleError)
  );
}



  getAmenitiesById(id: number): Observable<any> {
    let url = this.baseUrl + 'Amenities/GetAmenity/' + id;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  postAmenities(payload: any): Observable<any> {
    let url = this.baseUrl + 'Amenities/AddAmenities';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateAmenities(payload: any): Observable<any> {
    let url = this.baseUrl + 'Amenities/' + payload.code + '/' + payload.id
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  // Neighbourhood

  // getNeighbourhood(): Observable<any> {
  //   let url = this.baseUrl + 'NRD'
  //   return this.http.get(url).pipe(map(res => {
  //     return res;
  //   }),
  //     catchError(this.handleError));
  // }


  getNeighbourhood(): Observable<any> {
    let url = this.baseUrl + 'NRD'
    const roleid = localStorage.getItem('roleid');
    return this.http.get<any[]>(url).pipe(
    map(res => {
      // Admin sees all, others see only active
      return roleid === '100'
        ? res
        : res.filter(item => item.isactive === true);
    }),
      catchError(this.handleError));
  }

  getNeighbourhoodById(id: number): Observable<any> {
    let url = this.baseUrl + 'NRD/GetNRD/' + id;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  postNeighbourhood(payload: any): Observable<any> {
    let url = this.baseUrl + 'NRD/AddNRD';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateNeighbourhood(payload: any): Observable<any> {
    let url = this.baseUrl + 'NRD/UpdateNRD/' + payload.id
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  // Auth 

  postAuthLogin(payload: any): Observable<any> {
    let url = this.baseUrl + 'Auth/login';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  // Land Owner

  // getLandOwner(): Observable<any> {
  //   let url = this.baseUrl + 'Landowner';
  //   return this.http.get(url).pipe(map((res: any[]) => {
  //     return res.map((element, index) => {
  //       const mappedElement = landownerMapperGet(element);
  //       return { ...mappedElement, srno: index + 1 };
  //     });
  //   }),
  //     catchError(this.handleError));
  // }

  getLandOwner(): Observable<any[]> {
  const url = this.baseUrl + 'Landowner';
  const roleid = localStorage.getItem('roleid');

  return this.http.get<any[]>(url).pipe(
    map(res => {
      // Filter based on role
      const filteredData =
        roleid === '100'
          ? res
          : res.filter(item => item.logicalDeleted === 0);

      // Apply mapper + srno after filtering
      return filteredData.map((element, index) => {
        const mappedElement = landownerMapperGet(element);
        return { ...mappedElement, srno: index + 1 };
      });
    }),
    catchError(this.handleError)
  );
}


  getLandOwnerById(id: any): Observable<any> {
    let url = this.baseUrl + 'Landowner/' + id;
    return this.http.get(url).pipe(map((res: any[]) => {
      return res;
    }),
      catchError(this.handleError));
  }

  getResidentById(id: any): Observable<any> {
    let url = this.baseUrl + 'Resident/' + id;
    return this.http.get(url).pipe(map((res: any[]) => {
      return res;
    }),
      catchError(this.handleError));
  }


  getTenantById(id: any): Observable<any> {
    let url = this.baseUrl + 'Tenent/' + id;
    return this.http.get(url).pipe(map((res: any[]) => {
      return res;
    }),
      catchError(this.handleError));
  }


  uploadPhoto(formData: FormData, photoPath, newLandOwnerId: number): Observable<any> {
    const url = `http://localhost:3000/upload-photo?newLandOwnerId=${newLandOwnerId}&photoPath=${encodeURIComponent(photoPath)}`;
    return this.http.post(url, formData);
  }

  // uploadPhoto(formData: FormData, photoPath, newLandOwnerId: number): Observable<any> {
  //   debugger;
  //   const file = formData.get('file') as File;

  //   if (!file) {
  //     return throwError(() => new Error('No file provided in the form data.'));
  //   }

  //   return new Observable(observer => {
  //     const reader = new FileReader();

  //     reader.onload = () => {
  //       try {
  //         // Create a Blob from the file data
  //         const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });

  //         // Create a download link
  //         const downloadLink = document.createElement('a');
  //         downloadLink.href = URL.createObjectURL(blob);
  //         downloadLink.download = `${newLandOwnerId}.jpg`; // Save the file with the newLandOwnerId as the name

  //         // Trigger the download
  //         downloadLink.click();

  //         observer.next({ message: 'File saved successfully', fileName: `${newLandOwnerId}.jpg` });
  //         observer.complete();
  //       } catch (error) {
  //         observer.error(error);
  //       }
  //     };

  //     reader.onerror = () => {
  //       observer.error(new Error('Error reading the file.'));
  //     };

  //     reader.readAsArrayBuffer(file);
  //   });
  // }


  private landOwnerDataSubject = new BehaviorSubject<any>({});
  landOwnerData$ = this.landOwnerDataSubject.asObservable();

  setLandOwnerData(data: any, isView: boolean): void {
    this.landOwnerDataSubject.next({ ...data, isView });
  }

  postLandOwner(payload: any): Observable<any> {
    let url = this.baseUrl + 'Landowner/AddLandowner';
    let postPayload = landownerMapper(payload);
    // console.log("post payload", postPayload);
    return this.http.post(url, postPayload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateLandOwner(payload: any): Observable<any> {
    let url = this.baseUrl + 'Landowner/UpdateLandowner/' + payload.id;
    let postPayload = landownerMapper(payload);
    return this.http.post(url, postPayload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  // land owner addon card

  postLandOwnerAddonCard(payload: any): Observable<any> {
    payload.id = payload.id == undefined ? "0" : payload.id
    let url = this.baseUrl + 'DependentLandOwner/AddDependentLandOwner';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  postLandOwnerAddonCards(payload: any): Observable<any> {
    let url = this.baseUrl + 'DependentLandOwner/AddDependentLandOwners';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateLandOwnerAddonCard(payload: any): Observable<any> {
    let url = this.baseUrl + 'DependentLandOwner/UpdateDependentLandOwner/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  postResidentAddonCard(payload: any): Observable<any> {
    payload.id = payload.id == undefined ? "0" : payload.id
    let url = this.baseUrl + 'DependentResident/AddDependentResident';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  postResidentAddonCards(payload: any): Observable<any> {
    let url = this.baseUrl + 'DependentResident/AddDependentResidents';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateResidentAddonCard(payload: any): Observable<any> {
    let url = this.baseUrl + 'DependentResident/UpdateDependentResident/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  postTenentAddonCard(payload: any): Observable<any> {
    payload.id = payload.id == undefined ? "0" : payload.id
    let url = this.baseUrl + 'DependentTenent/AddDependentTenent';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  postTenentAddonCards(payload: any): Observable<any> {
    let url = this.baseUrl + 'DependentTenent/AddDependentTenents';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateTenentAddonCard(payload: any): Observable<any> {
    let url = this.baseUrl + 'DependentTenent/UpdateDependentTenent/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  // land owner vehicle card

  // postLandOwnerVehicle(payload: any): Observable<any> {
  //   let url = this.baseUrl + 'Vehicle/AddVehicle';
  //   return this.http.post(url, payload).pipe(map(res => {
  //     return res;
  //   }),
  //     catchError(this.handleError));
  // }
  
postLandOwnerVehicle(payload: any): Observable<any> {
  const finalPayload = {
    ...payload,
    isactive: 1
  };

  let url = this.baseUrl + 'Vehicle/AddVehicle';

  return this.http.post(url, finalPayload).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

  updateLandOwnerVehicle(payload: any): Observable<any> {
    let url = this.baseUrl + 'Vehicle/UpdateVehicle/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }
// Delete Vehicle API - auto converts string to number
deleteVehicle(id: string | number): Observable<any> {
  let url = this.baseUrl + 'Vehicle/DeleteVehicle/' + id;
  return this.http.delete(url).pipe(
    map(res => {
      return res;
    }),
    catchError(this.handleError)
  );
}
  // land owner access rights
  postLandOwnerAccessRights(payload: any): Observable<any> {
    // console.log('postLandOwnerAccessRights Payload being sent:', payload);
    let url = this.baseUrl + 'UserRegistration/AddUpdateCardAccessRights';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateLandOwnerAccessRights(payload: any): Observable<any> {
    //  console.log('updateLandOwnerAccessRights Payload being sent:', payload);
    let url = this.baseUrl + 'UserRegistration/AddUpdateCardAccessRights';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }
  // Resident

  //resident/Tenents list API change
  // getResident(): Observable<any> {
  //   let url = this.baseUrl + 'Resident/';////Service_Provider/GetCurrentResidents'
  //   return this.http.get(url).pipe(map(res => {
  //     return res;
  //   }),
  //     catchError(this.handleError));
  // }

  getResident(): Observable<any> {
    let url = this.baseUrl + 'Resident/';////Service_Provider/GetCurrentResidents'
    const roleid = localStorage.getItem('roleid');

  return this.http.get<any[]>(url).pipe(
    map(res => {
      // Admin (roleid = 1) sees all
      // Others see only not-deleted guests
      return roleid === '100'
        ? res
        : res.filter(item => item.logicalDeleted === 0);
    }),
    catchError(this.handleError)
  );
}

  //resident/Tenents list API change
  getCurrentResidents(): Observable<any> {
    let url = this.baseUrl + 'Service_Provider/GetCurrentResidents/';////'
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }
  getResidentTenants(buildingid: number, flatNumber: number): Observable<any> {
    let url = this.baseUrl + `Service_Provider/GetAllResidentTenents?buildingid=${buildingid}&flatNumber=${flatNumber}`;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }


  postResident(payload: any): Observable<any> {
    let url = this.baseUrl + 'Resident/AddResident';
    const postPayload = residentMapper(payload);
    return this.http.post(url, postPayload).pipe(map(res => {

      return res;

    }),
      catchError(this.handleError));
  }

  updateResident(payload: any): Observable<any> {
    let url = this.baseUrl + 'Resident/UpdateResident/' + payload.id;
    payload.nrd = payload.nrd.toString();
    payload.building = payload.building.toString();
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  // Tenant

  // getTenant(): Observable<any> {
  //   let url = this.baseUrl + 'Tenent'
  //   return this.http.get(url).pipe(map(res => {
  //     return res;
  //   }),
  //     catchError(this.handleError));
  // }


getTenant(): Observable<any[]> {
  const url = this.baseUrl + 'Tenent'; // fixed spelling
  const roleid = localStorage.getItem("roleid"); // get role ID

  return this.http.get<any[]>(url).pipe(
    map(res => {
      // If roleid is 1, return all tenants; otherwise, only active ones
      return roleid === "100" ? res : res.filter(item => item.logicalDeleted === 0);
    }),
    catchError(this.handleError)
  );
}






  postTenant(payload: any): Observable<any> {
    payload.id = payload.id == undefined ? "0" : payload.id;
    let url = this.baseUrl + 'Tenent/AddTenent';
    const postPayload = tenantMapper(payload);
    return this.http.post(url, postPayload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateTenant(payload: any): Observable<any> {
    payload.id = payload.id == undefined ? "0" : payload.id;
    payload.building = payload.building.toString();
    let url = this.baseUrl + 'Tenent/UpdateTenent/' + payload.id
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }
 



  // Service Provider

  // getServiceProvider(): Observable<any> {
  //   let url = this.baseUrl + 'Service_Provider/GetAllServiceProviders'
  //   return this.http.get(url).pipe(map((res: any[]) => {
  //     return res
  //   }),
  //     catchError(this.handleError));
  // }


  getServiceProvider(): Observable<any> {
    let url = this.baseUrl + 'Service_Provider/GetAllServiceProviders'
     const roleid = localStorage.getItem('roleid');

  return this.http.get<any[]>(url).pipe(
    map(res => {
      // Admin sees all, others see only active companies
      return roleid === '100'
        ? res
        : res.filter(item => item.isActive ===1);
    }),
    catchError(this.handleError)
  );
  }

  getServiceProviderById(id: any): Observable<any> {
    let url = this.baseUrl + 'Service_Provider/' + id;
    return this.http.get(url).pipe(map((res: any[]) => {
      return res;
    }),
      catchError(this.handleError));
  }

  postServiceProvider(payload: any): Observable<any> {
    let url = this.baseUrl + 'Service_Provider/AddServiceProvider';
    const postPayload = payload;
    return this.http.post(url, postPayload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }


  updateServiceProvider(payload: any): Observable<any> {
    let url = this.baseUrl + 'Service_Provider/UpdateServiceProvider';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      if (error.status === 400 && error.error.errors) {
        // If it's a validation error, we can extract and format the errors
        const validationErrors = error.error.errors;
        const errorMessages = Object.keys(validationErrors).map(field => {
          return `${field}: ${validationErrors[field].join(', ')}`;
        }).join('\n');

        errorMessage = `Validation errors occurred: \n${errorMessages}`;
      } else {
        // Other backend error
        errorMessage = `Backend returned code ${error.status}, ` +
          `body was: ${JSON.stringify(error.error)}`;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Employee

  getEmployee(): Observable<any> {
    let url = this.baseUrl + 'Employee';
    return this.http.get(url).pipe(map((res: any[]) => {
      return res.map((element, index) => {
        const mappedElement = employeeMapperGet(element);
        return { ...mappedElement, srno: index + 1 };
      });
    }),
      catchError(this.handleError));
  }

  getEmployeeById(id: number): Observable<any> {
    let url = this.baseUrl + 'Employee/GetEmployeeAccessDetails/' + id;
    return this.http.get(url).pipe(map((res: any[]) => {
      return res;
    }),
      catchError(this.handleError));
  }

  postEmployee(payload: any): Observable<any> {
    let url = this.baseUrl + 'Employee/AddEmployee';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateEmployee(payload: any): Observable<any> {
    let url = this.baseUrl + 'Employee/UpdateEmployee/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }


  // Guest

  // getGuest(): Observable<any> {
  //   let url = this.baseUrl + 'Guest'
  //   return this.http.get(url).pipe(map(res => {
  //     return res;
  //   }),
  //     catchError(this.handleError));
  // }
getGuest(): Observable<any[]> {
  const url = this.baseUrl + 'Guest';
  const roleid = localStorage.getItem('roleid');

  return this.http.get<any[]>(url).pipe(
    map(res => {
      // Admin (roleid = 1) sees all
      // Others see only not-deleted guests
      return roleid === '100'
        ? res
        : res.filter(item => item.logicalDeleted === 0);
    }),
    catchError(this.handleError)
  );
}

  // Visitor
  getVisitor(): Observable<any> {
    let url = this.baseUrl + 'Visitor'
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }


  //Company

  // getCompany(): Observable<any> {
  //   let url = this.baseUrl + 'Company'
  //   return this.http.get(url).pipe(map(res => {
  //     return res;
  //   }),
  //     catchError(this.handleError));
  // }


  getCompany(): Observable<any[]> {
  const url = this.baseUrl + 'Company';
  const roleid = localStorage.getItem('roleid');

  return this.http.get<any[]>(url).pipe(
    map(res => {
      // Admin sees all, others see only active companies
      return roleid === '100'
        ? res
        : res.filter(item => item.isactive === true);
    }),
    catchError(this.handleError)
  );
}


  getProject(): Observable<any> {
    let url = this.baseUrl + 'Project'
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  getProjectById(id: number): Observable<any> {
    let url = this.baseUrl + 'Project/GetProject/' + id;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }


  postProject(payload: any): Observable<any> {
    let url = this.baseUrl + 'Project/AddProject';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateProject(payload: any): Observable<any> {
    let url = this.baseUrl + 'Project/UpdateProject/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

   getInoutRegister(): Observable<any> {
    let url = this.baseUrl + 'Report/InoutRegister'
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  //   getReader(id?: number): Observable<any> {
  //   let url = this.baseUrl + 'Reader'
  //   return this.http.get(url).pipe(map(res => {
  //     return res;
  //   }),
  //     catchError(this.handleError));
  // }

  getReader(id?: number): Observable<any> {
  const url = this.baseUrl + 'Reader';
  const roleid = localStorage.getItem('roleid'); // fetch role

  return this.http.get<any[]>(url).pipe(
    map(res => {
      // Admin sees everything, others see only not deleted
      return roleid === '100'
        ? res
        : res.filter(item => !item.isDeleted); 
    }),
    catchError(this.handleError)
  );
}

  //     getReaderLocation(id?: number): Observable<any> {
  //   let url = this.baseUrl + 'ReaderLocation'
  //   return this.http.get(url).pipe(map(res => {
  //     return res;
  //   }),
  //     catchError(this.handleError));
  // }


  getReaderLocation(id?: number): Observable<any> {
    let url = this.baseUrl + 'ReaderLocation'
   
  const roleid = localStorage.getItem('roleid');

  return this.http.get<any[]>(url).pipe(
    map(res => {
      // Admin sees all, others see only active companies
      return roleid === '100'
        ? res
        : res.filter(item => item.isactive === true);
    }),
    catchError(this.handleError)
  );
  }
  

  getReaderById(id: number): Observable<any> {
  let url = this.baseUrl + 'Reader/GetReader/' + id;
  return this.http.get(url).pipe(map(res => res), catchError(this.handleError));
}

getReaderLocationById(id: number): Observable<any> {
  let url = this.baseUrl + 'ReaderLocation/GetReaderLocation/' + id;
  return this.http.get(url).pipe(map(res => res), catchError(this.handleError));
}

  postReaderLocation(payload: any): Observable<any> {
    let url = this.baseUrl + 'ReaderLocation/AddReaderLocation';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

    postReader(payload: any): Observable<any> {
    let url = this.baseUrl + 'Reader/AddReader';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateReader(payload: any): Observable<any> {
    let url = this.baseUrl + 'Reader/UpdateReader/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }
    updateReaderLocation(payload: any): Observable<any> {
    let url = this.baseUrl + 'ReaderLocation/UpdateReaderLocation/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }



  // Master/Profile

  getProfile(): Observable<any> {
    let url = this.baseUrl + 'Profile'
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

 getProfileRegister(): Observable<any> {
  const url = this.baseUrl + 'auth/profileRegister';
  return this.http.get<any[]>(url).pipe(
    map(res => {
      // Keep only unique profiles based on 'profileID'
      const uniqueProfiles = res.filter((item, index, self) =>
        index === self.findIndex(t => t.uid === item.uid)
      );
      return uniqueProfiles;
    }),
    catchError(this.handleError)
  );
}

  // Master/User

  getUser(): Observable<any> {
    let url = this.baseUrl + 'UserRegistration'
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  // Master/ReverViewCity

  getRiverViewCity(): Observable<any> {
    let url = this.baseUrl + 'RiverViewCity'
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }


  // Master/ReaderLocation

  // getReaderLocation(): Observable<any> {
  //   let url = this.baseUrl + 'ReaderLocation'
  //   return this.http.get(url).pipe(map(res => {
  //     return res;
  //   }),
  //     catchError(this.handleError));
  // }

  // Master/ServiceType

  getServiceType(): Observable<any> {
    let url = this.baseUrl + 'ServiceType'
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  getServiceTypeById(id: number): Observable<any> {
    let url = this.baseUrl + 'ServiceType/GetServiceType/' + id;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  postServiceType(payload: any): Observable<any> {
    let url = this.baseUrl + 'ServiceType/AddServiceType';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateServiceType(payload: any): Observable<any> {
    let url = this.baseUrl + 'ServiceType/UpdateServiceType/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }
  // Master/ContractorType
  getContractorType(): Observable<any> {
    let url = this.baseUrl + 'ServiceType';
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

getContractorTypeById(id: number): Observable<any> {
  return this.http.get(`${this.baseUrl}ContractorType/ContractorType/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

postContractorType(payload: any): Observable<any> {
  return this.http.post(`${this.baseUrl}ContractorType/AddContractorType`, payload).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

updateContractorType(payload: any): Observable<any> {
  return this.http.post(
    `${this.baseUrl}ContractorType/UpdateContractorType/${payload.id}`,
    payload
  ).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}





  // Master/Contractor  



 getContractor(): Observable<any[]> {
  const url = this.baseUrl + 'Contractor';
  const roleid = localStorage.getItem("roleid"); 

  return this.http.get<any[]>(url).pipe(
    map(res => {
      
      return roleid === "100" ? res : res.filter(item => item.logicalDeleted === 0);
    }),
    catchError(this.handleError)
  );
}



  // Master/ReaderRelay
  // getReaderRelay(): Observable<any> {
  //   let url = this.baseUrl + 'Reader'
  //   return this.http.get(url).pipe(map(res => {
  //     return res;
  //   }),
  //     catchError(this.handleError));
  // }


  getReaderRelay(): Observable<any> {
    let url = this.baseUrl + 'ReaderRelay'
    const roleid = localStorage.getItem('roleid');

  return this.http.get<any[]>(url).pipe(
    map(res => {
      // Admin sees all, others see only active companies
      return roleid === '100'
        ? res
        : res.filter(item => item.isactive === true);
    }),
    catchError(this.handleError)
  );
  }



  addUser(payload: any): Observable<any> {
    let url = this.baseUrl + 'UserRegistration/AddUser'
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  getUserById(id: number): Observable<any> {
    let url = this.baseUrl + 'UserRegistration/GetUser/' + id;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateUserById(payload: any): Observable<any> {
    let url = this.baseUrl + 'UserRegistration/UpdateUser/' + payload.id;
    // console.log(url);
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  getContractorById(id: number): Observable<any> {
    let url = this.baseUrl + 'Contractor/GetContractorDetails/' + id;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  postContractor(payload: any): Observable<any> {
    let url = this.baseUrl + 'Contractor/AddContractor';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateContractor(payload: any): Observable<any> {
    let url = this.baseUrl + 'Contractor/UpdateContractor/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

 

  postContractorAddonCard(payload: any): Observable<any> {
    payload.id = payload.id == undefined ? "0" : payload.id
    let url = this.baseUrl + 'DependentContractor/AddDependentContractor';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  postContractorAddonCards(payload: any): Observable<any> {
    let url = this.baseUrl + 'DependentContractor/AddDependentContractors';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateContractorAddonCard(payload: any): Observable<any> {
    let url = this.baseUrl + 'DependentContractor/UpdateDependentContractor/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  postCompany(payload: any): Observable<any> {
    let url = this.baseUrl + 'Company/AddCompany';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  getCompanyById(id: number): Observable<any> {
    let url = this.baseUrl + 'Company/GetCompany/' + id;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateCompany(payload: any): Observable<any> {
    let url = this.baseUrl + 'Company/UpdateCompany/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateProfile(payload: any): Observable<any> {
    let url = this.baseUrl + 'Profile/UpdateProfile/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  postProfile(payload: any): Observable<any> {
    let url = this.baseUrl + 'Profile/AddUpdateProfile';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  getProfileById(id: number): Observable<any> {
    let url = this.baseUrl + 'Profile/GetProfile/' + id;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  getProfileDetailsById(id: number): Observable<any> {
    let url = this.baseUrl + 'Profile/GetProfileDetails/' + id;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  // postProfileDetails(payload: any): Observable<any> {
  //   let url = this.baseUrl + 'Profile/AddUpdateProfileDetails';
  //   return this.http.post(url, payload).pipe(map(res => {
  //     return res;
  //   }),
  //     catchError(this.handleError));
  // }


//   postProfileDetails(payload: any): Observable<any> {
//   const url = this.baseUrl + 'Profile/AddUpdateProfileDetails/' + payload[0]?.userid;
//   return this.http.post(url, payload).pipe(
//     map(res => res),
//     catchError(this.handleError)
//   );
// }

// ✅ Update the method signature to accept uid parameter
// ✅ Updated method in auth.service.ts
postProfileDetails(uid: number, payload: any): Observable<any> {
  const url = this.baseUrl + 'Profile/AddUpdateProfileDetails/' + uid;
  return this.http.post(url, payload);
}



  postGuest(payload: any): Observable<any> {
    let url = this.baseUrl + 'Guest/AddGuest';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  getGuestById(id: number): Observable<any> {
    let url = this.baseUrl + 'Guest/' + id;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateGuest(payload: any): Observable<any> {
    let url = this.baseUrl + 'Guest/UpdateGuest/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  postVisitor(payload: any): Observable<any> {
    let url = this.baseUrl + 'Visitor/AddVisitor';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  getVisitorById(id: number): Observable<any> {
    let url = this.baseUrl + 'Visitor/' + id;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  updateVisitor(payload: any): Observable<any> {
    let url = this.baseUrl + 'Visitor/UpdateVisitor/' + payload.id;
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  getAllServiceProviderOwners(id: string): Observable<any> {
    let url = this.baseUrl + 'ServiceProviderOwners/GetAllServiceProviderOwners/' + id;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  AddUPdateServiceProviderOwners(payload: any): Observable<any> {
    let url = this.baseUrl + 'ServiceProviderOwners/AddUPdateServiceProviderOwners';
    return this.http.post(url, payload).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }
  

  upload(file: any): Observable<any> {
    let url = this.baseUrl + 'Auth/upload';
    return this.http.post(url, file, {
      reportProgress: true,
      observe: 'events'
    }).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }

  uploadImage(selectedFile: any, idNumber: string) {
    const file = new File([selectedFile], idNumber, {
      type: 'image/jpeg'
    });

    const formData = new FormData();
    formData.append('file', file);

    this.upload(formData).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.Response && event.body.imageId) {
          console.log('Upload complete:', event.body);
        }
      },
      error: (err) => {
        console.error('Upload failed:', err);
      }
    });
  }

  getImage(idNumber: string): Observable<any> {
    let url = this.baseUrl + 'Auth/GetImage/' + idNumber;
    return this.http.get(url).pipe(map(res => {
      return res;
    }),
      catchError(this.handleError));
  }



  /* ============================================================
   DELETE APIs – COMMON DELETE METHODS FOR ALL MODULES
   ============================================================ */

/**
 * Delete Tenant by ID
 */
deleteTenant(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}Tenent/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Contractor by ID
 */
deleteContractor(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}Contractor/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Employee by ID
 */
deleteEmployee(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}Employee/DeleteEmployee/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Building by ID
 */
deleteBuilding(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}Building/DeleteID/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Amenities by ID
 */
deleteAmenities(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}Amenities/DeleteID/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Neighbourhood by ID
 */
deleteNeighbourhood(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}NRD/DeleteID/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Company by ID
 */
deleteCompany(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}Company/DeleteCompany/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Project by ID
 */
deleteProject(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}Project/DeleteProject/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Service Provider Owner by ID
 */
deleteServiceProviderOwner(id: number): Observable<any> {
  return this.http.delete(
    `${this.baseUrl}ServiceProviderOwners/DeleteServiceProviderOwner/${id}`
  ).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/* ============================================================
   ADDITIONAL DELETE APIs (MISSING ONES)
   ============================================================ */

/**
 * Delete Land Owner
 */
deleteLandOwner(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}Landowner/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Resident
 */
deleteResident(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}Resident/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Guest
 */
deleteGuest(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}Guest/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Visitor
 */
deleteVisitor(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}Visitor/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Service Provider
 */
deleteServiceProvider(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}Service_Provider/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Reader
 */
deleteReader(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}Reader/DeleteReader/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Reader Location
 */
deleteReaderLocation(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}ReaderLocation/DeleteID/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Profile
 */
deleteProfile(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}Profile/DeleteProfile/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete User
 */
deleteUser(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}UserRegistration/DeleteUser/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Contractor Type
 */
deleteContractorType(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}ContractorType/DeleteID/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Service Type
 */
deleteServiceType(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}ServiceType/DeleteServiceType/${id}`).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

/**
 * Delete Reader Relay by ID
 */
// deleteReaderRelay(id: number): Observable<any> {
//   const url = `${this.baseUrl}ReaderRelay/DeleteID/${id}`;
//   return this.http.delete(url).pipe(
//     map(res => res),
//     catchError(this.handleError)
//   );
// }


deleteReaderRelay(id: number): Observable<any> {
  const url = `${this.baseUrl}Reader/DeleteReader/${id}`;
  return this.http.delete(url).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

blockRevokeAccess(payload: {
  id: number;
  iDnumber: number;
  blockRevokType: 'B' | 'R';
  fromdate?: string;
  todate?: string;
}) {
  const url = `${this.baseUrl}AccessRights/AddUpdateAccessBlockRevoke/${payload.id}`;

  const body: any = {
    id: payload.id,
    iDnumber: payload.iDnumber,
    blockRevokType: payload.blockRevokType,
    fromdate: payload.fromdate ?? null,
    todate: payload.todate ?? null
  };

  return this.http.post(url, body, {
    headers: { 'Content-Type': 'application/json' }
  });
}



blockRevokeAccessCard(payload: any) {
  const url = `${this.baseUrl}AccessRights/AddUpdateAccessBlockRevoke`;
  
  return this.http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' }
  });
}

// path auth.service.ts
getCardBlockRevokeStatus() {
  const url = `${this.baseUrl}Report/CardAccessBlockInvokeRegister`;
  return this.http.get<any[]>(url);
}

getAuthorityModules(Name: string): Observable<any[]> {
 const url = `${this.baseUrl}Auth/GetAuthorityModules/${Name}`;

  return this.http.get<any[]>(url).pipe(
    map(res => res.filter(m => m.viewreadonly === false)),
    map(res =>
      res.map(m => ({
        moduleKey: m.moduleId,
        authorityLevel: m.authority
      }))
    )
  );
}
//services/auth.service.ts
getAllAuthorityModules(Name: string): Observable<any> {
 
  const url = `${this.baseUrl}Auth/GetAuthorityModules/${Name}`;
  return this.http.get(url).pipe(
    map((res: any) => res), // map the response directly
    catchError(this.handleError) // handle errors
  );
}



getNRDFlats(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}NRD/NRDFlats`);
}


//  authservice Add FlatNumber and IDNumber of selected Service Provider
postServiceProviderReferenceFlats(idNumber: string, flatNumber: string): Observable<any> {
  let url = this.baseUrl + 'ServiceProviderRefrenceFlats/Add';
  const payload = {
    idNumber: idNumber,
    flatNumber: flatNumber
  };
  return this.http.post(url, payload).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}
// Get all service provider reference flats
getServiceProviderReferenceFlatAll(): Observable<any> {
  let url = this.baseUrl + 'ServiceProviderRefrenceFlats/GetAll';
  return this.http.get(url).pipe(
    map(res => res),
    catchError(this.handleError)
  );
}

searchCardHolder(searchValue: string): Observable<any> {
    const url = `${this.baseUrl}Auth/CardHolderSearch/${searchValue}`;
    return this.http.get(url).pipe(
      map((res: any) => res),
      catchError(this.handleError)
    );
  }

  // ✏️ Add / Update Lost Damage
  addUpdateLostDamage(id: number, payload: any): Observable<any> {
    const url = `${this.baseUrl}CardLostDamageRegister/AddUpdateCardLostDamageRegister/${id}`;
    return this.http.post(url, payload).pipe(
      map((res: any) => res),
      catchError(this.handleError)
    );
  }


  getCardLostDamageRegister(): Observable<any> {
    const url = `${this.baseUrl}CardLostDamageRegister`;
    return this.http.get(url).pipe(
      map((res: any) => res),
      catchError(this.handleError)
    );    
  
  }





  // Get Module Names here we getting both filter true and false //aut.service.ts
  getModuleNameReport(): Observable<any> {
    const url = `${this.baseUrl}Profile/GetModuleNames/true`;
    return this.http.get(url).pipe(
      map((res: any) => res),
      catchError(this.handleError)
    );

  }
  
}
