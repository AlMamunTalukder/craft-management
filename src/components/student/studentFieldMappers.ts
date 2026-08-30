/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Central Mappers - Single Source of Truth for ALL student data transformations
 * Used by: online-application/edit, StudentForm, EnrollmentForm, AdmissionDetailModal, StudentOverview
 *
 * Guarantees:
 * - ?? fallback chains preserve false/0 (important for documents)
 * - Handles string vs array className differences
 * - Handles name vs studentName vs StudentName legacy names
 * - Date normalization to YYYY-MM-DD
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const toDateInput = (val: any): string => {
  if (!val) return "";
  try {
    return new Date(val).toISOString().split("T")[0];
  } catch {
    return typeof val === "string" ? val.split("T")[0] : "";
  }
};

const normalizeClassToForm = (classData: any, classOptions?: any[]): any[] => {
  if (!classData) return [];
  // Already array of objects [{label,value}] - Student API
  if (Array.isArray(classData) && classData.length > 0 && typeof classData[0] === "object" && (classData[0].label || classData[0].className)) {
    return classData.map((c: any) => ({
      label: c.label || c.className || c.name || c,
      value: c.value || c._id || c,
    }));
  }
  // Array of strings or IDs
  if (Array.isArray(classData)) {
    return classData.map((c: any) => {
      const str = typeof c === "string" ? c : c?.className || c?.name || String(c);
      const matched = classOptions?.find((o: any) => o.label === str || o.value === str);
      return matched ? matched : { label: str, value: str };
    });
  }
  // Single string - Admission API (e.g. "One", "Hifz")
  if (typeof classData === "string") {
    const matched = classOptions?.find((o: any) => o.label === classData || o.value === classData);
    return matched ? [matched] : [{ label: classData, value: classData }];
  }
  // Single object
  if (typeof classData === "object" && classData.className) {
    return [{ label: classData.className, value: classData._id || classData.className }];
  }
  return [];
};

const classFormToPayload = (formClass: any): any => {
  if (!formClass) return [];
  if (Array.isArray(formClass)) return formClass.map((c: any) => c.value || c);
  return [formClass];
};

