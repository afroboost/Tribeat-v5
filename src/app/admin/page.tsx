/**
 * Page Admin Root - Redirection vers dashboard
 */

import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/dashboard');
}
