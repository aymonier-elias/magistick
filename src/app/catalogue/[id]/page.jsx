import { notFound } from 'next/navigation';
import { getProduitPublie } from '@/bdd/produits';
import '@/css/produits/produits.css';

export default async function Produit({ params }) {
  const { id } = await params;

  const produit = await getProduitPublie(id);
  if (!produit) notFound();

  return (
    <div>
      <h1>{produit.name}</h1>
    </div>
  );
}