// ---------------------------------------------------------------------------
// 1. Admission API -> Unified Form Values (for edit & details)
// Used by: online-application/edit/page.tsx, EnrollmentForm transformApplicationToFormData, AdmissionDetailModal
// ---------------------------------------------------------------------------
export const admissionToFormValues = (data: any, classOptions?: any[]): Record<string, any> => {
  if (!data) return {};
  const d = data.data || data; // handle {data: {...}} wrapper or direct
  const s = d.studentInfo || {};
  const a = d.academicInfo || {};
  const p = d.parentInfo || {};
  const father = p.father || {};
  const mother = p.mother || {};
  const guardian = p.guardian || {};
  const addr = d.address || {};
  const present = addr.present || {};
  const permanent = addr.permanent || {};
  const family = d.familyEnvironment || {};
  const behavior = d.behaviorSkills || {};
  const docs = d.documents || {};

  return {
    // Personal - preserve both naming variants for backward compat
    studentNameBangla: s.nameBangla ?? "",
    studentName: s.nameEnglish ?? "",
    // Legacy aliases for old forms that read StudentName/studentName:
    StudentName: s.nameBangla ?? "",
    nameBangla: s.nameBangla ?? "",
    name: s.nameEnglish ?? "",
    gender: s.gender ?? "",
    dateOfBirth: toDateInput(s.dateOfBirth),
    birthDate: toDateInput(s.dateOfBirth),
    age: s.age?.toString() ?? "",
    Age: s.age?.toString() ?? "",
    nidBirth: s.nidBirth ?? "",
    birthRegistrationNo: s.nidBirth ?? "",
    bloodGroup: s.bloodGroup ?? "",
    nationality: s.nationality ?? "Bangladeshi",
    studentPhoto: s.studentPhoto ?? "",
    studentDepartment: s.department ?? "",
    studentDept: s.department ?? "",
    department: s.department ?? "",
    className: s.class ?? "", // for edit page (string)
    classNameArray: normalizeClassToForm(s.class, classOptions), // for new components
    session: s.session ?? d.academicYear ?? "",
    academicYear: d.academicYear ?? s.session ?? "",
    category: (d as any).category ?? s.category ?? "Residential",

    // Academic
    PrevSchool: a.previousSchool ?? "",
    previousInstitution: a.previousSchool ?? "",
    formerInstitution: a.previousSchool ?? "",
    PrevClass: a.previousClass ?? "",
    previousClass: a.previousClass ?? "",
    GPA: a.gpa ?? "",
    gpa: a.gpa ?? "",

    // Father
    FatherNameBangla: father.nameBangla ?? "",
    fatherNameBangla: father.nameBangla ?? "",
    FatherName: father.nameEnglish ?? "",
    fatherName: father.nameEnglish ?? "",
    FatherJob: father.profession ?? "",
    fatherProfession: father.profession ?? "",
    FatherEdu: father.education ?? "",
    fatherEducation: father.education ?? "",
    FatherMobile: father.mobile ?? "",
    fatherMobile: father.mobile ?? "",
    FatherWhatsapp: father.whatsapp ?? "",
    fatherWhatsapp: father.whatsapp ?? "",
    fatherNid: (father as any).nid ?? "",
    fatherIncome: (father as any).income ?? 0,

    // Mother
    MotherNameBangla: mother.nameBangla ?? "",
    motherNameBangla: mother.nameBangla ?? "",
    MotherName: mother.nameEnglish ?? "",
    motherName: mother.nameEnglish ?? "",
    MotherJob: mother.profession ?? "",
    motherProfession: mother.profession ?? "",
    MotherEdu: mother.education ?? "",
    motherEducation: mother.education ?? "",
    MotherMobile: mother.mobile ?? "",
    motherMobile: mother.mobile ?? "",
    MotherWhatsapp: mother.whatsapp ?? "",
    motherWhatsapp: mother.whatsapp ?? "",
    motherNid: (mother as any).nid ?? "",
    motherIncome: (mother as any).income ?? 0,

    // Guardian
    guardianNameBangla: guardian.nameBangla ?? "",
    guardianName: guardian.nameEnglish ?? "",
    guardianRelation: guardian.relation ?? "",
    guardianMobile: guardian.mobile ?? "",
    guardianWhatsapp: guardian.whatsapp ?? "",
    guardianJob: guardian.profession ?? "",
    guardianProfession: guardian.profession ?? "",
    guardianAddress: guardian.address ?? "",
    guardianVillage: guardian.address ?? "",

    // Present Address
    village: present.village ?? "",
    postOffice: present.postOffice ?? "",
    postCode: present.postCode ?? "",
    policeStation: present.policeStation ?? "",
    district: present.district ?? "",
    // aliases for StudentForm
    presentVillage: present.village ?? "",
    presentPostOffice: present.postOffice ?? "",
    presentPostCode: present.postCode ?? "",
    presentPoliceStation: present.policeStation ?? "",
    presentDistrict: present.district ?? "",

    // Permanent Address
    permVillage: permanent.village ?? "",
    permPostOffice: permanent.postOffice ?? "",
    permPostCode: permanent.postCode ?? "",
    permPoliceStation: permanent.policeStation ?? "",
    permDistrict: permanent.district ?? "",
    // aliases
    permanentVillage: permanent.village ?? "",
    permanentPostOffice: permanent.postOffice ?? "",
    permanentPostCode: permanent.postCode ?? "",
    permanentPoliceStation: permanent.policeStation ?? "",
    permanentDistrict: permanent.district ?? "",

    // Family Environment
    HalalIncome: family.halalIncome ?? "",
    halalIncome: family.halalIncome ?? "",
    ParentsPrayer: family.parentsPrayer ?? "",
    parentsPrayer: family.parentsPrayer ?? "",
    Addiction: family.addiction ?? "",
    addiction: family.addiction ?? "",
    TV: family.tv ?? "",
    tv: family.tv ?? "",
    QuranRecitation: family.quranRecitation ?? "",
    quranRecitation: family.quranRecitation ?? "",
    Purdah: family.purdah ?? "",
    purdah: family.purdah ?? "",

    // Behavior
    MobileUsage: behavior.mobileUsage ?? "",
    mobileUsage: behavior.mobileUsage ?? "",
    GeneralBehavior: behavior.generalBehavior ?? "",
    generalBehavior: behavior.generalBehavior ?? "",
    Obedience: behavior.obedience ?? "",
    obedience: behavior.obedience ?? "",
    ElderBehavior: behavior.elderBehavior ?? "",
    elderBehavior: behavior.elderBehavior ?? "",
    YoungerBehavior: behavior.youngerBehavior ?? "",
    youngerBehavior: behavior.youngerBehavior ?? "",
    LyingStubbornness: behavior.lyingStubbornness ?? "",
    lyingStubbornness: behavior.lyingStubbornness ?? "",
    StudyInterest: behavior.studyInterest ?? "",
    studyInterest: behavior.studyInterest ?? "",
    ReligiousInterest: behavior.religiousInterest ?? "",
    religiousInterest: behavior.religiousInterest ?? "",
    AngerControl: behavior.angerControl ?? "",
    angerControl: behavior.angerControl ?? "",

    // Documents - use ?? to preserve false
    photographs: docs.photographs ?? false,
    birthCertificate: docs.birthCertificate ?? false,
    markSheet: docs.markSheet ?? false,
    transferCertificate: docs.transferCertificate ?? false,
    characterCertificate: docs.characterCertificate ?? false,

    termsAccepted: d.termsAccepted ?? false,
    sameAsPermanent: false,

    // Pass through raw for details view
    _raw: d,
    _applicationId: d.applicationId ?? d._id ?? "",
    _status: d.status ?? "",
  };
};

