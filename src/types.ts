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
  modelOfInterest: string; // Dynamic brands can lead to different model strings
  modelClaveGen?: string; // Corporate model lookup identifier
  disId?: string;
  crmSuccess?: boolean;
  crmResponseCode?: number;
  crmSolicitudId?: any;
  crmShiftDigitalId?: string;
  crmSentAt?: any;
  crmError?: string;
  status: LeadStatus;
  notes?: string;
  advisorId?: string;
  advisorName?: string;
  createdAt: any; // Firestore Timestamp
  attendedAt?: any; // Firestore Timestamp
  completedAt?: any; // Firestore Timestamp
  contactMethod?: string;
  requestType?: 'cotizacion' | 'prueba' | 'asesor';
  landing?: 'leapmotor' | 'jeep' | 'multimarca' | string;
  selectedBrand?: string;
  testDriveDate?: string;
  coordinatorNotes?: string;
}
