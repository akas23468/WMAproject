export interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'Lost' | 'Found' | 'Resolved';
  location: string;
  date: string;
  contact: string;
  imageUrl: string;
  userId: string;
  userName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  token?: string;
}

export const CATEGORIES = [
  'All',
  'Documents',
  'Electronics',
  'Accessories',
  'Books',
  'Clothing',
  'Other',
] as const;

export const CAMPUS_LOCATIONS = [
  'VIVA Institute Main Gate',
  'Mathematics Classroom (Room 204)',
  'Central Library Outside Stand',
  'Campus Main Canteen',
  'Computer Lab 3 (2nd Floor)',
  'CS Dept Reading Room',
  'Auditorium Hall A & B',
  'Sports Ground & Gymkhana',
  'Student Parking Lot',
];
