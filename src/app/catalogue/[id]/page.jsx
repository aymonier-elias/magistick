import { notFound } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import { getProduitPublie } from '@/bdd/produits';
import '@/css/produits/produits.css';

export default async function Produit({ params }) {
  const { id } = await params;

  const produit = await getProduitPublie(id);
  if (!produit) notFound();

  // La description vient de WooCommerce en HTML : on la nettoie avant de l'afficher
  const descriptionClean = DOMPurify.sanitize(produit.description, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select"],
    FORBID_ATTR: ["style"],
    ALLOW_DATA_ATTR: false,
  });

  const image = produit.images[0];

  return (
    <div className="resultatProduit">

      <div className="imageProduit">
        {image ? (
          <img src={image.src} alt={image.alt || produit.name} />
        ) : (
          <p>Aucune image disponible</p>
        )}
      </div>

      <div className="infosProduit">
        <h1>{produit.name}</h1>
        <div>{produit.price} €</div>
        <div dangerouslySetInnerHTML={{ __html: descriptionClean }} />

        {/* Vérification des attributs et affichage */}
        <div className="attributsProduits">{produit.attributes.length > 0 ? (
          produit.attributes.map(attribut => (
            <div key={attribut.id || attribut.name}>
              {attribut.name}

              {/* Vérification des options et affichage */}
              {attribut.options.length > 0 ? (
                <div>
                  <ul>
                    {attribut.options.map(option => (
                      <li key={option}>{option}</li>
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
