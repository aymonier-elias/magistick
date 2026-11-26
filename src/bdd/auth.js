// Session utilisateur WordPress (JWT dans un cookie httpOnly) — serveur uniquement.
// Équivalent de l'ancien hook useAuth : const utilisateur = await getUtilisateurConnecte();
import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { urlWordPress, optionsCookie } from './utils';

const COOKIE = 'auth_token';
const DUREE_COOKIE = 60 * 60 * 24 * 7; // 7 jours

// Utilisateur connecté { id, email, first_name, last_name }, ou null.
// React.cache : un seul appel à WordPress par requête, même si le Header
// et la page le demandent tous les deux.
export const getUtilisateurConnecte = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${urlWordPress()}/wp-json/wp/v2/users/me?context=edit`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;

    const data = await response.json();
    return {
      id: data.id,
      email: data.email,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
    };
  } catch {
    return null;
  }
});

// Échange email + mot de passe contre un token JWT (ou null si refusé).
export async function demanderToken(email, mdp) {
  const response = await fetch(`${urlWordPress()}/wp-json/jwt-auth/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password: mdp }),
    cache: 'no-store',
  });
  const data = await response.json();
  return response.ok && data.token ? data.token : null;
}

// À appeler uniquement depuis une Server Action (les cookies n'y sont modifiables que là).
export async function ouvrirSession(token) {
  (await cookies()).set(COOKIE, token, optionsCookie(DUREE_COOKIE));
}

export async function fermerSession() {
  (await cookies()).delete(COOKIE);
}
