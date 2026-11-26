'use server';

// Server Actions des formulaires de connexion / inscription / déconnexion.
//
// ATTENTION : toute fonction exportée ici est appelable par n'importe qui
// (requête POST directe). N'y mettez que des actions publiques.

import { randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';
import { creerClient } from './clients';
import { demanderToken, ouvrirSession, fermerSession } from './auth';
import { texte, EMAIL_VALIDE } from './utils';

const EMAIL_DEJA_UTILISE = [
  'registration-error-email-exists',
  'woocommerce_rest_customer_invalid_email',
];

// Utilisé avec useActionState : renvoie { erreur } ou redirige vers l'accueil.
export async function connexion(etatPrecedent, formData) {
  const email = texte(formData, 'email').toLowerCase();
  const mdp = String(formData.get('mdp') ?? '');

  if (!email || !mdp) return { erreur: 'Identifiants manquants.' };

  let token;
  try {
    token = await demanderToken(email, mdp);
  } catch (e) {
    console.error('Erreur de connexion :', e);
    return { erreur: 'Erreur interne du serveur.' };
  }

  if (!token) return { erreur: 'Email ou mot de passe incorrect.' };

  await ouvrirSession(token);
  redirect('/');
}

// Utilisé avec useActionState : renvoie { erreur } / { message } ou redirige.
export async function inscription(etatPrecedent, formData) {
  const prenom = texte(formData, 'prenom');
  const nom = texte(formData, 'nom');
  const email = texte(formData, 'email').toLowerCase();
  const mdp = String(formData.get('mdp') ?? '');

  if (!prenom || !nom || !email || !mdp) return { erreur: 'Tous les champs sont obligatoires.' };
  if (!EMAIL_VALIDE.test(email)) return { erreur: 'Adresse email invalide.' };
  if (mdp.length < 8) return { erreur: 'Le mot de passe doit contenir au moins 8 caractères.' };

  // Identifiant WordPress unique, dérivé de l'email
  const identifiant =
    email.split('@')[0].replace(/[^a-z0-9_-]/g, '-') + '-' + randomUUID().slice(0, 8);

  let token;
  try {
    await creerClient({ email, motDePasse: mdp, prenom, nom, identifiant });
    // Connexion automatique ; le compte existe même si elle échoue
    token = await demanderToken(email, mdp).catch(() => null);
  } catch (e) {
    if (EMAIL_DEJA_UTILISE.includes(e.code)) {
      return { erreur: 'Cette adresse email possède déjà un compte.' };
    }
    console.error('Erreur inscription :', e);
    return { erreur: 'Une erreur est survenue lors de l’inscription.' };
  }

  if (!token) return { message: 'Compte créé ! Vous pouvez maintenant vous connecter.' };

  await ouvrirSession(token);
  redirect('/');
}

export async function deconnexion() {
  await fermerSession();
  redirect('/');
}
