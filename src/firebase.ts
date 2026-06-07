/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Detect the environment at runtime and choose the database ID
// For local/dev/preview environments in AI studio, we use "aistudio"
// For production environment, we use "main"
// We also allow overriding this via VITE_FIRESTORE_DB_ID
let dbId = import.meta.env.VITE_FIRESTORE_DB_ID;

if (!dbId) {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDevEnvironment =
    import.meta.env.DEV ||
    hostname.includes('localhost') ||
    hostname.includes('ais-dev') ||
    hostname.includes('ais-pre') ||
    hostname.includes('127.0.0.1');

  if (isDevEnvironment) {
    dbId = 'aistudio';
  } else {
    dbId = 'main';
  }
}

console.log(`[Firebase] Initializing database instance: "${dbId}"`);

export const db = getFirestore(app, dbId); /* CRITICAL: The app will break without this line */
export const auth = getAuth();

// Error Handling Infrastructure as mandated by Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown, 
  operationType: OperationType, 
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL CONSTRAINT: Validate Connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connection Verified.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or network status (client offline).");
    } else {
      console.log("Firebase Connection Active (document check handled).");
    }
  }
}

testConnection();
