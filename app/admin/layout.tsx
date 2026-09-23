import { notFound } from 'next/navigation';
import { requireMasterAdmin } from '@/modules/auth/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireMasterAdmin();
  } catch {
    notFound();
  }

  return children;
}
