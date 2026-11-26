'use client'; // Les error boundaries doivent être des Client Components

// Affiché quand une page plante (ex. WooCommerce injoignable).
// Le Header (layout) reste affiché.

import { useEffect } from 'react';
import Link from 'next/link';

export default function Erreur({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="page-erreur">
      <h1>Une erreur est survenue</h1>
      <p>La page n&apos;a pas pu être affichée. Réessayez dans un instant.</p>
      <div className="page-erreur-actions">
        <button type="button" onClick={() => retry()}>Réessayer</button>
        <Link href="/">Retour à l&apos;accueil</Link>
      </div>
    </section>
  );
}
