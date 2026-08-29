import { STUDENT_CATEGORIES } from "@/constant/studentCategory";

export const CATEGORY_OPTIONS = STUDENT_CATEGORIES.map((c) => ({ title: c.value }));

export const FEE_TYPE_OPTIONS = [
  { title: "Monthly Fee" },
  { title: "Tuition Fee" },
  { title: "Meal Fee" },
  { title: "Seat Rent" },
  { title: "Day Care Fee" },
  { title: "Admission Fee" },
  { title: "Exam Fee" },
  { title: "Form Fee" },
];
