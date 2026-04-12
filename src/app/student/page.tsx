import { redirect } from 'next/navigation';

// The student login is now handled by the unified /auth page
export default function StudentLoginRedirect() {
  redirect('/auth');
}
