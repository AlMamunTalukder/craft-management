/**
 * Field-Name Map Table - Single Source of Truth
 * Admission API <-> Student API <-> Enrollment API <-> Unified Form
 *
 * Purpose: Prevent data loss when unifying 5 forms + 2 detail views.
 * All mappers in studentFieldMappers.ts use this table as reference.
 *
 * Data sources audited:
 * - src/interface/admission.ts (Admission API)
 * - src/app/(dashboardLayout)/dashboard/student/_components/StudentForm.tsx (Student API)
 * - src/app/(dashboardLayout)/dashboard/enrollments/__components/EnrollmentForm.tsx (Enrollment API)
 * - src/app/(dashboardLayout)/dashboard/online-application/edit/page.tsx (Admission Edit Form)
 */

// =============================================================================
// CANONICAL UNIFIED FORM FIELD NAMES (used in new shared components)
// =============================================================================
// These names are the single source - all mappers convert TO/FROM these.

export const CANONICAL_FIELDS = {
  // Personal
  studentNameBangla: "studentNameBangla", // Bangla name
  studentName: "studentName", // English name
  gender: "gender",
  dateOfBirth: "dateOfBirth", // YYYY-MM-DD
  age: "age",
  nationality: "nationality",
  nidBirth: "nidBirth", // NID/Birth cert
  bloodGroup: "bloodGroup",
  studentPhoto: "studentPhoto",
  studentDepartment: "studentDepartment", // hifz|academic
  category: "category", // Residential etc.
  mobileNo: "mobileNo", // student mobile (admission has none, enrollment has mobileNo, student has mobile)

  // Address - Present
  village: "village",
  postOffice: "postOffice",
  postCode: "postCode",
  policeStation: "policeStation",
  district: "district",
  // Address - Permanent
  permVillage: "permVillage",
  permPostOffice: "permPostOffice",
  permPostCode: "permPostCode",
  permPoliceStation: "permPoliceStation",
  permDistrict: "permDistrict",
  sameAsPermanent: "sameAsPermanent",

  // Academic
  className: "className", // Array<{label,value}> for Student, string for Admission
  rollNumber: "rollNumber", // or studentClassRoll
  batch: "batch",
  section: "section",
  group: "group",
  shift: "shift",
  optionalSubject: "optionalSubject",
  session: "session", // e.g. 2024-2025
  academicYear: "academicYear",
  status: "status",
  previousInstitution: "previousInstitution", // PrevSchool
  previousAddress: "previousAddress",
  previousClass: "previousClass", // PrevClass
  gpa: "gpa", // GPA

  // Parent - Father
  fatherName: "fatherName",
  fatherNameBangla: "fatherNameBangla",
  fatherMobile: "fatherMobile",
  fatherWhatsapp: "fatherWhatsapp",
  fatherProfession: "fatherProfession",
  fatherEducation: "fatherEducation",
  fatherNid: "fatherNid",
  fatherIncome: "fatherIncome",

  // Parent - Mother
  motherName: "motherName",
  motherNameBangla: "motherNameBangla",
  motherMobile: "motherMobile",
  motherWhatsapp: "motherWhatsapp",
  motherProfession: "motherProfession",
  motherEducation: "motherEducation",
  motherNid: "motherNid",
  motherIncome: "motherIncome",

  // Guardian
  guardianName: "guardianName",
  guardianNameBangla: "guardianNameBangla",
  guardianRelation: "guardianRelation",
  guardianMobile: "guardianMobile",
  guardianWhatsapp: "guardianWhatsapp",
  guardianProfession: "guardianProfession",
  guardianAddress: "guardianAddress", // or guardianVillage

  // Family Environment
  halalIncome: "halalIncome",
  parentsPrayer: "parentsPrayer",
  addiction: "addiction",
  tv: "tv",
  quranRecitation: "quranRecitation",
  purdah: "purdah",

  // Behavior Skills
  mobileUsage: "mobileUsage",
  generalBehavior: "generalBehavior",
  obedience: "obedience",
  elderBehavior: "elderBehavior",
  youngerBehavior: "youngerBehavior",
  lyingStubbornness: "lyingStubbornness",
  studyInterest: "studyInterest",
  religiousInterest: "religiousInterest",
  angerControl: "angerControl",

  // Documents
  photographs: "photographs",
  birthCertificate: "birthCertificate",
  markSheet: "markSheet",
  transferCertificate: "transferCertificate",
  characterCertificate: "characterCertificate",
  termsAccepted: "termsAccepted",
} as const;

// =============================================================================
// FULL CROSS-REFERENCE TABLE
// =============================================================================
// Each row: canonical -> where it lives in each API/Form
// Use `??` fallback chains in mappers to handle legacy names.

