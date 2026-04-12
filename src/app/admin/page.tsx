import { redirect } from 'next/navigation';

// The admin login is now handled by the unified /auth page
export default function AdminLoginRedirect() {
  redirect('/auth');
}
