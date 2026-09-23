import { redirect } from 'next/navigation';

export default function LegacyVisitorAuthRedirect() {
  redirect('/cadastro');
}
