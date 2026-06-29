import { redirect } from 'next/navigation';

/** Root redirects straight to the docs - no separate landing page. */
export default function HomePage() {
  redirect('/docs');
}
