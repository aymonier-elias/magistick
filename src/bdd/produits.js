// Produits WooCommerce (lecture seule) — serveur uniquement.
// Les produits se créent / modifient / suppriment directement dans WooCommerce.
// À appeler depuis un Server Component : const { produits } = await getCatalogue();
import 'server-only';
import { wc } from './woocommerce';

// Produits publiés, paginés. Ne lance jamais d'erreur : renvoie { produits, erreur }.
export async function getCatalogue({ page = 1, parPage = 20, recherche, categorie } = {}) {
  const params = {
    status: 'publish', // sinon WooCommerce renvoie aussi les brouillons et privés
    page: Math.max(1, Number(page) || 1),
    per_page: Math.min(100, Math.max(1, Number(parPage) || 20)),
  };
  if (recherche) params.search = recherche;
  if (categorie) params.category = categorie;

  try {
    const produits = await wc((api) => api.get('products', params));
    return { produits, erreur: null };
  } catch (e) {
    console.error('Erreur catalogue :', e);
    return { produits: [], erreur: 'Impossible de récupérer les produits.' };
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
