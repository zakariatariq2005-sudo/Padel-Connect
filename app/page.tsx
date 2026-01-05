import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';

/**
 * Home page - redirects to dashboard if logged in, otherwise to login
 */
export default async function Home() {
  const user = await getUser();
  
  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}