// ---------------------------------------------------------------------------
// 2. Student API -> Unified Form Values (for StudentForm edit)
// ---------------------------------------------------------------------------
export const studentToFormValues = (data: any, classOptions?: any[]): Record<string, any> => {
  if (!data) return {};
  const s = data.data || data;
  const parentInfo = s.parentInfo || {};
  const father = parentInfo.father || {};
  const mother = parentInfo.mother || {};
  const guardian = parentInfo.guardian || {};
  const perm = s.permanentAddress || {};
  const present = s.presentAddress || {};
  const family = s.familyEnvironment || {};
  const behavior = s.behaviorSkills || {};
  const docs = s.documents || {};

  const mappedClasses = normalizeClassToForm(s.className, classOptions);
  const mappedSections = Array.isArray(s.section)
    ? s.section.map((sec: any) => ({ label: sec?.name || sec, value: sec?._id || sec }))
    : [];
  const mappedSessions = Array.isArray(s.activeSession)
    ? s.activeSession.map((ses: any) => ({ label: ses?.sessionName || ses, value: ses?._id || ses }))
    : [];

  return {
    // Personal - unified + aliases
    studentName: s.name ?? "",
    name: s.name ?? "",
    studentNameBangla: s.nameBangla ?? "",
    nameBangla: s.nameBangla ?? "",
    StudentName: s.nameBangla ?? "",
    studentPhoto: s.studentPhoto ?? "",
    gender: s.gender ?? "",
    dateOfBirth: toDateInput(s.birthDate),
    birthDate: toDateInput(s.birthDate),
    age: s.age?.toString() ?? "",
    nidBirth: s.birthRegistrationNo ?? s.nidBirth ?? "",
    birthRegistrationNo: s.birthRegistrationNo ?? "",
    bloodGroup: s.bloodGroup ?? "",
    nationality: s.nationality ?? "Bangladeshi",
    studentDepartment: s.studentDepartment ?? (s as any).department ?? "",
    studentDept: s.studentDepartment ?? "",
    category: s.category ?? (s as any).studentType ?? "Residential",
    mobileNo: s.mobile ?? "",
    mobile: s.mobile ?? "",
    email: s.email ?? "",
    smartIdCard: s.smartIdCard ?? "",
    session: s.session ?? s.academicYear ?? "",
    academicYear: s.academicYear ?? s.session ?? "",
    status: s.status ?? "",
    studentClassRoll: s.studentClassRoll ?? "",
    rollNumber: s.studentClassRoll ?? "",
    batch: s.batch ?? "",
    group: (s as any).batch ?? "",
    section: mappedSections,
    activeSession: mappedSessions,
    className: mappedClasses,
    classNameArray: mappedClasses,
    additionalNote: s.additionalNote ?? "",

    // Father
    fatherName: father.nameEnglish ?? father.nameBangla ?? "",
    FatherName: father.nameEnglish ?? "",
    FatherNameBangla: father.nameBangla ?? "",
    fatherNameBangla: father.nameBangla ?? "",
    fatherMobile: father.mobile ?? "",
    FatherMobile: father.mobile ?? "",
    fatherProfession: father.profession ?? "",
    FatherJob: father.profession ?? "",
    fatherEducation: father.education ?? "",
    FatherEdu: father.education ?? "",
    fatherWhatsapp: father.whatsapp ?? "",
    FatherWhatsapp: father.whatsapp ?? "",

    // Mother
    motherName: mother.nameEnglish ?? mother.nameBangla ?? "",
    MotherName: mother.nameEnglish ?? "",
    MotherNameBangla: mother.nameBangla ?? "",
    motherNameBangla: mother.nameBangla ?? "",
    motherMobile: mother.mobile ?? "",
    MotherMobile: mother.mobile ?? "",
    motherProfession: mother.profession ?? "",
    MotherJob: mother.profession ?? "",
    motherEducation: mother.education ?? "",
    MotherEdu: mother.education ?? "",
    motherWhatsapp: mother.whatsapp ?? "",
    MotherWhatsapp: mother.whatsapp ?? "",

    // Guardian
    guardianName: guardian.nameEnglish ?? guardian.nameBangla ?? "",
    guardianNameBangla: guardian.nameBangla ?? "",
    guardianMobile: guardian.mobile ?? "",
    guardianRelation: guardian.relation ?? "",
    guardianProfession: guardian.profession ?? "",
    guardianJob: guardian.profession ?? "",
    guardianAddress: guardian.address ?? "",
    guardianVillage: guardian.address ?? "",
    guardianWhatsapp: guardian.whatsapp ?? "",

    // Address
    village: present.village ?? "",
    presentVillage: present.village ?? "",
    postOffice: present.postOffice ?? "",
    presentPostOffice: present.postOffice ?? "",
    postCode: present.postCode ?? "",
    presentPostCode: present.postCode ?? "",
    policeStation: present.policeStation ?? "",
    presentPoliceStation: present.policeStation ?? "",
    district: present.district ?? "",
    presentDistrict: present.district ?? "",

    permVillage: perm.village ?? "",
    permanentVillage: perm.village ?? "",
    permPostOffice: perm.postOffice ?? "",
    permanentPostOffice: perm.postOffice ?? "",
    permPostCode: perm.postCode ?? "",
    permanentPostCode: perm.postCode ?? "",
    permPoliceStation: perm.policeStation ?? "",
    permanentPoliceStation: perm.policeStation ?? "",
    permDistrict: perm.district ?? "",
    permanentDistrict: perm.district ?? "",
    sameAsPermanent: s.sameAsPermanent ?? false,

    // Previous School
    previousInstitution: s.previousSchool?.institution ?? "",
    formerInstitution: s.previousSchool?.institution ?? "",
    PrevSchool: s.previousSchool?.institution ?? "",
    previousAddress: s.previousSchool?.address ?? "",
    formerVillage: s.previousSchool?.address ?? "",

    // Family
    halalIncome: family.halalIncome ?? "",
    HalalIncome: family.halalIncome ?? "",
    parentsPrayer: family.parentsPrayer ?? "",
    ParentsPrayer: family.parentsPrayer ?? "",
    addiction: family.addiction ?? "",
    Addiction: family.addiction ?? "",
    tv: family.tv ?? "",
    TV: family.tv ?? "",
    quranRecitation: family.quranRecitation ?? "",
    QuranRecitation: family.quranRecitation ?? "",
    purdah: family.purdah ?? "",
    Purdah: family.purdah ?? "",

    // Behavior
    mobileUsage: behavior.mobileUsage ?? "",
    MobileUsage: behavior.mobileUsage ?? "",
    generalBehavior: behavior.generalBehavior ?? "",
    GeneralBehavior: behavior.generalBehavior ?? "",
    obedience: behavior.obedience ?? "",
    Obedience: behavior.obedience ?? "",
    elderBehavior: behavior.elderBehavior ?? "",
    ElderBehavior: behavior.elderBehavior ?? "",
    youngerBehavior: behavior.youngerBehavior ?? "",
    YoungerBehavior: behavior.youngerBehavior ?? "",
    lyingStubbornness: behavior.lyingStubbornness ?? "",
    LyingStubbornness: behavior.lyingStubbornness ?? "",
    studyInterest: behavior.studyInterest ?? "",
    StudyInterest: behavior.studyInterest ?? "",
    religiousInterest: behavior.religiousInterest ?? "",
    ReligiousInterest: behavior.religiousInterest ?? "",
    angerControl: behavior.angerControl ?? "",
    AngerControl: behavior.angerControl ?? "",

    // Docs
    photographs: docs.photographs === true,
    birthCertificate: docs.birthCertificate === true,
    markSheet: docs.markSheet === true,
    transferCertificate: docs.transferCertificate === true,
    characterCertificate: docs.characterCertificate === true,
    termsAccepted: (s as any).termsAccepted ?? false,

    _raw: s,
  };
};

