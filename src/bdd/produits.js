// Produits WooCommerce (lecture seule) — serveur uniquement.
// Les produits se créent / modifient / suppriment directement dans WooCommerce.
// À appeler depuis un Server Component : const { produits } = await getCatalogue();
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

// Produits publiés, paginés et filtrés. Ne lance jamais d'erreur : renvoie { produits, erreur }.
//
// Filtres (tous optionnels) :
//   recherche     texte libre
//   categorie     ID de catégorie WooCommerce (voir getCategories)
//   prixMin       prix minimum
//   prixMax       prix maximum
//   disponibilite 'instock' | 'outofstock' | 'onbackorder'
//
// Exemple : await getCatalogue({ prixMin: 20, prixMax: 80, categorie: 15, disponibilite: 'instock' })
export async function getCatalogue({
  page = 1,
  parPage = 20,
  recherche,
  categorie,
  prixMin,
  prixMax,
  disponibilite,
} = {}) {
  const params = {
    status: 'publish', // sinon WooCommerce renvoie aussi les brouillons et privés
    page: Math.max(1, Number(page) || 1),
    per_page: Math.min(100, Math.max(1, Number(parPage) || 20)),
  };

  if (recherche) params.search = recherche;

  const idCategorie = Number(categorie);
  if (Number.isInteger(idCategorie) && idCategorie > 0) params.category = String(idCategorie);

  const min = nombrePositif(prixMin);
  const max = nombrePositif(prixMax);
  if (min !== undefined) params.min_price = String(min);
  if (max !== undefined) params.max_price = String(max);

  if (Object.hasOwn(DISPONIBILITES, disponibilite ?? '')) params.stock_status = disponibilite;

  try {
    const produits = await wc((api) => api.get('products', params));
    return { produits, erreur: null };
  } catch (e) {
    console.error('Erreur catalogue :', e);
    return { produits: [], erreur: 'Impossible de récupérer les produits.' };
  }
}

// Catégories qui contiennent au moins un produit : [{ id, nom, nombre }].
// Renvoie [] en cas d'erreur (le catalogue reste utilisable sans filtre).
export async function getCategories() {
  try {
    const categories = await wc((api) =>
      api.get('products/categories', { per_page: 100, hide_empty: true, orderby: 'name' })
    );
    return categories.map((c) => ({ id: c.id, nom: c.name, nombre: c.count }));
  } catch (e) {
    console.error('Erreur catégories :', e);
    return [];
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
