// Produits WooCommerce — serveur uniquement.
// À appeler directement depuis un Server Component : const { produits } = await getCatalogue();
import 'server-only';
import { wc } from './woocommerce';

// ===========================================================================
// LECTURE (site public)
// ===========================================================================

// Équivalent de l'ancien hook useProducts : ne lance jamais d'erreur,
// renvoie { produits, erreur } prêt à afficher.
// Uniquement les produits publiés.
export async function getCatalogue({ page = 1, parPage = 20, recherche, categorie } = {}) {
  try {
    const produits = await listerProduits({
      page,
      parPage,
      recherche,
      categorie,
      statut: 'publish',
    });
    return { produits, erreur: null };
  } catch (e) {
    console.error('Erreur catalogue :', e);
    return { produits: [], erreur: 'Impossible de récupérer les produits.' };
  }
}

// Un produit publié, ou null s'il n'existe pas / n'est pas publié.
export async function getProduitPublie(id) {
  try {
    const produit = await lireProduit(id);
    return produit.status === 'publish' ? produit : null;
  } catch (e) {
    if (e.status === 404 || e.status === 400) return null;
    throw e;
  }
}

// ===========================================================================
// CRUD (admin / page de test) — lancent une erreur si WooCommerce refuse
// ===========================================================================

// Sans statut, WooCommerce renvoie TOUS les produits (brouillons, privés...)
export function listerProduits({ page = 1, parPage = 20, recherche, categorie, statut } = {}) {
  const params = {
    page: Math.max(1, Number(page) || 1),
    per_page: Math.min(100, Math.max(1, Number(parPage) || 20)),
  };

  if (statut) params.status = statut;
  if (recherche) params.search = recherche;
  if (categorie) params.category = categorie;

  return wc((api) => api.get('products', params));
}

export function lireProduit(id) {
  return wc((api) => api.get(`products/${encodeURIComponent(id)}`));
}

// Exemple : creerProduit({ nom: 'Bâton de feu', prix: 49.99 })
export function creerProduit({
  nom,
  prix,
  description = '',
  stock,
  modele3d,
  couleurHex,
  publie = true,
}) {
  const produit = {
    name: nom,
    type: 'simple',
    regular_price: String(prix),
    description,
    status: publie ? 'publish' : 'draft',
    meta_data: [],
  };

  if (stock !== undefined) {
    produit.manage_stock = true;
    produit.stock_quantity = stock;
  }
  if (modele3d) produit.meta_data.push({ key: 'model_3d', value: modele3d });
  if (couleurHex) produit.meta_data.push({ key: 'couleur_hex', value: couleurHex });

  return wc((api) => api.post('products', produit));
}

// Ne passez que les champs à changer. Exemple : modifierProduit(16, { prix: 59.99 })
export function modifierProduit(id, { nom, prix, description, stock, modele3d, couleurHex, publie } = {}) {
  const changements = {};

  if (nom !== undefined) changements.name = nom;
  if (prix !== undefined) changements.regular_price = String(prix);
  if (description !== undefined) changements.description = description;
  if (publie !== undefined) changements.status = publie ? 'publish' : 'draft';
  if (stock !== undefined) {
    changements.manage_stock = true;
    changements.stock_quantity = stock;
  }

  const meta = [];
  if (modele3d !== undefined) meta.push({ key: 'model_3d', value: modele3d });
  if (couleurHex !== undefined) meta.push({ key: 'couleur_hex', value: couleurHex });
  if (meta.length > 0) changements.meta_data = meta;

  return wc((api) => api.put(`products/${encodeURIComponent(id)}`, changements));
}

// definitif = false : corbeille ; true : suppression définitive
export function supprimerProduit(id, { definitif = false } = {}) {
  return wc((api) => api.delete(`products/${encodeURIComponent(id)}`, { force: definitif }));
}