export const FIELD_CROSS_REF: Array<{
  canonical: string;
  admissionApi: string; // path in admission API object
  admissionForm: string; // name in online-application/edit/page.tsx
  studentApi: string; // path in student API object
  studentForm: string; // name in StudentForm.tsx
  enrollmentApi: string; // path in enrollment API
  enrollmentForm: string; // name in EnrollmentForm.tsx
  notes?: string;
}> = [
  // Personal
  { canonical: "studentNameBangla", admissionApi: "studentInfo.nameBangla", admissionForm: "StudentName", studentApi: "nameBangla", studentForm: "nameBangla", enrollmentApi: "studentInfo.nameBangla / nameBangla", enrollmentForm: "studentNameBangla", notes: "Edit uses StudentName (Bangla), StudentForm uses nameBangla" },
  { canonical: "studentName", admissionApi: "studentInfo.nameEnglish", admissionForm: "studentName", studentApi: "name", studentForm: "name", enrollmentApi: "studentInfo.nameEnglish / studentName", enrollmentForm: "studentName", notes: "StudentForm uses 'name' for English" },
  { canonical: "gender", admissionApi: "studentInfo.gender", admissionForm: "gender", studentApi: "gender", studentForm: "gender", enrollmentApi: "gender", enrollmentForm: "gender", notes: "" },
  { canonical: "dateOfBirth", admissionApi: "studentInfo.dateOfBirth", admissionForm: "dateOfBirth", studentApi: "birthDate", studentForm: "birthDate", enrollmentApi: "birthDate", enrollmentForm: "dateOfBirth", notes: "Student birthDate vs dateOfBirth" },
  { canonical: "age", admissionApi: "studentInfo.age", admissionForm: "Age", studentApi: "age", studentForm: "age (computed)", enrollmentApi: "age", enrollmentForm: "age", notes: "Edit has disabled Age field" },
  { canonical: "nidBirth", admissionApi: "studentInfo.nidBirth", admissionForm: "nidBirth", studentApi: "birthRegistrationNo", studentForm: "birthRegistrationNo", enrollmentApi: "birthRegistrationNo / nidBirth", enrollmentForm: "nidBirth", notes: "" },
  { canonical: "bloodGroup", admissionApi: "studentInfo.bloodGroup", admissionForm: "bloodGroup", studentApi: "bloodGroup", studentForm: "bloodGroup", enrollmentApi: "bloodGroup", enrollmentForm: "bloodGroup", notes: "" },
  { canonical: "nationality", admissionApi: "studentInfo.nationality", admissionForm: "nationality", studentApi: "nationality", studentForm: "nationality", enrollmentApi: "nationality", enrollmentForm: "nationality", notes: "default Bangladeshi" },
  { canonical: "studentPhoto", admissionApi: "studentInfo.studentPhoto", admissionForm: "studentPhoto", studentApi: "studentPhoto", studentForm: "studentPhoto", enrollmentApi: "studentPhoto", enrollmentForm: "studentPhoto", notes: "" },
  { canonical: "studentDepartment", admissionApi: "studentInfo.department", admissionForm: "studentDept", studentApi: "studentDepartment", studentForm: "studentDepartment", enrollmentApi: "studentDepartment", enrollmentForm: "studentDepartment", notes: "Edit uses studentDept" },
  { canonical: "category", admissionApi: "category", admissionForm: "category", studentApi: "category / studentType", studentForm: "category", enrollmentApi: "category", enrollmentForm: "category", notes: "Student has both category & studentType" },
  { canonical: "mobileNo", admissionApi: "parentInfo.father.mobile (no student mobile)", admissionForm: "N/A (uses FatherMobile)", studentApi: "mobile", studentForm: "mobile", enrollmentApi: "mobileNo", enrollmentForm: "mobileNo", notes: "Admission has no direct student mobile" },
  { canonical: "session", admissionApi: "studentInfo.session / academicYear", admissionForm: "session", studentApi: "session", studentForm: "session", enrollmentApi: "session", enrollmentForm: "session", notes: "" },

  // Address Present
  { canonical: "village", admissionApi: "address.present.village", admissionForm: "village", studentApi: "presentAddress.village", studentForm: "presentVillage", enrollmentApi: "presentAddress.village", enrollmentForm: "village", notes: "StudentForm swaps names: presentVillage vs village" },
  { canonical: "postOffice", admissionApi: "address.present.postOffice", admissionForm: "postOffice", studentApi: "presentAddress.postOffice", studentForm: "presentPostOffice", enrollmentApi: "presentAddress.postOffice", enrollmentForm: "postOffice", notes: "" },
  { canonical: "postCode", admissionApi: "address.present.postCode", admissionForm: "postCode", studentApi: "presentAddress.postCode", studentForm: "presentPostCode", enrollmentApi: "presentAddress.postCode", enrollmentForm: "postCode", notes: "" },
  { canonical: "policeStation", admissionApi: "address.present.policeStation", admissionForm: "policeStation", studentApi: "presentAddress.policeStation", studentForm: "presentPoliceStation", enrollmentApi: "presentAddress.policeStation", enrollmentForm: "policeStation", notes: "" },
  { canonical: "district", admissionApi: "address.present.district", admissionForm: "district", studentApi: "presentAddress.district", studentForm: "presentDistrict", enrollmentApi: "presentAddress.district", enrollmentForm: "district", notes: "" },

  // Address Permanent
  { canonical: "permVillage", admissionApi: "address.permanent.village", admissionForm: "permVillage", studentApi: "permanentAddress.village", studentForm: "permanentVillage", enrollmentApi: "permanentAddress.village", enrollmentForm: "permVillage", notes: "" },
  { canonical: "permPostOffice", admissionApi: "address.permanent.postOffice", admissionForm: "permPostOffice", studentApi: "permanentAddress.postOffice", studentForm: "permanentPostOffice", enrollmentApi: "permanentAddress.postOffice", enrollmentForm: "permPostOffice", notes: "" },
  { canonical: "permPostCode", admissionApi: "address.permanent.postCode", admissionForm: "permPostCode", studentApi: "permanentAddress.postCode", studentForm: "permanentPostCode", enrollmentApi: "permanentAddress.postCode", enrollmentForm: "permPostCode", notes: "" },
  { canonical: "permPoliceStation", admissionApi: "address.permanent.policeStation", admissionForm: "permPoliceStation", studentApi: "permanentAddress.policeStation", studentForm: "permanentPoliceStation", enrollmentApi: "permanentAddress.policeStation", enrollmentForm: "permPoliceStation", notes: "" },
  { canonical: "permDistrict", admissionApi: "address.permanent.district", admissionForm: "permDistrict", studentApi: "permanentAddress.district", studentForm: "permanentDistrict", enrollmentApi: "permanentAddress.district", enrollmentForm: "permDistrict", notes: "" },

  // Academic
  { canonical: "className", admissionApi: "studentInfo.class (string)", admissionForm: "className (string via dept)", studentApi: "className[] ({label,value})", studentForm: "className[]", enrollmentApi: "className[]", enrollmentForm: "className[]", notes: "CRITICAL: string vs array - mapper normalizes" },
  { canonical: "rollNumber", admissionApi: "N/A", admissionForm: "N/A", studentApi: "studentClassRoll", studentForm: "studentClassRoll", enrollmentApi: "rollNumber / roll", enrollmentForm: "rollNumber", notes: "" },
  { canonical: "section", admissionApi: "N/A", admissionForm: "N/A", studentApi: "section[]", studentForm: "section[]", enrollmentApi: "section (string)", enrollmentForm: "section", notes: "Student array, Enrollment string" },
  { canonical: "previousInstitution", admissionApi: "academicInfo.previousSchool", admissionForm: "PrevSchool", studentApi: "previousSchool.institution", studentForm: "previousInstitution", enrollmentApi: "previousSchool.institution", enrollmentForm: "formerInstitution", notes: "" },
  { canonical: "previousClass", admissionApi: "academicInfo.previousClass", admissionForm: "PrevClass", studentApi: "N/A", studentForm: "N/A", enrollmentApi: "N/A", enrollmentForm: "N/A", notes: "Only in admission" },
  { canonical: "gpa", admissionApi: "academicInfo.gpa", admissionForm: "GPA", studentApi: "N/A", studentForm: "N/A", enrollmentApi: "N/A", enrollmentForm: "N/A", notes: "Only in admission" },

  // Parent Father
  { canonical: "fatherName", admissionApi: "parentInfo.father.nameEnglish", admissionForm: "FatherName", studentApi: "parentInfo.father.nameEnglish", studentForm: "fatherName", enrollmentApi: "parentInfo.father.nameEnglish / fatherName", enrollmentForm: "fatherName", notes: "" },
  { canonical: "fatherNameBangla", admissionApi: "parentInfo.father.nameBangla", admissionForm: "FatherNameBangla", studentApi: "parentInfo.father.nameBangla (fallback)", studentForm: "fatherName (uses English only)", enrollmentApi: "fatherNameBangla", enrollmentForm: "fatherNameBangla", notes: "StudentForm only has fatherName (English)" },
  { canonical: "fatherMobile", admissionApi: "parentInfo.father.mobile", admissionForm: "FatherMobile", studentApi: "parentInfo.father.mobile", studentForm: "fatherMobile", enrollmentApi: "fatherMobile", enrollmentForm: "fatherMobile", notes: "" },
  { canonical: "fatherProfession", admissionApi: "parentInfo.father.profession", admissionForm: "FatherJob", studentApi: "parentInfo.father.profession", studentForm: "fatherProfession", enrollmentApi: "fatherProfession", enrollmentForm: "fatherProfession", notes: "Edit uses FatherJob" },

  // FamilyEnv / Behavior / Docs share same names across all - direct mapping
];

// Quick lookup for debugging
export const getFieldMapping = (canonical: string) => FIELD_CROSS_REF.find((r) => r.canonical === canonical);
