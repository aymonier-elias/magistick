// src/app/boutique/[id]/page.jsx
import { notFound } from 'next/navigation';
import { lireProduit } from '@/lib/woocommerce-crud';
import '@/css/produits/produits.css';

export default async function Produit({ params }) {
  const { id } = await params;

  let produit;
  try {
    produit = await lireProduit(id);
  } catch (e) {
    if (e.status === 404) notFound();
    throw e;
  }

  if (produit.status !== 'publish') notFound();

  return (
    <div>
      <h1>{produit.name}</h1>
    </div>
  );
}