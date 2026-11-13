// src/app/boutique/[id]/page.jsx
import { notFound } from 'next/navigation';
import { lireProduit } from '@/lib/woocommerce-crud';
import DOMPurify from 'isomorphic-dompurify';
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

  const descriptionClean = DOMPurify.sanitize(produit.description, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select"],
    FORBID_ATTR: ["style"],
    ALLOW_DATA_ATTR: false,
  });

  console.log(produit)

  if (produit.status !== 'publish') notFound();

  return (
    <div className="resultatProduit">

      <div className="imageProduit">
        <img src={produit.images.length > 0 ? produit.images[0].src : "a"} alt={produit.images[0] ? produit.images[0].alt : ""} />
      </div>

      <div className="infosProduit">
        <h1>{produit.name}</h1>
        <div>{produit.price} €</div>
        <div dangerouslySetInnerHTML={{ __html: descriptionClean }} />

        {/* Vérification des attributs et affichage */}
        <div className="attributsProduits">{produit.attributes.length > 0 ? (
          produit.attributes.map(attribut => (
            <div>
              {attribut.name}

              {/* Vérification des options et affichage */}
              {attribut.options.length > 0 ? (
                <div>
                  <ul>
                    {attribut.options.map(option => (
                      <li>{option}</li>
                    ))}
                  </ul>
                </div>
              ) : ("")}

            </div>
          ))) : ("Aucun Attribut")
        }</div>
      </div>
    </div>
  );
}