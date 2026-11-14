// Session utilisateur WordPress (JWT dans un cookie httpOnly) — serveur uniquement.
// Équivalent de l'ancien hook useAuth : const utilisateur = await getUtilisateurConnecte();
import 'server-only';
import { cookies } from 'next/headers';

const COOKIE = 'auth_token';
const ROLES_ADMIN = ['administrator', 'shop_manager'];

const wordpressUrl = () => (process.env.WC_URL || '').replace(/\/+$/, '');

// Utilisateur connecté { id, email, first_name, last_name, roles }, ou null.
export async function getUtilisateurConnecte() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${wordpressUrl()}/wp-json/wp/v2/users/me?context=edit`, {
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
      roles: Array.isArray(data.roles) ? data.roles : [],
    };
  } catch {
    return null;
  }
}

export function estAdmin(utilisateur) {
  return !!utilisateur?.roles.some((role) => ROLES_ADMIN.includes(role));
}

// Échange email + mot de passe contre un token JWT (ou null si refusé).
export async function demanderToken(email, mdp) {
  const response = await fetch(`${wordpressUrl()}/wp-json/jwt-auth/v1/token`, {
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
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function fermerSession() {
  (await cookies()).delete(COOKIE);
}
