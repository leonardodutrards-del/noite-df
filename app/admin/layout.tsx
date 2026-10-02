import { notFound, redirect } from 'next/navigation';
import { requireMasterAdmin } from '@/modules/auth/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireMasterAdmin();
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      redirect('/login?redirect=/admin');
    }
    notFound();
  }

  return children;
}
