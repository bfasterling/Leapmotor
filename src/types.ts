/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum LeadStatus {
  WAITING = 'waiting',
  ATTENDING = 'attending',
  ATTENDED = 'attended',
  LOST = 'lost'
}

export interface Lead {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string;
  postalCode?: string;
  state: string;
  distributor: string;
  modelOfInterest: 'B10' | 'T03' | 'C10' | 'C11' | 'C16';
  status: LeadStatus;
  notes?: string;
  advisorId?: string;
  advisorName?: string;
  createdAt: any; // Firestore Timestamp
  attendedAt?: any; // Firestore Timestamp
  completedAt?: any; // Firestore Timestamp
  contactMethod?: string;
  requestType?: 'cotizacion' | 'prueba' | 'asesor';
}
