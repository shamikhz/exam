import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const adminAuth = getAdminAuth();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Attempt to find the user in Firebase Auth by email
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        // User not in Firebase Auth, but might be in our localStorage.
        // We can just return success so the client continues with deleting from localStorage.
        return NextResponse.json({ success: true, message: 'User not found in Firebase Auth, assuming already deleted.' });
      }
      throw err;
    }

    // If found, delete them
    await adminAuth.deleteUser(userRecord.uid);

    return NextResponse.json({ success: true, message: 'Successfully deleted user from Firebase Auth.' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
