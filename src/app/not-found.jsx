import Link from 'next/link';

export const metadata = {
  title: 'Page introuvable | Magistick',
};

// Affiché pour une URL inconnue ou un notFound() (ex. produit inexistant)
export default function PageIntrouvable() {
  return (
    <section className="page-erreur">
      <h1>Page introuvable</h1>
      <p>Cette page n&apos;existe pas ou n&apos;est plus disponible.</p>
      <div className="page-erreur-actions">
        <Link href="/catalogue">Voir le catalogue</Link>
        <Link href="/">Retour à l&apos;accueil</Link>
      </div>
    </section>
  );
}
