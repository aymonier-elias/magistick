// Clients WooCommerce (utilisateurs de la boutique) — serveur uniquement.
import 'server-only';
import { wc } from './woocommerce';

export function listerClients({ page = 1, parPage = 20, recherche } = {}) {
  const params = { page, per_page: parPage };
  if (recherche) params.search = recherche;
  return wc((api) => api.get('customers', params));
}

export function lireClient(id) {
  return wc((api) => api.get(`customers/${encodeURIComponent(id)}`));
}

// Exemple : creerClient({ email: 'a@b.fr', motDePasse: '...', prenom: 'Léa', nom: 'Martin' })
export function creerClient({ email, motDePasse, prenom, nom, identifiant }) {
  const client = {
    email,
    first_name: prenom,
    last_name: nom,
    password: motDePasse,
  };
  // Sans identifiant, WooCommerce en génère un
  if (identifiant) client.username = identifiant;

  return wc((api) => api.post('customers', client));
}

// Ne passez que les champs à changer. Exemple : modifierClient(5, { prenom: 'Léa' })
export function modifierClient(id, { email, motDePasse, prenom, nom } = {}) {
  const changements = {};
  if (email !== undefined) changements.email = email;
  if (motDePasse !== undefined) changements.password = motDePasse;
  if (prenom !== undefined) changements.first_name = prenom;
  if (nom !== undefined) changements.last_name = nom;

  return wc((api) => api.put(`customers/${encodeURIComponent(id)}`, changements));
}

// WooCommerce exige force: true. Les commandes sont conservées (rattachées à un invité).
export function supprimerClient(id) {
  return wc((api) => api.delete(`customers/${encodeURIComponent(id)}`, { force: true }));
}
