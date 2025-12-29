// Landowner 

import { LandOwner, LandownerCommon, Resident, Tenant } from "../models/common.model";

// Function to map common fields
function mapCommonFields(payload: LandownerCommon) {
    return {
        "id": payload.id ,
        "csn": payload.csn || "",
        "idNumber": payload.idNumber,
        "tagNumber": payload.tagNumber || "",
        "paNnumber": payload.paNnumber,
        "passportNo": payload.passportNo,
        "licenseNo": payload.licenseNo,
        "icEno": payload.icEno,
        "aadharCardId": payload.aadharCardId,
        "voterID": payload.voterID,
        "firstName": payload.firstName,
        "middleName": payload.middleName,
        "lastName": payload.lastName,
        "shortName": payload.shortName || payload.firstName + " " + payload.lastName,
        "gender": payload.gender,
        "bloodGroup": payload.bloodGroup,
        "dob": payload.dob,
        "emailID": payload.emailID,
        "mobileNo": payload.mobileNo.toString(),
        "landLine": payload.landLine,
        "building": payload.building.toString(),
        "flatNumber": payload.flatNumber,
        "cardIssueDate": payload.cardIssueDate,
        "cardPrintingDate": payload.cardPrintingDate,
        "logicalDeleted": payload.logicalDeleted ? 1 : 0,
        "nrd": payload.nrd.toString(),

    };
}

// LandOwner Mapper
export function landownerMapper(payload: LandOwner) {
    const commonMapper = mapCommonFields(payload);
    return {
        ...commonMapper,
        "landOwnerIssueDate": payload.landOwnerIssueDate
    };
}

// Resident Mapper
export function residentMapper(payload: Resident) {
    const commonMapper = mapCommonFields(payload);
    return {
        ...commonMapper,
        "registrationIssueDate": payload.registrationIssueDate,
        "building": payload.building.toString(),
        "nrd": payload.nrd.toString()
        
    };
}

// Tenant Mapper
export function tenantMapper(payload: Tenant) {
    const commonMapper = mapCommonFields(payload);
    return {
        ...commonMapper,
        "rid": 0,
        "registrationIssueDate": payload.registrationIssueDate,
        "aggreement_From":  new Date(payload.aggreement_From),
        "aggreement_To": new Date(payload.aggreement_To),
        "tenentType": payload.tenentType,
    };
}

