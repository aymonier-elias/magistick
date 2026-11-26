// Petites fonctions partagées par la couche bdd — serveur uniquement.
import 'server-only';

// Adresse du site WordPress / WooCommerce, sans « / » final
export const urlWordPress = () => (process.env.WC_URL || '').replace(/\/+$/, '');

// Options communes des cookies (jeton de session, jeton de panier)
export const optionsCookie = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge,
});

// Valeur texte d'un champ de formulaire, sans espaces autour
export const texte = (formData, nom) => String(formData.get(nom) ?? '').trim();

export const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
