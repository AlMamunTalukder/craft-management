
export type TAdmissionStatus = "pending" | "approved" | "rejected";

export interface TAdmissionApplication {
  applicationId: string;
  academicYear: string;
  _id: string;
  studentInfo: {
    nameBangla: string;
    nameEnglish: string;
    dateOfBirth: Date;
    age: number;
    gender?: "male" | "female" | "other";
    department: string;
    class: string;
    session: string;
    nidBirth?: string;
    bloodGroup?: string;
    nationality?: string;
    studentPhoto?: string;
  };
  academicInfo?: {
    previousSchool?: string;
    previousClass?: string;
    gpa?: string;
  };
  parentInfo: {
    father: {
      nameBangla: string;
      nameEnglish: string;
      profession?: string;
      education?: string;
      mobile: string;
      whatsapp?: string;
    };
    mother: {
      nameBangla: string;
      nameEnglish: string;
      profession?: string;
      education?: string;
      mobile?: string;
      whatsapp?: string;
    };
    guardian?: {
      nameBangla?: string;
      nameEnglish?: string;
      relation?: string;
      mobile?: string;
      whatsapp?: string;
      profession?: string;
      address?: string;
    };
  };
  address: {
    present: {
      village?: string;
      postOffice?: string;
      postCode?: string;
      policeStation?: string;
      district?: string;
    };
    permanent: {
      village: string;
      postOffice: string;
      postCode?: string;
      policeStation: string;
      district: string;
    };
  };
  termsAccepted: boolean;
  status: TAdmissionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Address {
  village?: string;
  postOffice?: string;
  postCode?: string;
  policeStation?: string;
  district?: string;
}

export interface PersonInfo {
  nameBangla?: string;
  nameEnglish?: string;
  profession?: string;
  education?: string;
  mobile?: string;
  whatsapp?: string;
  address?: string;
  relation?: string;
}

export interface StudentInfo {
  nameBangla?: string;
  nameEnglish?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  nationality?: string;
  nidBirth?: string;
  department?: string;
  class?: string;
  session?: string;
  studentPhoto?: string;
}

export interface AcademicInfo {
  previousSchool?: string;
  previousClass?: string;
  gpa?: string;
}

export interface FamilyEnvironment {
  halalIncome?: string;
  parentsPrayer?: string;
  addiction?: string;
  tv?: string;
  quranRecitation?: string;
  purdah?: string;
}

export interface BehaviorSkills {
  mobileUsage?: string;
  generalBehavior?: string;
  obedience?: string;
  elderBehavior?: string;
  youngerBehavior?: string;
  lyingStubbornness?: string;
  studyInterest?: string;
  religiousInterest?: string;
  angerControl?: string;
}

export interface Documents {
  photographs?: boolean;
  birthCertificate?: boolean;
  markSheet?: boolean;
  transferCertificate?: boolean;
  characterCertificate?: boolean;
}

export interface Application {
  applicationId?: string;
  _id?: string;
  status?: string;
  academicYear?: string;
  department?: string;
  class?: string;
  nameBangla?: string;
  nameEnglish?: string;
  mobile?: string;
  fatherMobile?: string;
  studentInfo?: StudentInfo;
  parentInfo?: {
    father?: PersonInfo;
    mother?: PersonInfo;
    guardian?: PersonInfo;
  };
  address?: {
    present?: Address;
    permanent?: Address;
  };
  academicInfo?: AcademicInfo;
  familyEnvironment?: FamilyEnvironment;
  behaviorSkills?: BehaviorSkills;
  documents?: Documents;
  termsAccepted?: boolean;
}

export interface AdmissionDetailModalProps {
  open: boolean;
  onClose: () => void;
  application: Application | null;
  loading?: boolean;
}

export interface ProcessedApplicationData {
  applicationId: string;
  _id?: string;
  status?: string;
  displayNameBangla?: string;
  displayNameEnglish?: string;
  displayDepartment?: string;
  displayClass?: string;
  displayMobile?: string;
  displayFatherMobile?: string;
  studentInfo: StudentInfo;
  academicInfo: AcademicInfo;
  familyEnvironment: FamilyEnvironment;
  behaviorSkills: BehaviorSkills;
  documents: Documents;
  termsAccepted: boolean;
  parents: {
    father: PersonInfo;
    mother: PersonInfo;
    guardian: PersonInfo;
  };
  addresses: {
    present: Address;
    permanent: Address;
  };
}