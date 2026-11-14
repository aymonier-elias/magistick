// Protège toutes les pages sous /admin :
// - non connecté -> redirection vers /connexion
// - connecté mais pas admin / gérant de boutique -> 404
import { redirect, notFound } from 'next/navigation';
import { getUtilisateurConnecte, estAdmin } from '@/bdd/auth';

export default async function AdminLayout({ children }) {
  const utilisateur = await getUtilisateurConnecte();

  if (!utilisateur) redirect('/connexion');
  if (!estAdmin(utilisateur)) notFound();

  return children;
}
