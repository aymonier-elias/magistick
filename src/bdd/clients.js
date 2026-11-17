// Clients WooCommerce — serveur uniquement.
// Seule la création (inscription) passe par le site ; le reste se gère dans WooCommerce.
import 'server-only';
import { wc } from './woocommerce';

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