// ---------------------------------------------------------------------------
// 3. Unified Form -> Admission API Payload (for update)
// Mirrors online-application/edit/page.tsx handleSubmit
// ---------------------------------------------------------------------------
export const formToAdmissionPayload = (formData: any) => {
  const isSame = (formData as any).sameAsPermanent ?? false;
  const present = {
    village: formData.village ?? formData.presentVillage ?? "",
    postOffice: formData.postOffice ?? formData.presentPostOffice ?? "",
    postCode: formData.postCode ?? formData.presentPostCode ?? "",
    policeStation: formData.policeStation ?? formData.presentPoliceStation ?? "",
    district: formData.district ?? formData.presentDistrict ?? "",
  };
  let permanent: any = {
    village: formData.permVillage ?? formData.permanentVillage ?? "",
    postOffice: formData.permPostOffice ?? formData.permanentPostOffice ?? "",
    postCode: formData.permPostCode ?? formData.permanentPostCode ?? "",
    policeStation: formData.permPoliceStation ?? formData.permanentPoliceStation ?? "",
    district: formData.permDistrict ?? formData.permanentDistrict ?? "",
  };
  if (isSame) permanent = { ...present };
  return {
    academicYear: formData.session ?? formData.academicYear ?? "",
    termsAccepted: formData.termsAccepted ?? false,
    category: formData.category ?? "Residential",
  studentInfo: {
    nameBangla: formData.studentNameBangla ?? formData.StudentName ?? formData.nameBangla ?? "",
    nameEnglish: formData.studentName ?? formData.name ?? "",
    dateOfBirth: formData.dateOfBirth ?? formData.birthDate ?? "",
    age: Number(formData.age ?? formData.Age ?? 0),
    gender: formData.gender ?? "",
    department: formData.studentDepartment ?? formData.studentDept ?? "",
    class: Array.isArray(formData.className) ? (formData.className[0]?.value || formData.className[0] || formData.className) : (formData.className ?? ""),
    session: formData.session ?? "",
    nidBirth: formData.nidBirth ?? formData.birthRegistrationNo ?? "",
    bloodGroup: formData.bloodGroup ?? "",
    nationality: formData.nationality ?? "Bangladeshi",
    studentPhoto: formData.studentPhoto ?? "",
  },
  academicInfo: {
    previousSchool: formData.previousInstitution ?? formData.PrevSchool ?? "",
    previousClass: formData.previousClass ?? formData.PrevClass ?? "",
    gpa: formData.gpa ?? formData.GPA ?? "",
  },
  parentInfo: {
    father: {
      nameBangla: formData.fatherNameBangla ?? formData.FatherNameBangla ?? "",
      nameEnglish: formData.fatherName ?? formData.FatherName ?? "",
      profession: formData.fatherProfession ?? formData.FatherJob ?? "",
      education: formData.fatherEducation ?? formData.FatherEdu ?? "",
      mobile: formData.fatherMobile ?? formData.FatherMobile ?? "",
      whatsapp: formData.fatherWhatsapp ?? formData.FatherWhatsapp ?? "",
    },
    mother: {
      nameBangla: formData.motherNameBangla ?? formData.MotherNameBangla ?? "",
      nameEnglish: formData.motherName ?? formData.MotherName ?? "",
      profession: formData.motherProfession ?? formData.MotherJob ?? "",
      education: formData.motherEducation ?? formData.MotherEdu ?? "",
      mobile: formData.motherMobile ?? formData.MotherMobile ?? "",
      whatsapp: formData.motherWhatsapp ?? formData.MotherWhatsapp ?? "",
    },
    guardian: {
      nameBangla: formData.guardianNameBangla ?? "",
      nameEnglish: formData.guardianName ?? "",
      relation: formData.guardianRelation ?? "",
      mobile: formData.guardianMobile ?? "",
      whatsapp: formData.guardianWhatsapp ?? "",
      profession: formData.guardianProfession ?? formData.guardianJob ?? "",
      address: formData.guardianAddress ?? formData.guardianVillage ?? "",
    },
  },
  address: {
    present,
    permanent,
  },
  familyEnvironment: {
    halalIncome: formData.halalIncome ?? formData.HalalIncome ?? "",
    parentsPrayer: formData.parentsPrayer ?? formData.ParentsPrayer ?? "",
    addiction: formData.addiction ?? formData.Addiction ?? "",
    tv: formData.tv ?? formData.TV ?? "",
    quranRecitation: formData.quranRecitation ?? formData.QuranRecitation ?? "",
    purdah: formData.purdah ?? formData.Purdah ?? "",
  },
  behaviorSkills: {
    mobileUsage: formData.mobileUsage ?? formData.MobileUsage ?? "",
    generalBehavior: formData.generalBehavior ?? formData.GeneralBehavior ?? "",
    obedience: formData.obedience ?? formData.Obedience ?? "",
    elderBehavior: formData.elderBehavior ?? formData.ElderBehavior ?? "",
    youngerBehavior: formData.youngerBehavior ?? formData.YoungerBehavior ?? "",
    lyingStubbornness: formData.lyingStubbornness ?? formData.LyingStubbornness ?? "",
    studyInterest: formData.studyInterest ?? formData.StudyInterest ?? "",
    religiousInterest: formData.religiousInterest ?? formData.ReligiousInterest ?? "",
    angerControl: formData.angerControl ?? formData.AngerControl ?? "",
  },
  documents: {
    photographs: formData.photographs ?? false,
    birthCertificate: formData.birthCertificate ?? false,
    markSheet: formData.markSheet ?? false,
    transferCertificate: formData.transferCertificate ?? false,
    characterCertificate: formData.characterCertificate ?? false,
  },
  };
};

