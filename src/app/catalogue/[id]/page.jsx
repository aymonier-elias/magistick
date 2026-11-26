import Image from 'next/image';
import { notFound } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { getProduitPublie } from '@/bdd/produits';
import { formatPrix } from '@/utils/format';
import '@/css/catalogue/produit.css';

// La description vient de WooCommerce en HTML : on la nettoie avant de l'afficher.
// sanitize-html n'utilise pas jsdom (qui exige une version récente de Node sur le serveur).
// Par défaut : pas de <script>, <style>, formulaires, attributs style / on* / data-*.
const OPTIONS_SANITIZE = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  // Un lien qui ouvre un nouvel onglet ne doit pas donner accès à notre page (window.opener)
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: attribs.target === '_blank' ? { ...attribs, rel: 'noopener noreferrer' } : attribs,
    }),
  },
};

// Texte brut d'une description HTML, pour la balise meta
const texteBrut = (html) => sanitizeHtml(html ?? '', { allowedTags: [], allowedAttributes: {} }).trim();

export async function generateMetadata({ params }) {
  const { id } = await params;
  const produit = await getProduitPublie(id);
  if (!produit) return {};

  return {
    title: `${produit.name} | Magistick`,
    description: texteBrut(produit.short_description || produit.description).slice(0, 160),
  };
}

export default async function Produit({ params }) {
  const { id } = await params;

  const produit = await getProduitPublie(id);
  if (!produit) notFound();

  const description = sanitizeHtml(produit.description, OPTIONS_SANITIZE);
  const image = produit.images[0];
  const prix = formatPrix(produit.price);

  return (
    <div>
      <h1 className="produit-titre">{produit.name}</h1>
      <div className="produit-corps">

        <div className="produit-image">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt || produit.name}
              width={800}
              height={800}
              sizes="(max-width: 900px) 100vw, 40vw"
              preload
            />
          ) : (
            <p>Aucune image disponible</p>
          )}
        </div>

        <div className="produit-infos">
          <span>Description</span>
          <div dangerouslySetInnerHTML={{ __html: description }} />

          <div className="produit-attributs">
            {produit.attributes.length > 0 ? (
              produit.attributes.map((attribut) => (
                <div key={attribut.id || attribut.name}>
                  {attribut.name}
                  {attribut.options.length > 0 ? (
                    <ul>
                      {attribut.options.map((option) => (
                        <li key={option}>{option}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))
            ) : (
              <p>Aucun Attribut</p>
            )}
          </div>

          <p>{prix ?? 'Prix non renseigné'}</p>
        </div>
      </div>
    </div>
  );
}
