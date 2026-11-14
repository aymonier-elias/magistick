// La page /test-api n'existe que si ENABLE_TEST_PAGE vaut "true".
// En production, elle renvoie une 404.
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function TestApiLayout({ children }) {
  if (process.env.ENABLE_TEST_PAGE !== 'true') notFound();
  return children;
}
