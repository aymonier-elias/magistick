import { notFound } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { getProduitPublie } from '@/bdd/produits';
import '@/css/catalogue/catalogue.css';

export default async function Produit({ params }) {
  const { id } = await params;

  const produit = await getProduitPublie(id);
  if (!produit) notFound();

  // La description vient de WooCommerce en HTML : on la nettoie avant de l'afficher.
  // sanitize-html n'utilise pas jsdom (qui exige une version récente de Node sur le serveur).
  // Par défaut : pas de <script>, <style>, formulaires, attributs style / on* / data-*.
  const descriptionClean = sanitizeHtml(produit.description, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
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
