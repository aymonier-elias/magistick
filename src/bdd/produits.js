// Produits WooCommerce (lecture seule) — serveur uniquement.
// Les produits se créent / modifient / suppriment directement dans WooCommerce.
// À appeler depuis un Server Component : const { produits } = await getCatalogue(filtres);
import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { wc, wcAvecTotal } from './woocommerce';
import { urlModele3d } from './modeles3d';

// Valeurs acceptées pour le filtre de disponibilité
export const DISPONIBILITES = {
  instock: 'En stock',
  outofstock: 'Indisponible',
  onbackorder: 'En réapprovisionnement',
};

// Nombre >= 0, ou undefined si la valeur est vide / invalide
const nombrePositif = (valeur) => {
  if (valeur === undefined || valeur === null || valeur === '') return undefined;
  const n = Number(valeur);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

const idPositif = (valeur) => {
  const n = Number(valeur);
  return Number.isInteger(n) && n > 0 ? n : undefined;
};

// Filtres (tous optionnels), communs à getCatalogue et getFiltresDisponibles :
//   recherche     texte libre
//   categorie     ID de catégorie WooCommerce
//   prixMin       prix minimum
//   prixMax       prix maximum
//   disponibilite 'instock' | 'outofstock' | 'onbackorder'
//   attribut      { slug, terme } : slug de l'attribut (ex. 'pa_type_magie') et ID du terme.
//                 WooCommerce ne filtre que sur UN attribut à la fois.
function parametresFiltres({ recherche, categorie, prixMin, prixMax, disponibilite, attribut } = {}) {
  const params = { status: 'publish' }; // sinon WooCommerce renvoie aussi les brouillons et privés

  if (recherche) params.search = recherche;

  const idCategorie = idPositif(categorie);
  if (idCategorie) params.category = String(idCategorie);

  const min = nombrePositif(prixMin);
  const max = nombrePositif(prixMax);
  if (min !== undefined) params.min_price = String(min);
  if (max !== undefined) params.max_price = String(max);

  if (Object.hasOwn(DISPONIBILITES, disponibilite ?? '')) params.stock_status = disponibilite;

  const idTerme = idPositif(attribut?.terme);
  if (/^pa_[a-z0-9_-]+$/.test(attribut?.slug ?? '') && idTerme) {
    params.attribute = attribut.slug;
    params.attribute_term = String(idTerme);
  }

  return params;
}

// Produits publiés, paginés et filtrés. Ne lance jamais d'erreur.
// Renvoie { produits, total, totalPages, erreur } :
//   total      nombre de produits correspondant aux filtres (toutes pages confondues)
//   totalPages nombre de pages
// Chaque produit reçoit un champ modele3d : URL de son modèle 3D (champ WooCommerce
// « modele_3d », sinon public/), ou null (voir modeles3d.js).
// Exemple : await getCatalogue({ prixMax: 80, attribut: { slug: 'pa_type_magie', terme: 12 } })
export async function getCatalogue({ page = 1, parPage = 20, ...filtres } = {}) {
  const params = {
    ...parametresFiltres(filtres),
    page: Math.max(1, Number(page) || 1),
    per_page: Math.min(100, Math.max(1, Number(parPage) || 20)),
  };

  try {
    const { data, total, totalPages } = await wcAvecTotal((api) => api.get('products', params));
    return {
      produits: data.map((p) => ({ ...p, modele3d: urlModele3d(p) })),
      total,
      totalPages,
      erreur: null,
    };
  } catch (e) {
    console.error('Erreur catalogue :', e);
    return { produits: [], total: 0, totalPages: 0, erreur: 'Impossible de récupérer les produits.' };
  }
}

// Données qui changent rarement (attributs, prix max) : gardées en cache entre les requêtes au lieu d'interroger WooCommerce à chaque changement de filtre.
// Pour forcer la mise à jour : revalidateTag(TAG_CATALOGUE).
// (Next 16 recommande « use cache », qui exige d'activer cacheComponents.)
export const TAG_CATALOGUE = 'catalogue';
const CACHE_CATALOGUE = { revalidate: 3600, tags: [TAG_CATALOGUE] };

// Prix le plus élevé du catalogue (borne du curseur « Prix max »), ou 0.
const prixLePlusHaut = unstable_cache(async () => {
  const [produit] = await wc((api) =>
    api.get('products', { status: 'publish', orderby: 'price', order: 'desc', per_page: 1, _fields: 'price' })
  );
  return Math.ceil(Number(produit?.price) || 0);
}, ['prix-le-plus-haut'], CACHE_CATALOGUE);

// ---------------------------------------------------------------------------
// Filtres disponibles (qui s'adaptent entre eux)
// ---------------------------------------------------------------------------

// Tous les produits correspondant aux paramètres, seulement les champs utiles aux comptages
async function tousLesProduits(params) {
  const produits = [];
  for (let page = 1; ; page++) {
    const lot = await wc((api) =>
      api.get('products', { ...params, page, per_page: 100, _fields: 'id,categories,attributes' })
    );
    produits.push(...lot);
    if (lot.length < 100) return produits;
  }
}

// Attributs globaux et tous leurs termes (pour retrouver l'ID d'un terme depuis son nom)
const listerAttributs = unstable_cache(async () => {
  const attributs = await wc((api) => api.get('products/attributes'));
  return Promise.all(
    attributs.map(async (a) => ({
      id: a.id,
      slug: a.slug,
      nom: a.name,
      termes: await wc((api) =>
        api.get(`products/attributes/${a.id}/terms`, { per_page: 100, orderby: 'name', _fields: 'id,name' })
      ),
    }))
  );
}, ['attributs-produits'], CACHE_CATALOGUE);

// Options des menus de filtres, calculées selon les AUTRES filtres choisis :
// si « Eau » est choisi, seules les catégories contenant de l'eau sont proposées, et inversement.
// Chaque menu ignore son propre filtre, pour qu'on puisse changer de choix.
// La valeur actuellement choisie reste toujours proposée (même à 0).
//
// Renvoie {
//   categories:  [{ id, nom, nombre }],
//   attributs:   [{ slug, nom, termes: [{ id, nom, nombre }] }],
//   prixMaximum: prix le plus élevé du catalogue (borne du curseur de prix)
// }
// Renvoie des listes vides en cas d'erreur (le catalogue reste utilisable).
export async function getFiltresDisponibles(filtres = {}) {
  try {
    const paramsSansCategorie = parametresFiltres({ ...filtres, categorie: undefined });
    const paramsSansAttribut = parametresFiltres({ ...filtres, attribut: undefined });
    const memesParams = JSON.stringify(paramsSansCategorie) === JSON.stringify(paramsSansAttribut);

    const [pourCategories, pourAttributs, attributs, prixMaximum] = await Promise.all([
      tousLesProduits(paramsSansCategorie),
      memesParams ? null : tousLesProduits(paramsSansAttribut),
      listerAttributs(),
      prixLePlusHaut(),
    ]);

    // Catégories
    const categories = new Map();
    for (const produit of pourCategories) {
      for (const c of produit.categories) {
        const entree = categories.get(c.id) ?? { id: c.id, nom: c.name, nombre: 0 };
        entree.nombre++;
        categories.set(c.id, entree);
      }
    }
    const idCategorie = idPositif(filtres.categorie);
    if (idCategorie && !categories.has(idCategorie)) {
      categories.set(idCategorie, { id: idCategorie, nom: `Catégorie ${idCategorie}`, nombre: 0 });
    }

    // Termes d'attributs (les produits donnent le nom du terme, pas son ID)
    const nombres = new Map(); // "attributId:nom du terme" -> nombre
    for (const produit of pourAttributs ?? pourCategories) {
      for (const a of produit.attributes) {
        for (const option of a.options) {
          const cle = `${a.id}:${option}`;
          nombres.set(cle, (nombres.get(cle) ?? 0) + 1);
        }
      }
    }

    const termeChoisi = idPositif(filtres.attribut?.terme);
    return {
      categories: [...categories.values()].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
      attributs: attributs.map((a) => ({
        slug: a.slug,
        nom: a.nom,
        termes: a.termes
          .map((t) => ({ id: t.id, nom: t.name, nombre: nombres.get(`${a.id}:${t.name}`) ?? 0 }))
          .filter((t) => t.nombre > 0 || (filtres.attribut?.slug === a.slug && t.id === termeChoisi)),
      })),
      prixMaximum,
    };
  } catch (e) {
    console.error('Erreur filtres disponibles :', e);
    return { categories: [], attributs: [], prixMaximum: 0 };
  }
}

// Un produit publié, ou null s'il n'existe pas / n'est pas publié.
// React.cache : la page et generateMetadata partagent le même appel pendant une requête.
export const getProduitPublie = cache(async (id) => {
  if (!/^\d+$/.test(String(id))) return null;
  try {
    const produit = await wc((api) => api.get(`products/${id}`));
    return produit.status === 'publish' ? produit : null;
  } catch (e) {
    if (e.status === 404 || e.status === 400) return null;
    throw e;
  }
});
