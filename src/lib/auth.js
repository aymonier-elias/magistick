// Fonctions d'authentification côté serveur uniquement
// (Server Components, layouts, routes API).

import { cookies } from 'next/headers';

const ROLES_ADMIN = ['administrator', 'shop_manager'];

// Renvoie l'utilisateur WordPress connecté (avec ses rôles), ou null.
export async function getUtilisateurConnecte() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return null;

  const url = (process.env.WP_URL || process.env.WC_URL || '').replace(/\/+$/, '');
  if (!url) return null;

  try {
    const response = await fetch(`${url}/wp-json/wp/v2/users/me?context=edit`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      id: data.id,
      email: data.email,
      roles: Array.isArray(data.roles) ? data.roles : [],
    };
  } catch {
    return null;
  }
}

export function estAdmin(utilisateur) {
  return !!utilisateur?.roles.some((role) => ROLES_ADMIN.includes(role));
}
