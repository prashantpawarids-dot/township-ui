// Landowner 


// Function to map common fields
function mapCommonFields(payload: any) {
    return {
        "id": payload.id,
        "csn": payload.csn,
        "idNumber": payload.idNumber,
        "tagNumber": payload.tagNumber,
        "paNnumber": payload.paNnumber,
        "passportNo": payload.passportNo,
        "licenseNo": payload.licenseNo,
        "icEno": payload.icEno,
        "aadharCardId": payload.aadharCardId,
        "voterID": payload.voterID,
        "firstName": payload.firstName,
        "middleName": payload.middleName,
        "lastName": payload.lastName,
        "shortName": payload.shortName,
        "gender": payload.gender,
        "bloodGroup": payload.bloodGroup,
        "dob": payload.dob,
        "emailID": payload.emailID,
        "mobileNo": payload.mobileNo,
        "landLine": payload.landLine,
        "building": payload.building,
        "flatNumber": payload.flatNumber,
        "cardIssueDate": payload.cardIssueDate,
        "cardPrintingDate": payload.cardPrintingDate,
        "logicalDeleted": payload.logicalDeleted,
        "nrd": payload.nrd,
        "buildingName": payload.buildingName,
        "nrdName": payload.nrdName,
"ContractorTypeName":payload.ContractorTypeName,
    };
}

// Function to map employee fields

function mapEmployeeFields(payload: any){
    return {
        "id": payload.id,
        "csn": payload.csn,
        "idNumber": payload.idNumber,
        "tagNumber": payload.tagNumber,
        "firstName": payload.firstName,
        "middleName": payload.middleName,
        "lastName": payload.lastName,
        "gender": payload.gender,
        "bloodGroup": payload.bloodGroup,
        "dob": payload.dob,
        "doj" : payload.doj,
        "isResident" : payload.isResident,
        "deparment" : payload.deparment,
        "role" :payload.role,
        "residentSrNo" : payload.residentSrNo,
        "mobileNo": payload.mobileNo,
        "alternateMobileNo": payload.alternateMobileNo,
        "cardIssueDate": payload.cardIssueDate,
        "cardPrintingDate": payload.cardPrintingDate,
        "logicalDeleted": payload.logicalDeleted,
    

    };
}

// Employee Mapper

export function employeeMapperGet(payload: any){
    const commonMapper = mapEmployeeFields(payload);
    return{
        ...commonMapper,
        "employeeIssueDate": payload.employeeIssueDate
    };
}
// LandOwner Mapper
export function landownerMapperGet(payload: any) {
    const commonMapper = mapCommonFields(payload);
    return {
        ...commonMapper,
        "landOwnerIssueDate": payload.landOwnerIssueDate
    };
}

// Resident Mapper
export function residentMapperGet(payload: any) {
    const commonMapper = mapCommonFields(payload);
    return {
        ...commonMapper,
        "registrationIssueDate": payload.registrationIssueDate
    };
}

// Tenant Mapper
export function tenantMapperGet(payload: any) {
    const commonMapper = mapCommonFields(payload);
    return {
        ...commonMapper,
        "registrationIssueDate": payload.registrationIssueDate,
        "aggreement_From": payload.agreeFrom,
        "aggreement_To": payload.agreeTo,
        "tenantType": payload.tenantType,
    };
}

    // contractorMapperGet Mapper Added by Nana baviskar
export function contractorMapperGet(payload: any) {
    const commonMapper = mapCommonFields(payload);
    return {
        ...commonMapper,
        "contractortypename": payload.ContractorTypeName,
        "Agency": payload.Agency, 
    }; 
}

