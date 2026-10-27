export interface ApplicantData {
  serviceUnit: string;
  name: string;
  jobTitle: string;
  phone: string;
  gender: string;
  idNumber: string;
  birthday: string;
  maritalStatus: 'married' | 'single' | '';
  censusAddress: string;
  mailingAddress: string;
}

export interface SpouseData {
  name: string;
  idNumber: string;
  birthday: string;
  occupation: string;
}

export interface FamilyMember {
  relationship: string;
  name: string;
  birthday: string;
  occupation: string;
}

export interface ServiceYears {
  years: number;
  months: number;
  startDate: string;
}

export interface SelfOwnedProperty {
  owner: string;
  address: string;
}

export interface FormData {
  applicant: ApplicantData;
  spouse: SpouseData;
  familyMembers: FamilyMember[];
  serviceYears: ServiceYears;
  baseSalary: number;
  isBothSpousesInAcademia: boolean;
  selfOwnedProperties: SelfOwnedProperty[];
  previousBorrowCount: number;
  hasSelfOwnedProperty: boolean;
  agreementChecked: boolean;
}

export interface PointBreakdown {
  serviceYears: number;
  jobLevel: number;
  dependents: number;
  totalA: number;
  propertyDeduction: number;
  borrowDeduction: number;
  totalB: number;
  totalC: number;
}

export const initialFormData: FormData = {
  applicant: {
    serviceUnit: '',
    name: '',
    jobTitle: '',
    phone: '',
    gender: '',
    idNumber: '',
    birthday: '',
    maritalStatus: '',
    censusAddress: '',
    mailingAddress: '',
  },
  spouse: {
    name: '',
    idNumber: '',
    birthday: '',
    occupation: '',
  },
  familyMembers: [],
  serviceYears: {
    years: 0,
    months: 0,
    startDate: '',
  },
  baseSalary: 0,
  isBothSpousesInAcademia: false,
  selfOwnedProperties: [],
  previousBorrowCount: 0,
  hasSelfOwnedProperty: false,
  agreementChecked: false,
};
