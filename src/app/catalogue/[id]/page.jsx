import Image from 'next/image';
import { notFound } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { getProduitPublie } from '@/bdd/produits';
import '@/css/catalogue/catalogue.css';

export default async function Produit({ params }) {
  const { id } = await params;

  const produit = await getProduitPublie(id);
  if (!produit) notFound();

  const description = sanitizeHtml(produit.description, OPTIONS_SANITIZE);
  const image = produit.images[0];

  console.log(produit);

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

          <div>{produit.price} €</div>
        </div>
      </div>
    </div>
  );
}
