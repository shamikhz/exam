import * as admin from 'firebase-admin';

const isConfigured = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length && isConfigured) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace literal \n with actual newline characters
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
  }
}

let adminAuthInstance: admin.auth.Auth | null = null;

export const getAdminAuth = () => {
  if (!adminAuthInstance) {
    if (!admin.apps.length) {
      throw new Error("Firebase Admin not initialized. Ensure environment variables are set.");
    }
    adminAuthInstance = admin.auth();
  }
  return adminAuthInstance;
};