// ---------------------------------------------------------------------------
// 4. Unified Form -> Student API Payload (for create/update)
// Mirrors StudentForm.tsx handleSubmit submissionData
// ---------------------------------------------------------------------------
export const formToStudentPayload = (formData: any, sameAsPermanent?: boolean) => {
  const isSame = sameAsPermanent ?? formData.sameAsPermanent ?? false;
  const present = {
    village: formData.village ?? formData.presentVillage ?? "",
    postOffice: formData.postOffice ?? formData.presentPostOffice ?? "",
    postCode: formData.postCode ?? formData.presentPostCode ?? "",
    policeStation: formData.policeStation ?? formData.presentPoliceStation ?? "",
    district: formData.district ?? formData.presentDistrict ?? "",
  };
  let perm = {
    village: formData.permVillage ?? formData.permanentVillage ?? "",
    postOffice: formData.permPostOffice ?? formData.permanentPostOffice ?? "",
    postCode: formData.permPostCode ?? formData.permanentPostCode ?? "",
    policeStation: formData.permPoliceStation ?? formData.permanentPoliceStation ?? "",
    district: formData.permDistrict ?? formData.permanentDistrict ?? "",
  };
  // Present is first (user-friendly), so Same as Present => perm = present
  if (isSame) perm = { ...present };

  return {
    name: formData.studentName ?? formData.name ?? "",
    nameBangla: formData.studentNameBangla ?? formData.nameBangla ?? "",
    smartIdCard: formData.smartIdCard ?? "",
    email: formData.email ?? "",
    studentDepartment: formData.studentDepartment ?? formData.studentDept ?? "",
    mobile: formData.mobileNo ?? formData.mobile ?? "",
    birthDate: formData.dateOfBirth ?? formData.birthDate ?? "",
    birthRegistrationNo: formData.nidBirth ?? formData.birthRegistrationNo ?? "",
    bloodGroup: formData.bloodGroup ?? "",
    gender: formData.gender ?? "",
    nationality: formData.nationality ?? "Bangladeshi",
    studentPhoto: formData.studentPhoto ?? "",
    parentInfo: {
      father: {
        nameEnglish: formData.fatherName ?? "",
        mobile: formData.fatherMobile ?? "",
        profession: formData.fatherProfession ?? "",
        education: formData.fatherEducation ?? "",
        whatsapp: formData.fatherWhatsapp ?? "",
      },
      mother: {
        nameEnglish: formData.motherName ?? "",
        mobile: formData.motherMobile ?? "",
        profession: formData.motherProfession ?? "",
        education: formData.motherEducation ?? "",
        whatsapp: formData.motherWhatsapp ?? "",
      },
      guardian: {
        nameEnglish: formData.guardianName ?? "",
        mobile: formData.guardianMobile ?? "",
        relation: formData.guardianRelation ?? "",
        profession: formData.guardianProfession ?? "",
        address: formData.guardianAddress ?? formData.guardianVillage ?? "",
        whatsapp: formData.guardianWhatsapp ?? "",
      },
    },
    permanentAddress: perm,
    presentAddress: present,
    sameAsPermanent: isSame,
    className: classFormToPayload(formData.className ?? formData.classNameArray),
    studentClassRoll: formData.rollNumber ?? formData.studentClassRoll ?? "",
    batch: formData.batch ?? "",
    section: classFormToPayload(formData.section),
    activeSession: classFormToPayload(formData.activeSession),
    status: formData.status ?? "",
    category: formData.category ?? "",
    academicYear: formData.academicYear ?? "",
    session: formData.session ?? "",
    additionalNote: formData.additionalNote ?? "",
    behaviorSkills: {
      generalBehavior: formData.generalBehavior ?? "",
      elderBehavior: formData.elderBehavior ?? "",
      youngerBehavior: formData.youngerBehavior ?? "",
      obedience: formData.obedience ?? "",
      angerControl: formData.angerControl ?? "",
      lyingStubbornness: formData.lyingStubbornness ?? "",
      studyInterest: formData.studyInterest ?? "",
      religiousInterest: formData.religiousInterest ?? "",
      mobileUsage: formData.mobileUsage ?? "",
    },
    familyEnvironment: {
      parentsPrayer: formData.parentsPrayer ?? "",
      purdah: formData.purdah ?? "",
      quranRecitation: formData.quranRecitation ?? "",
      halalIncome: formData.halalIncome ?? "",
      addiction: formData.addiction ?? "",
      tv: formData.tv ?? "",
    },
    previousSchool: {
      institution: formData.previousInstitution ?? formData.formerInstitution ?? "",
      address: formData.previousAddress ?? formData.formerVillage ?? "",
    },
    documents: {
      birthCertificate: formData.birthCertificate ?? false,
      transferCertificate: formData.transferCertificate ?? false,
      markSheet: formData.markSheet ?? false,
      characterCertificate: formData.characterCertificate ?? false,
      photographs: formData.photographs ?? false,
    },
  };
};

