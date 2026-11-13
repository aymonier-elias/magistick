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

  console.log(produit)

  if (produit.status !== 'publish') notFound();

  return (
    <div className="resultatProduit">

      <div className="imageProduit">
        <img src={produit.images[0] ? produit.images[0].src : "a"} alt={produit.images[0] ? produit.images[0].alt : ""} />
      </div>

      <div className="infosProduit">
        <h1>{produit.name}</h1>
        <div>{produit.price} €</div>
        <div>{produit.description}</div>
      </div>
    </div>
  );
}