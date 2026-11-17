// Produits WooCommerce (lecture seule) — serveur uniquement.
// Les produits se créent / modifient / suppriment directement dans WooCommerce.
// À appeler depuis un Server Component : const { produits } = await getCatalogue(filtres);
import 'server-only';
import { wc } from './woocommerce';

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

// Produits publiés, paginés et filtrés. Ne lance jamais d'erreur : renvoie { produits, erreur }.
// Exemple : await getCatalogue({ prixMax: 80, attribut: { slug: 'pa_type_magie', terme: 12 } })
export async function getCatalogue({ page = 1, parPage = 20, ...filtres } = {}) {
  const params = {
    ...parametresFiltres(filtres),
    page: Math.max(1, Number(page) || 1),
    per_page: Math.min(100, Math.max(1, Number(parPage) || 20)),
  };

  try {
    const produits = await wc((api) => api.get('products', params));
    return { produits, erreur: null };
  } catch (e) {
    console.error('Erreur catalogue :', e);
    return { produits: [], erreur: 'Impossible de récupérer les produits.' };
  }
}

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
async function listerAttributs() {
  const attributs = await wc((api) => api.get('products/attributes'));
  return Promise.all(
    attributs.map(async (a) => ({
      id: a.id,
      slug: a.slug,
      nom: a.name,
      termes: await wc((api) =>
        api.get(`products/attributes/${a.id}/terms`, { per_page: 100, orderby: 'name' })
      ),
    }))
  );
}

// Options des menus de filtres, calculées selon les AUTRES filtres choisis :
// si « Eau » est choisi, seules les catégories contenant de l'eau sont proposées, et inversement.
// Chaque menu ignore son propre filtre, pour qu'on puisse changer de choix.
// La valeur actuellement choisie reste toujours proposée (même à 0).
//
// Renvoie {
//   categories: [{ id, nom, nombre }],
//   attributs:  [{ slug, nom, termes: [{ id, nom, nombre }] }],
// }
// Renvoie des listes vides en cas d'erreur (le catalogue reste utilisable).
export async function getFiltresDisponibles(filtres = {}) {
  try {
    const paramsSansCategorie = parametresFiltres({ ...filtres, categorie: undefined });
    const paramsSansAttribut = parametresFiltres({ ...filtres, attribut: undefined });
    const memesParams = JSON.stringify(paramsSansCategorie) === JSON.stringify(paramsSansAttribut);

    const [pourCategories, pourAttributs, attributs] = await Promise.all([
      tousLesProduits(paramsSansCategorie),
      memesParams ? null : tousLesProduits(paramsSansAttribut),
      listerAttributs(),
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
    };
  } catch (e) {
    console.error('Erreur filtres disponibles :', e);
    return { categories: [], attributs: [] };
  }
}

// Un produit publié, ou null s'il n'existe pas / n'est pas publié.
export async function getProduitPublie(id) {
  try {
    const produit = await wc((api) => api.get(`products/${encodeURIComponent(id)}`));
    return produit.status === 'publish' ? produit : null;
  } catch (e) {
    if (e.status === 404 || e.status === 400) return null;
    throw e;
  }
}