// ---------------------------------------------------------------------------
// 5. Enrollment API -> Form (re-uses admission logic) & Form -> Enrollment
// Enrollment shares same shape as Student but with extra enrollment fields
// ---------------------------------------------------------------------------
export const enrollmentToFormValues = (data: any, classOptions?: any[]) => {
  if (!data) return {};
  // Enrollment may be wrapped as {data: {...}} or direct
  const raw = data.data || data;
  // Try studentToFormValues first (enrollment contains student-like fields)
  const base = studentToFormValues(raw, classOptions);
  // Overlay enrollment-specific overrides
  const admissionFallback = raw.admissionApplication || raw.application || null;
  if (admissionFallback) {
    const adm = admissionToFormValues(admissionFallback, classOptions);
    // Fill missing base fields from admission
    Object.keys(adm).forEach((k) => {
      if (!base[k] && adm[k]) base[k] = adm[k];
    });
  }
  // Enrollment extra fields
  base.rollNumber = raw.rollNumber ?? raw.roll ?? base.rollNumber ?? "";
  base.section = raw.section ?? base.section ?? "";
  base.group = raw.group ?? base.group ?? "";
  base.shift = raw.shift ?? base.shift ?? "";
  base.optionalSubject = raw.optionalSubject ?? "";
  base.admissionType = raw.admissionType ?? "";
  base._raw = raw;
  return base;
};

export const formToEnrollmentPayload = (formData: any) => {
  const studentPayload = formToStudentPayload(formData);
  return {
    ...studentPayload,
    rollNumber: formData.rollNumber ?? "",
    section: typeof formData.section === "string" ? formData.section : formData.section?.[0]?.value || formData.section || "",
    group: formData.group ?? "",
    optionalSubject: formData.optionalSubject ?? "",
    shift: formData.shift ?? "",
    admissionType: formData.admissionType ?? "",
  };
};
